(() => {
  'use strict';
  // Consumer presentation only. Geographic picks are search intent, never Place truth.
  const VERSION = '2.6.0-geographic-labels';
  const PI = Math.PI, RAD = PI / 180;
  const ESC = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  let geography;
  const load = () => geography ||= fetch('assets/composer/world-countries.json', {cache:'force-cache'})
    .then(response => { if (!response.ok) throw Error('WORLD_GEOGRAPHY_UNAVAILABLE'); return response.json(); })
    .catch(error => { geography = null; throw error; });
  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  function geographicTrace(view,points={}){
    return ['continent','country','region','destination'].flatMap((key,index)=>{const point=points[key];if(view.level<index+1||!point||!Array.isArray(point.coordinates)||point.coordinates.length!==2||!point.coordinates.every(Number.isFinite))return [];return [{...point,kind:key}];});
  }
  function project(lng, lat, yaw, pitch) {
    const a = lng * RAD, b = lat * RAD, x = Math.cos(b)*Math.sin(a), y = Math.sin(b), z = Math.cos(b)*Math.cos(a);
    const k = Math.sin(yaw)*x + Math.cos(yaw)*z;
    return {x:Math.cos(yaw)*x-Math.sin(yaw)*z,y:Math.cos(pitch)*y-Math.sin(pitch)*k,z:Math.sin(pitch)*y+Math.cos(pitch)*k};
  }
  function unproject(x, y, yaw, pitch) {
    if (x*x+y*y > 1) return null;
    const z=Math.sqrt(1-x*x-y*y), k=Math.cos(pitch)*z-Math.sin(pitch)*y;
    return {lng:Math.atan2(Math.cos(yaw)*x+Math.sin(yaw)*k,-Math.sin(yaw)*x+Math.cos(yaw)*k)/RAD,
      lat:Math.asin(clamp(Math.sin(pitch)*z+Math.cos(pitch)*y,-1,1))/RAD};
  }
  function inRing(lng, lat, ring) {
    let inside=false;
    for(let i=0,j=ring.length-1;i<ring.length;j=i++) {
      const [xi,yi]=ring[i],[xj,yj]=ring[j];
      if((yi>lat)!==(yj>lat)&&lng<(xj-xi)*(lat-yi)/(yj-yi)+xi)inside=!inside;
    }
    return inside;
  }
  function countryAt(features, lng, lat) {
    // A small detailed country can overlap its coarse neighbouring outline.
    // Prefer the containing polygon with the smallest area, never hide microstates.
    let found,size=Infinity;
    for(const feature of features)for(const polygon of feature.geometry.type==='Polygon'?[feature.geometry.coordinates]:feature.geometry.coordinates){
      const ring=polygon[0];if(!inRing(lng,lat,ring)||polygon.slice(1).some(hole=>inRing(lng,lat,hole)))continue;
      let area=0;for(let i=1;i<ring.length;i++)area+=ring[i-1][0]*ring[i][1]-ring[i][0]*ring[i-1][1];
      if(Math.abs(area)<size){size=Math.abs(area);found=feature;}
    }return found;
  }
  const CONTINENTS=[['Europe','Europa',15,48],['Asia','Asien',100,35],['North America','Nordamerika',-100,35],['South America','Südamerika',-60,-15],['Africa','Afrika',20,0],['Oceania','Ozeanien',135,-25],['Antarctica','Antarktis',0,-78]];
  function fitGeography(d3,feature,width,height,{usa=false}={}){
    const extent=[[24,24],[width-24,height-30]];
    if(usa)return d3.geoAlbersUsa().fitExtent(extent,feature);
    const bounds=d3.geoBounds(feature),west=bounds[0][0],east=bounds[1][0],mid=(west+(east<west?east+360:east))/2;
    const projection=bounds[0][1]<-85?d3.geoAzimuthalEqualArea().rotate([0,90]):d3.geoMercator().rotate([-mid,0]);
    return projection.fitExtent(extent,feature);
  }
  let projectionLibrary,continentGeography,regionCache=new Map();
  const loadProjection=()=>projectionLibrary||=(import(new URL('vendor/d3-7.9.0.min.js',document.baseURI).href).then(()=>window.d3).catch(error=>{projectionLibrary=null;throw error;}));
  const loadContinents=()=>continentGeography||=(fetch('assets/composer/world-continents.json',{cache:'force-cache'}).then(r=>{if(!r.ok)throw Error('CONTINENTS_UNAVAILABLE');return r.json();}).catch(error=>{continentGeography=null;throw error;}));
  function loadRegions(code){if(!/^[A-Z0-9]{3}$/.test(code||''))return Promise.resolve([]);if(!regionCache.has(code))regionCache.set(code,fetch('assets/composer/regions/'+code+'.json',{cache:'force-cache'}).then(r=>r.status===404?{features:[]}:r.ok?r.json():Promise.reject(Error('REGIONS_UNAVAILABLE'))).then(d=>d.features||[]).catch(error=>{regionCache.delete(code);throw error;}));return regionCache.get(code);}
  function markup({interactive=true}={}){
    return `<nav class="lx-breadcrumb" aria-label="Kartenebenen"><button type="button" data-world-back="0">Welt</button></nav><div class="lx-world ftc-atlas" data-ftc-atlas><div class="ftc-atlas-surface"><svg class="lx-geography" data-ftc-world-canvas tabindex="0" role="img" aria-label="Interaktive Weltkarte. Ziehen zum Drehen, zwei Finger zum Zoomen. Pfeiltasten bewegen, Plus und Minus zoomen. Einmal auswählen, erneut berühren zum Öffnen. Länder und Regionen sind auch als Liste erreichbar."></svg><div class="lx-pins ftc-atlas-points"></div></div><span class="lx-map-note" data-world-status role="status">Die Welt öffnet sich …</span><span class="lx-credit">Natural Earth · geografische Übersicht</span></div>`;
  }
  function mount(host,{onPick=()=>{},onView=()=>{},onNavigate=()=>{},onSettled=()=>{},onIntent=()=>{},view:initial={},selection=null,interactive=true,accent='#c95169',reducedMotion=false}={}){
    if(!host)return null;const canvas=host.querySelector('[data-ftc-world-canvas]'),status=host.querySelector('[data-world-status]');if(!canvas)return null;
    const surface=host.querySelector('.ftc-atlas-surface')||canvas,scope=host.closest?.('.lx-window')||host.parentElement||host;
    const initialLevel=Number(initial.level||0);
    const view={yaw:Number(initial.yaw??-12*RAD),pitch:Number(initial.pitch??18*RAD),zoom:Number(initial.zoom??1),panX:Number(initial.panX||0),panY:Number(initial.panY||0),level:initialLevel,continent:initialLevel>0?(initial.continent||''):'',country:initial.country||'',region:initial.region||'',pending:initial.pending||null};
    if(host.dataset){host.dataset.worldLevel=String(initialLevel);host.dataset.worldReady='loading';}
    if(selection?.placeId&&initialLevel>=4)status.textContent=selection.name+' · euer Reiseziel';
    let alive=true,features=[],regions=[],continents=[],towns=[],d3=null,projection=null,frame=0,flight=0,dragged=false,pinchDistance=0,handledPointer=false,loadSequence=0,selectionChanged=false,transitioning=false,navigationSequence=0,tourSequence=0,zoomBackAt=0;
    const pointers=new Map(),cleanup=[];
    const listen=(target,event,handler,options)=>{if(!target)return;target.addEventListener(event,handler,options);cleanup.push(()=>target.removeEventListener(event,handler,options));};
    const request=()=>{if(alive&&!frame)frame=requestAnimationFrame(paint);};
    const country=()=>features.find(f=>f.properties.code===view.country);
    const region=()=>regions.find(f=>f.properties.code===view.region);
    const center=feature=>d3.geoCentroid(feature);
    const major=feature=>{if(feature?.geometry.type!=='MultiPolygon')return feature;return {...feature,geometry:{type:'Polygon',coordinates:[...feature.geometry.coordinates].sort((a,b)=>d3.geoArea({type:'Polygon',coordinates:b})-d3.geoArea({type:'Polygon',coordinates:a}))[0]}};};
    const pause=ms=>new Promise(resolve=>setTimeout(resolve,ms));
    async function navigate(change,{notify=false}={}){
      const seq=++navigationSequence;transitioning=true;const oldView={...view};
      let nextRegions=regions;try{if(change.country&&change.country!==view.country)nextRegions=await loadRegions(change.country);}catch{transitioning=false;status.textContent='Diese Regionen konnten gerade nicht geladen werden. Bitte erneut versuchen.';return false;}
      if(!alive||seq!==navigationSequence)return false;
      const ghost=canvas.cloneNode?.(true);if(ghost){ghost.removeAttribute('data-ftc-world-canvas');ghost.removeAttribute('tabindex');ghost.setAttribute('aria-hidden','true');ghost.classList.add('lx-map-transition');surface.append(ghost);}
      Object.assign(view,change);view.pending=null;view.zoom=1;view.panX=0;view.panY=0;regions=nextRegions;
      if(view.level<2)regions=[];controls();paint();onView({...view});onNavigate({...view});
      if(!reducedMotion){const inward=view.level>oldView.level;canvas.animate?.([{opacity:.58,transform:inward?'scale(.965)':'scale(1.035)'},{opacity:1,transform:'scale(1)'}],{duration:520,easing:'cubic-bezier(.22,.7,.2,1)'});ghost?.animate?.([{opacity:1,filter:'blur(0px)',transform:'scale(1)'},{opacity:0,filter:'blur(3px)',transform:inward?'scale(1.045)':'scale(.955)'}],{duration:500,easing:'cubic-bezier(.22,.7,.2,1)',fill:'forwards'});await pause(540);}
      ghost?.remove();if(!alive||seq!==navigationSequence)return false;transitioning=false;if(notify)onSettled({...view,regionCount:regions.length,regionName:region()?.properties.name,countryName:country()?.properties.name});return true;
    }
    function backLevel(){if(transitioning||view.level<=0)return false;tourSequence++;const level=view.level-1;navigate({level,...(level<2?{country:'',region:''}:level<3?{region:''}:{})});return true;}
    function zoomBy(factor){if(transitioning)return;const zoom=view.zoom*factor;if(factor<1&&zoom<.82&&view.level>0&&Date.now()-zoomBackAt>1000){zoomBackAt=Date.now();backLevel();return;}view.zoom=clamp(zoom,.65,2.5);request();}
    async function travelTo(destination){
      const seq=++tourSequence;await ready;if(!alive||seq!==tourSequence)return false;const lat=Number(destination.latitude),lng=Number(destination.longitude),target=countryAt(features,lng,lat);if(!target)return false;
      selection=null;view.pending=null;await navigate({level:0,country:'',region:'',continent:target.properties.continent,yaw:lng*RAD,pitch:lat*RAD});
      for(const change of [{level:1,continent:target.properties.continent},{level:2,country:target.properties.code,continent:target.properties.continent}]){if(!alive||seq!==tourSequence)return false;if(!await navigate(change))return false;}
      const local=countryAt(regions,lng,lat);if(local){if(!alive||seq!==tourSequence)return false;await navigate({level:3,region:local.properties.code});}
      if(!alive||seq!==tourSequence)return false;selection=destination;return navigate({level:4,pending:null});
    }
    async function arrive(destination){const seq=++tourSequence;await ready;if(!alive||seq!==tourSequence)return false;const lng=Number(destination.longitude),lat=Number(destination.latitude),target=countryAt(features,lng,lat);if(!target)return false;let local=[];try{local=await loadRegions(target.properties.code);}catch{}if(!alive||seq!==tourSequence)return false;selection=destination;const area=countryAt(local,lng,lat);return navigate({level:4,continent:target.properties.continent,country:target.properties.code,region:area?.properties.code||'',pending:null});}
    function selectedFeature(){const p=view.pending;return !p?null:p.kind==='continent'?continents.find(f=>f.properties.code===p.code):p.kind==='country'?features.find(f=>f.properties.code===p.code):regions.find(f=>f.properties.code===p.code);}
    function confirmSelection(){const p=view.pending;if(!p)return;if(p.kind==='continent')navigate({level:1,continent:p.code,country:'',region:''},{notify:true});else if(p.kind==='country'){const f=selectedFeature();navigate({level:2,country:p.code,continent:f?.properties.continent||view.continent,region:''},{notify:true});}else navigate({level:3,region:p.code},{notify:true});}
    function select(kind,code,name){if(!interactive||!code||transitioning)return;if(view.pending?.kind===kind&&view.pending.code===code){confirmSelection();return;}view.pending={kind,code,name};selectionChanged=true;onView({...view});controls();request();}
    function selectContinent(code){const c=CONTINENTS.find(c=>c[0]===code);if(c)select('continent',c[0],c[1]);}
    function choose(feature){if(!feature)return;if(view.level===0)selectContinent(feature.properties.continent);else select(view.level===1?'country':'region',feature.properties.code,feature.properties.name);}
    function primary(){if(!interactive||transitioning)return;if(view.pending){confirmSelection();return;}if(view.level<2)return;const target=region()||country();if(target){const [lng,lat]=center(target);onPick({name:target.properties.name,lng,lat});}}
    function pickMarker(button){if(button.dataset.country)choose(features.find(f=>f.properties.code===button.dataset.country));else if(button.dataset.region)choose(regions.find(f=>f.properties.code===button.dataset.region));else if(button.dataset.continent)selectContinent(button.dataset.continent);else if(button.dataset.worldPoint&&interactive)onPick({name:button.dataset.worldPoint,lng:Number(button.dataset.lng),lat:Number(button.dataset.lat)});}
    function drawGeographyLabels(svg,path,width,height,currentCountry,currentRegion){
      const compact=width<620,occupied=[],labelLayer=svg.append('g').attr('class','lx-geography-labels').attr('aria-hidden','true');let candidates=[];
      if(view.level===0)candidates=CONTINENTS.map(item=>({name:item[1],coordinates:[item[2],item[3]],kind:'continent'})).filter(item=>d3.geoDistance([view.yaw/RAD,view.pitch/RAD],item.coordinates)<1.25);
      else if(view.level===1)candidates=features.filter(feature=>feature.properties.continent===view.continent).sort((a,b)=>path.area(b)-path.area(a)).slice(0,compact?10:18).map(feature=>({name:feature.properties.name,coordinates:center(feature),kind:'country',feature}));
      else if(view.level===2)candidates=[...(regions.length?regions:(currentCountry?[currentCountry]:[]))].sort((a,b)=>path.area(b)-path.area(a)).slice(0,compact?13:24).map(feature=>({name:feature.properties.name,coordinates:center(feature),kind:'region',feature}));
      else if(currentRegion)candidates=[{name:currentRegion.properties.name,coordinates:center(currentRegion),kind:'focus',feature:currentRegion}];
      for(const item of candidates){
        const point=projection(item.coordinates);if(!point||point[0]<24||point[0]>width-24||point[1]<20||point[1]>height-20)continue;
        const fontSize=item.kind==='continent'?(compact?11:13):item.kind==='focus'?(compact?12:14):(compact?8.5:10),box={left:point[0]-(item.name.length*fontSize*.29+7),right:point[0]+(item.name.length*fontSize*.29+7),top:point[1]-fontSize*.8,bottom:point[1]+fontSize*.65};
        if(occupied.some(other=>!(box.right<other.left||box.left>other.right||box.bottom<other.top||box.top>other.bottom)))continue;occupied.push(box);
        labelLayer.append('text').attr('class',`lx-geography-label is-${item.kind}`).attr('x',point[0]).attr('y',point[1]).attr('text-anchor','middle').attr('dominant-baseline','central').attr('font-size',fontSize).text(item.name);
      }
    }
    function paint(){frame=0;if(!alive||!d3)return;const width=canvas.clientWidth,height=canvas.clientHeight;if(!width||!height)return;canvas.setAttribute('viewBox',`0 0 ${width} ${height}`);const svg=d3.select(canvas);svg.selectAll('*').remove();
      const defs=svg.append('defs'),gradient=defs.append('radialGradient').attr('id','ftc-expedition-ocean').attr('cx','34%').attr('cy','26%').attr('r','77%');gradient.append('stop').attr('offset','0').attr('stop-color','var(--lx-ocean-light, #e9fff0)');gradient.append('stop').attr('offset','.6').attr('stop-color','var(--lx-ocean-mid, #8dcccd)');gradient.append('stop').attr('offset','1').attr('stop-color','var(--lx-ocean-deep, #32798c)');
      const currentCountry=country(),currentRegion=region(),continent=CONTINENTS.find(c=>c[0]===view.continent)||null;
      if(selection?.placeId&&view.level>=4){projection=d3.geoMercator();const context=major(currentRegion||currentCountry);if(context)projection.fitExtent([[24,20],[width-24,height-24]],context);else projection.scale(Math.min(width,height)/.12);projection.center([Number(selection.longitude),Number(selection.latitude)]).translate([width/2,height/2]);}
      else if(view.level===0){projection=d3.geoOrthographic().rotate([-view.yaw/RAD,-view.pitch/RAD]).scale(Math.min(width*.4,height*.44)*view.zoom).translate([width/2,height/2]);svg.append('path').datum({type:'Sphere'}).attr('d',d3.geoPath(projection)).attr('fill','url(#ftc-expedition-ocean)');}
      else if(view.level===1){projection=fitGeography(d3,{type:'FeatureCollection',features:features.filter(f=>f.properties.continent===view.continent)},width,height);projection.scale(projection.scale()*view.zoom);}
      else {const context=currentRegion||(regions.length?{type:'FeatureCollection',features:regions}:currentCountry)||{type:'Sphere'};projection=fitGeography(d3,context,width,height,{usa:view.country==='USA'&&view.level===2});projection.scale(projection.scale()*view.zoom);}
      if(view.level>0){const t=projection.translate();projection.translate([t[0]+view.panX,t[1]+view.panY]);}
      const path=d3.geoPath(projection),shown=view.level===0?features:view.level===1?features.filter(f=>f.properties.continent===view.continent):view.level===2?(regions.length?regions:(currentCountry?[currentCountry]:[])):currentRegion?[currentRegion]:(currentCountry?[currentCountry]:[]);
      svg.append('g').selectAll('path').data(shown).join('path').attr('d',path).attr('class',f=>(view.level>=2?'lx-states':'lx-land')+(f===currentRegion?' is-focus':''));
      if(view.level===0)svg.append('g').attr('class','lx-continent-outlines').selectAll('path').data(continents).join('path').attr('d',path).attr('class','lx-continent-outline');
      if(view.level===0)svg.append('path').datum(d3.geoGraticule10()).attr('d',path).attr('fill','none').attr('stroke','#fffdf7').attr('stroke-opacity','.24').attr('stroke-width','.5');
      drawGeographyLabels(svg,path,width,height,currentCountry,currentRegion);
      const chosen=selectedFeature();if(chosen){
        const spectrum=defs.append('linearGradient').attr('id','ftc-selection-spectrum').attr('x1','0%').attr('y1','0%').attr('x2','100%').attr('y2','100%');
        ['#ed6555','#f5ab44','#eac955','#55ad83','#329a9d','#5089b2','#9581bc','#ce5d87','#ed6555'].forEach((color,i)=>spectrum.append('stop').attr('offset',i/8).attr('stop-color',color));
        if(!reducedMotion)spectrum.append('animateTransform').attr('attributeName','gradientTransform').attr('type','rotate').attr('from','0 .5 .5').attr('to','360 .5 .5').attr('dur','9s').attr('repeatCount','indefinite');
        const outline=svg.append('g').attr('class','lx-selected-boundary').attr('aria-hidden','true');
        outline.append('path').datum(chosen).attr('d',path).attr('fill','url(#ftc-selection-spectrum)').attr('fill-opacity','.08').attr('stroke','none');
        outline.append('path').datum(chosen).attr('d',path).attr('class','lx-boundary-halo').attr('fill','none').attr('stroke','url(#ftc-selection-spectrum)').attr('stroke-width','3.8');
        outline.append('path').datum(chosen).attr('d',path).attr('fill','none').attr('stroke','url(#ftc-selection-spectrum)').attr('stroke-width','1.65').attr('stroke-linejoin','round');
      }
      const pins=host.querySelector('.ftc-atlas-points');if(pins){pins.innerHTML='';const pin=(name,coords,data,{quiet=false}={})=>{const xy=projection(coords);if(!xy||xy[0]<30||xy[0]>width-30||xy[1]<20||xy[1]>height-25)return;if(view.level===0&&d3.geoDistance([view.yaw/RAD,view.pitch/RAD],coords)>1.35)return;const b=document.createElement('button');b.type='button';b.className='lx-map-choice '+(quiet?'lx-town':'lx-hero')+(view.pending&&!quiet?' is-selected':'');b.setAttribute('aria-pressed',String(Boolean(view.pending&&!quiet)));b.textContent=name;b.style.left=clamp(xy[0],quiet?58:85,width-(quiet?58:85))+'px';b.style.top=xy[1]+'px';Object.assign(b.dataset,data);pins.append(b);};
        if(selection?.placeId&&view.level>=4)pin(selection.name,[Number(selection.longitude),Number(selection.latitude)],{worldPoint:selection.name,lng:selection.longitude,lat:selection.latitude});
        else if(view.level===3&&towns.length)towns.forEach(town=>pin(town.name,[Number(town.longitude),Number(town.latitude)],{worldPoint:town.name,lng:town.longitude,lat:town.latitude},{quiet:true}));
        else if(view.level===0&&continent)pin(continent[1]+' entdecken',[continent[2],continent[3]],{continent:continent[0]});
      }
      if(selectionChanged&&!reducedMotion){host.querySelector('.lx-map-choice')?.animate?.([{opacity:0,translate:'0 7px'},{opacity:1,translate:'0 0'}],{duration:340,easing:'ease-out'});}selectionChanged=false;onView({...view});
    }
    function controls(){if(!alive)return;const crumbs=scope.querySelector('.lx-breadcrumb');if(crumbs){const items=[['Welt',0],...(view.level>=1?[[CONTINENTS.find(c=>c[0]===view.continent)?.[1]||'Kontinent',1]]:[]),...(country()?[[country().properties.name,2]]:[]),...(region()?[[region().properties.name,3]]:[])];crumbs.classList.add('lx-selection-trail');crumbs.setAttribute('aria-label','Eure Auswahlspur: Welt, Kontinent, Land und Region');crumbs.innerHTML=items.map(([label,level],i)=>`<button type="button" data-world-back="${level}">${ESC(label)}${i<items.length-1?' ›':''}</button>`).join('');}
      const select=scope.querySelector('[data-world-country]');if(select){const list=view.level===0?CONTINENTS.map(([code,name])=>({properties:{code,name}})):view.level===1?features.filter(f=>f.properties.continent===view.continent):regions;select.innerHTML='<option value="">'+(view.level===0?'Kontinent':view.level===1?'Land':'Region')+' auswählen …</option>'+[...list].sort((a,b)=>a.properties.name.localeCompare(b.properties.name,'de')).map(f=>`<option value="${ESC(f.properties.code)}">${ESC(f.properties.name)}</option>`).join('');select.disabled=view.level>=3||!list.length;}
      const next=scope.querySelector('[data-ftc-story-start]');if(next&&view.level<4){next.textContent=(view.pending?view.pending.name+' betreten':view.level===0?'Kontinent auswählen':view.level===1?'Land auswählen':view.level===2?'Dieses Land als Ziel wählen':'Diese Region als Ziel wählen')+' →';next.disabled=!view.pending;}
      status.textContent=selection?.placeId&&view.level>=4?selection.name+' · euer Reiseziel':view.pending?view.pending.name+' ausgewählt · erneut berühren zum Öffnen':!interactive?'Eure Reise nimmt Form an':view.level===0?'Drehen und einen Kontinent berühren':view.level===1?'Ein Land berühren und erneut öffnen':view.level===2?(regions.length?regions.length+(view.country==='USA'?' Gebiete · Alaska & Hawaii als Nebenkarte':' Regionen · eine neue Richtung'):'Euer Land · direkte Ortssuche bereit'):'Eure Region · Ort oder Region bestätigen';
    }
    async function refresh(){const seq=++loadSequence;if(view.country){try{regions=await loadRegions(view.country);}catch{if(seq===loadSequence&&alive)status.textContent='Regionen gerade nicht verfügbar · direkte Suche bleibt bereit';return;}}else regions=[];if(!alive||seq!==loadSequence)return;controls();request();}
    function pickAt(x,y){if(!interactive||!projection||transitioning||view.level>=4)return;const box=canvas.getBoundingClientRect(),point=projection.invert([x-box.left,y-box.top]);if(!point||!point.every(Number.isFinite))return;if(view.level===0&&Math.hypot(x-box.left-box.width/2,y-box.top-box.height/2)>Math.min(box.width*.4,box.height*.44)*view.zoom)return;const found=countryAt(view.level>=2?regions:features,...point);if(found)choose(found);}
    function fly(lng,lat){if(!Number.isFinite(Number(lng))||!Number.isFinite(Number(lat)))return;view.yaw=Number(lng)*RAD;view.pitch=clamp(Number(lat)*RAD,-1.2,1.2);request();}
    async function containsDestination(destination){await ready;const lng=Number(destination?.longitude),lat=Number(destination?.latitude);if(!Number.isFinite(lng)||!Number.isFinite(lat))return false;if(view.region&&region())return Boolean(countryAt([region()],lng,lat));if(view.country&&country())return Boolean(countryAt([country()],lng,lat));if(view.continent){const found=countryAt(features,lng,lat);return found?.properties?.continent===view.continent}return true;}
    function selectionScope(){return{level:view.level,continent:view.continent||'',continentName:CONTINENTS.find(item=>item[0]===view.continent)?.[1]||'',country:view.country||'',countryName:country()?.properties?.name||'',region:view.region||'',regionName:region()?.properties?.name||''};}
    function setTowns(values=[]){towns=(Array.isArray(values)?values:[]).filter(item=>item?.name&&Number.isFinite(Number(item.latitude))&&Number.isFinite(Number(item.longitude))).slice(0,8);request();return towns.length;}
    listen(scope.querySelector('.lx-breadcrumb'),'click',event=>{const b=event.target.closest('[data-world-back]');if(b&&!transitioning){tourSequence++;navigate({level:Number(b.dataset.worldBack),...(Number(b.dataset.worldBack)<2?{country:'',region:''}:Number(b.dataset.worldBack)<3?{region:''}:{})});}});
    listen(scope.querySelector('[data-world-country]'),'change',event=>{const value=event.target.value;if(!value)return;if(view.level===0)selectContinent(value);else choose((view.level===1?features:regions).find(f=>f.properties.code===value));});
    // One gesture owner for geometry and labels; native keyboard clicks remain available.
    listen(surface,'pointerdown',event=>{if((event.button!==undefined&&event.button!==0)||transitioning)return;tourSequence++;cancelAnimationFrame(flight);if(!pointers.size)dragged=false;handledPointer=true;pointers.set(event.pointerId,{x:event.clientX,y:event.clientY,startX:event.clientX,startY:event.clientY,marker:event.target.closest?.('button')});surface.setPointerCapture?.(event.pointerId);surface.classList?.add('is-dragging');if(pointers.size>=2){const [a,b]=[...pointers.values()];pinchDistance=Math.hypot(a.x-b.x,a.y-b.y);dragged=true;}});
    listen(surface,'pointermove',event=>{const old=pointers.get(event.pointerId);if(!old)return;const dx=event.clientX-old.x,dy=event.clientY-old.y;pointers.set(event.pointerId,{...old,x:event.clientX,y:event.clientY});if(Math.hypot(event.clientX-old.startX,event.clientY-old.startY)>7)dragged=true;if(pointers.size>=2){const [a,b]=[...pointers.values()],distance=Math.hypot(a.x-b.x,a.y-b.y);if(pinchDistance>0)zoomBy(distance/pinchDistance);pinchDistance=distance;}else if(dragged){view.yaw-=dx*.006;view.pitch=clamp(view.pitch+dy*.006,-1.2,1.2);if(view.level>0){view.panX=clamp(view.panX+dx,-canvas.clientWidth,canvas.clientWidth);view.panY=clamp(view.panY+dy,-canvas.clientHeight,canvas.clientHeight);}}request();});
    const release=id=>{pointers.delete(id);if(!pointers.size)surface.classList?.remove('is-dragging');if(surface.hasPointerCapture?.(id))surface.releasePointerCapture(id);};
    listen(surface,'pointerup',event=>{const pointer=pointers.get(event.pointerId);release(event.pointerId);if(pointer&&!dragged){if(pointer.marker)pickMarker(pointer.marker);else pickAt(event.clientX,event.clientY);}});
    listen(surface,'pointercancel',event=>{dragged=true;release(event.pointerId);});listen(surface,'lostpointercapture',event=>{if(pointers.has(event.pointerId))dragged=true;pointers.delete(event.pointerId);if(!pointers.size)surface.classList?.remove('is-dragging');});
    listen(surface,'click',event=>{if(handledPointer&&event.detail>0){event.preventDefault();event.stopImmediatePropagation();return;}const marker=event.target.closest?.('button');if(marker)pickMarker(marker);},true);
    listen(surface,'wheel',event=>{if(event.cancelable)event.preventDefault();event.stopPropagation();const unit=event.deltaMode===1?16:event.deltaMode===2?canvas.clientHeight:1;if(event.ctrlKey||view.level>0)zoomBy(Math.exp(-event.deltaY*unit*.005));else{view.yaw-=event.deltaX*unit*.002;view.pitch=clamp(view.pitch+event.deltaY*unit*.002,-1.2,1.2);}request();},{passive:false});
    listen(surface,'touchmove',event=>{if(event.cancelable)event.preventDefault();},{passive:false});
    listen(canvas,'keydown',event=>{if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','+','-','Enter'].includes(event.key))return;event.preventDefault();if(event.key==='Enter'){primary();return;}if(view.level>0){if(event.key==='ArrowLeft')view.panX=clamp(view.panX-28,-canvas.clientWidth,canvas.clientWidth);if(event.key==='ArrowRight')view.panX=clamp(view.panX+28,-canvas.clientWidth,canvas.clientWidth);if(event.key==='ArrowUp')view.panY=clamp(view.panY-28,-canvas.clientHeight,canvas.clientHeight);if(event.key==='ArrowDown')view.panY=clamp(view.panY+28,-canvas.clientHeight,canvas.clientHeight);}if(event.key==='ArrowLeft')view.yaw-=.15;if(event.key==='ArrowRight')view.yaw+=.15;if(event.key==='ArrowUp')view.pitch=clamp(view.pitch+.12,-1.2,1.2);if(event.key==='ArrowDown')view.pitch=clamp(view.pitch-.12,-1.2,1.2);if(event.key==='+'||event.key==='-')zoomBy(event.key==='+'?1.18:.78);request();});
    const observer=new ResizeObserver(request);observer.observe(canvas);
    const ready=load().then(async data=>{if(!alive)return;features=data.features;const [library,continentData]=await Promise.all([loadProjection(),loadContinents()]);d3=library;continents=continentData.features;if(!alive)return;if(selection?.placeId){view.pending=null;const selectedCountry=countryAt(features,Number(selection.longitude),Number(selection.latitude));if(selectedCountry){if(view.country!==selectedCountry.properties.code)view.region='';view.country=selectedCountry.properties.code;view.continent=selectedCountry.properties.continent;}}if(host.dataset){host.dataset.worldReady='true';host.dataset.worldLevel=String(view.level);}await refresh();if(!reducedMotion&&initialLevel===0){surface.animate?.([{opacity:.55,transform:'scale(.955)'},{opacity:1,transform:'scale(1)'}],{duration:760,easing:'cubic-bezier(.2,.8,.2,1)'});const target=view.yaw,startYaw=target-.72,start=performance.now();view.yaw=startYaw;const turn=now=>{if(!alive||dragged)return;const progress=Math.min(1,(now-start)/1150),ease=1-Math.pow(1-progress,3);view.yaw=startYaw+(target-startYaw)*ease;request();if(progress<1)flight=requestAnimationFrame(turn)};flight=requestAnimationFrame(turn);}}).catch(()=>{if(alive){if(host.dataset)host.dataset.worldReady='error';status.textContent='Die Weltkarte ist gerade nicht verfügbar. Die direkte Ortsuche bleibt bereit.';}});
    return Object.freeze({ready,fly,primary,travelTo,arrive,backLevel,zoomBy,containsDestination,selectionScope,setTowns,snapshot:()=>({...view}),destroy(){alive=false;tourSequence++;navigationSequence++;cancelAnimationFrame(frame);cancelAnimationFrame(flight);observer.disconnect();cleanup.forEach(fn=>fn());for(const id of pointers.keys())if(surface.hasPointerCapture?.(id))surface.releasePointerCapture(id);pointers.clear();surface.classList?.remove('is-dragging');}});
  }

  window.LuviaComposerTravelWorld=Object.freeze({version:VERSION,markup,mount,project,unproject,countryAt,geographicTrace,fitGeography});
})();
