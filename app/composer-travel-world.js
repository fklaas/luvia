(() => {
  'use strict';
  // Consumer presentation only. Geographic picks are search intent, never Place truth.
  const VERSION = '1.0.0';
  const PI = Math.PI, RAD = PI / 180;
  const ESC = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const REGIONS = [['Europa',15,43],['Asien',108,28],['Amerika',-90,22],['Afrika',20,0],['Ozeanien',140,-23]];
  const POINTS = [['Lissabon',-9.14,38.71],['Toskana',11.14,43.46],['Kopenhagen',12.57,55.68],['Kyoto',135.77,35.01],['Kapstadt',18.42,-33.92],['Vancouver',-123.12,49.28],['Sydney',151.21,-33.87]];
  let geography;
  const load = () => geography ||= fetch('assets/composer/world-countries.json', {cache:'force-cache'})
    .then(response => { if (!response.ok) throw Error('WORLD_GEOGRAPHY_UNAVAILABLE'); return response.json(); })
    .catch(error => { geography = null; throw error; });
  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
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
    return features.find(feature => (feature.geometry.type==='Polygon'?[feature.geometry.coordinates]:feature.geometry.coordinates)
      .some(polygon=>inRing(lng,lat,polygon[0])&&!polygon.slice(1).some(hole=>inRing(lng,lat,hole))));
  }
  function markup() {
    return `<div class="ftc-atlas" data-ftc-atlas><div class="ftc-atlas-orbit orbit-one" aria-hidden="true"></div><div class="ftc-atlas-orbit orbit-two" aria-hidden="true"></div><div class="ftc-atlas-glow" aria-hidden="true"></div>
      <canvas data-ftc-world-canvas tabindex="0" role="img" aria-label="Interaktive Weltkarte. Mit Pfeiltasten drehen, mit Plus und Minus zoomen, mit Eingabe das Land in der Mitte suchen. Alternativ ein Land aus der Liste auswählen."></canvas>
      <div class="ftc-atlas-points">${POINTS.map(([name,lng,lat])=>`<button type="button" data-world-point="${ESC(name)}" data-lng="${lng}" data-lat="${lat}" hidden><i></i><span>${ESC(name)}</span></button>`).join('')}</div>
      <div class="ftc-atlas-controls"><button type="button" data-world-zoom="1" aria-label="Weltkarte vergrößern">+</button><button type="button" data-world-zoom="-1" aria-label="Weltkarte verkleinern">−</button></div>
      <span class="ftc-atlas-status" data-world-status role="status">Die Welt öffnet sich …</span>
      <nav class="ftc-atlas-regions" aria-label="Weltregion erkunden">${REGIONS.map(([name,lng,lat])=>`<button type="button" data-world-region="${name}" data-lng="${lng}" data-lat="${lat}">${name}</button>`).join('')}</nav>
      <label class="ftc-atlas-country"><span>Oder ein Land auswählen</span><select data-world-country aria-label="Land auf der Weltkarte auswählen"><option value="">Land auswählen …</option></select></label>
      <span class="ftc-atlas-credit">Made with Natural Earth</span></div>`;
  }
  function texture(features) {
    const canvas=document.createElement('canvas');canvas.width=2048;canvas.height=1024;
    const ctx=canvas.getContext('2d');ctx.fillStyle='#bcdce0';ctx.fillRect(0,0,2048,1024);
    ctx.strokeStyle='#e7f3f14d';ctx.lineWidth=.8;
    for(let x=0;x<=2048;x+=2048/24){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,1024);ctx.stroke();}
    for(let y=0;y<=1024;y+=1024/12){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(2048,y);ctx.stroke();}
    const colors={'Europe':'#e6dfba','Asia':'#ced7b8','Africa':'#ead8ad','North America':'#cbd9b9','South America':'#bfd2b4','Oceania':'#e5cfaa','Antarctica':'#f3f7ed'};
    features.forEach(feature=>{
      ctx.fillStyle=colors[feature.properties.continent]||'#d6ddc1';ctx.strokeStyle='#fcfcf1b8';ctx.lineWidth=1.25;
      const polygons=feature.geometry.type==='Polygon'?[feature.geometry.coordinates]:feature.geometry.coordinates;
      for(const polygon of polygons){ctx.beginPath();for(const ring of polygon){ring.forEach(([lng,lat],index)=>{const x=(lng+180)/360*2048,y=(90-lat)/180*1024;index?ctx.lineTo(x,y):ctx.moveTo(x,y)});ctx.closePath();}ctx.fill('evenodd');ctx.stroke();}
    });
    return canvas;
  }
  function globeRenderer(canvas, mapTexture) {
    const gl=canvas.getContext('webgl',{alpha:true,antialias:true,powerPreference:'low-power'});
    if(!gl) {
      const ctx=canvas.getContext('2d');
      return {flat:true,draw(){ctx.clearRect(0,0,canvas.width,canvas.height);ctx.drawImage(mapTexture,0,canvas.height*.12,canvas.width,canvas.height*.65)},destroy(){}};
    }
    const shader=(type,source)=>{const s=gl.createShader(type);gl.shaderSource(s,source);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error('WORLD_SHADER_UNAVAILABLE');return s};
    const vertex=shader(gl.VERTEX_SHADER,'attribute vec2 position;void main(){gl_Position=vec4(position,0.0,1.0);}');
    const fragment=shader(gl.FRAGMENT_SHADER,`precision highp float;
      uniform vec2 size;uniform float yaw;uniform float pitch;uniform float radius;uniform sampler2D earth;
      void main(){vec2 p=(gl_FragCoord.xy-size*.5)/radius;float q=dot(p,p);if(q>1.0)discard;
      vec3 v=vec3(p,sqrt(1.0-q));float k=cos(pitch)*v.z-sin(pitch)*v.y;
      vec3 w=vec3(cos(yaw)*v.x+sin(yaw)*k,sin(pitch)*v.z+cos(pitch)*v.y,-sin(yaw)*v.x+cos(yaw)*k);
      vec2 uv=vec2(atan(w.x,w.z)/6.2831853+.5,.5-asin(w.y)/3.14159265);
      vec3 color=texture2D(earth,uv).rgb;vec3 light=normalize(vec3(-.5,.7,1.3));
      float shade=.64+.36*max(0.0,dot(v,light));float rim=pow(1.0-v.z,3.0);
      color=color*shade+vec3(.10,.16,.16)*rim;
      float water=step(color.r,color.b);float shine=pow(max(0.0,dot(reflect(-light,v),vec3(0,0,1))),28.0)*water*.13;
      gl_FragColor=vec4(color+shine,1.0);}`);
    const program=gl.createProgram();gl.attachShader(program,vertex);gl.attachShader(program,fragment);gl.linkProgram(program);
    if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error('WORLD_PROGRAM_UNAVAILABLE');
    gl.useProgram(program);const buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),gl.STATIC_DRAW);
    const position=gl.getAttribLocation(program,'position');gl.enableVertexAttribArray(position);gl.vertexAttribPointer(position,2,gl.FLOAT,false,0,0);
    const tex=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,tex);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,mapTexture);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
    const uniforms=Object.fromEntries(['size','yaw','pitch','radius'].map(key=>[key,gl.getUniformLocation(program,key)]));
    return {flat:false,draw(view,radius){gl.viewport(0,0,canvas.width,canvas.height);gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT);gl.uniform2f(uniforms.size,canvas.width,canvas.height);gl.uniform1f(uniforms.yaw,view.yaw);gl.uniform1f(uniforms.pitch,view.pitch);gl.uniform1f(uniforms.radius,radius);gl.drawArrays(gl.TRIANGLES,0,6)},destroy(){gl.deleteTexture(tex);gl.deleteBuffer(buffer);gl.deleteProgram(program);gl.deleteShader(vertex);gl.deleteShader(fragment);gl.getExtension('WEBGL_lose_context')?.loseContext();}};
  }
  function mount(host,{onPick=()=>{},onView=()=>{},view:initial={},reducedMotion=false}={}) {
    if(!host)return null;
    const canvas=host.querySelector('[data-ftc-world-canvas]'),status=host.querySelector('[data-world-status]');
    if(!canvas)return null;
    const view={yaw:Number(initial.yaw??15*RAD),pitch:Number(initial.pitch??34*RAD),zoom:Number(initial.zoom??1)};
    let alive=true,renderer=null,features=[],frame=0,flight=0,dragged=false,pinchDistance=0;
    const pointers=new Map(),cleanup=[];
    const listen=(target,event,handler,options)=>{target.addEventListener(event,handler,options);cleanup.push(()=>target.removeEventListener(event,handler,options));};
    const radius=()=>Math.min(canvas.clientWidth,canvas.clientHeight)*.43*view.zoom;
    function paint(){frame=0;if(!alive||!renderer)return;const ratio=Math.min(2,window.devicePixelRatio||1);const width=Math.round(canvas.clientWidth*ratio),height=Math.round(canvas.clientHeight*ratio);if(!width||!height)return;if(canvas.width!==width||canvas.height!==height){canvas.width=width;canvas.height=height;}renderer.draw(view,radius()*ratio);
      host.querySelectorAll('[data-world-point]').forEach(node=>{const lng=Number(node.dataset.lng),lat=Number(node.dataset.lat),p=project(lng,lat,view.yaw,view.pitch);node.hidden=renderer.flat||p.z<.35;node.style.left=`${canvas.clientWidth/2+p.x*radius()}px`;node.style.top=`${canvas.clientHeight/2-p.y*radius()}px`;});
      onView({...view});
    }
    const request=()=>{if(alive&&!frame)frame=requestAnimationFrame(paint)};
    function fly(lng,lat){cancelAnimationFrame(flight);const from={...view},target={yaw:Number(lng)*RAD,pitch:clamp(Number(lat)*RAD,-1.2,1.2)},start=performance.now();let delta=target.yaw-from.yaw;while(delta>PI)delta-=2*PI;while(delta<-PI)delta+=2*PI;const tick=now=>{if(!alive)return;const t=reducedMotion?1:clamp((now-start)/850,0,1),ease=1-Math.pow(1-t,3);view.yaw=from.yaw+delta*ease;view.pitch=from.pitch+(target.pitch-from.pitch)*ease;request();if(t<1)flight=requestAnimationFrame(tick);};flight=requestAnimationFrame(tick);}
    function pickAt(clientX,clientY){const box=canvas.getBoundingClientRect();const point=renderer?.flat?{lng:(clientX-box.left)/box.width*360-180,lat:90-((clientY-box.top)/box.height-.12)/.65*180}:unproject((clientX-box.left-box.width/2)/radius(),-(clientY-box.top-box.height/2)/radius(),view.yaw,view.pitch);if(!point)return;const country=countryAt(features,point.lng,point.lat);if(country){status.textContent=`${country.properties.name} entdecken`;onPick({name:country.properties.name,...point});}else status.textContent='Dreht die Welt oder sucht euren Wunschort direkt.';}
    host.querySelectorAll('[data-world-region]').forEach(button=>listen(button,'click',()=>{fly(button.dataset.lng,button.dataset.lat);host.querySelectorAll('[data-world-region]').forEach(node=>node.setAttribute('aria-pressed',String(node===button)));}));
    host.querySelectorAll('[data-world-point]').forEach(button=>listen(button,'click',()=>{fly(button.dataset.lng,button.dataset.lat);onPick({name:button.dataset.worldPoint,lng:Number(button.dataset.lng),lat:Number(button.dataset.lat)});}));
    host.querySelectorAll('[data-world-zoom]').forEach(button=>listen(button,'click',()=>{view.zoom=clamp(view.zoom+Number(button.dataset.worldZoom)*.14,.8,1.55);request();}));
    listen(canvas,'keydown',event=>{if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','+','-','Enter'].includes(event.key))return;event.preventDefault();cancelAnimationFrame(flight);if(event.key==='Enter'){const rect=canvas.getBoundingClientRect();pickAt(rect.left+rect.width/2,rect.top+rect.height/2);return;}if(event.key==='ArrowLeft')view.yaw-=.15;if(event.key==='ArrowRight')view.yaw+=.15;if(event.key==='ArrowUp')view.pitch=clamp(view.pitch+.12,-1.2,1.2);if(event.key==='ArrowDown')view.pitch=clamp(view.pitch-.12,-1.2,1.2);if(event.key==='+'||event.key==='-')view.zoom=clamp(view.zoom+(event.key==='+'?.14:-.14),.8,1.55);request();});
    listen(canvas,'pointerdown',event=>{cancelAnimationFrame(flight);if(!pointers.size)dragged=false;pointers.set(event.pointerId,{x:event.clientX,y:event.clientY,startX:event.clientX,startY:event.clientY});canvas.setPointerCapture?.(event.pointerId);if(pointers.size===2){const [a,b]=[...pointers.values()];pinchDistance=Math.hypot(a.x-b.x,a.y-b.y);dragged=true;}});
    listen(canvas,'pointermove',event=>{const old=pointers.get(event.pointerId);if(!old)return;const dx=event.clientX-old.x,dy=event.clientY-old.y;pointers.set(event.pointerId,{...old,x:event.clientX,y:event.clientY});if(Math.hypot(event.clientX-old.startX,event.clientY-old.startY)>7)dragged=true;if(pointers.size===2){const [a,b]=[...pointers.values()],distance=Math.hypot(a.x-b.x,a.y-b.y);if(pinchDistance>0)view.zoom=clamp(view.zoom*distance/pinchDistance,.8,1.55);pinchDistance=distance;}else{view.yaw-=dx*.006;view.pitch=clamp(view.pitch+dy*.006,-1.2,1.2);}request();});
    listen(canvas,'pointerup',event=>{const known=pointers.has(event.pointerId);pointers.delete(event.pointerId);if(known&&!dragged)pickAt(event.clientX,event.clientY);});
    listen(canvas,'pointercancel',event=>{pointers.delete(event.pointerId);dragged=true;});
    listen(canvas,'lostpointercapture',event=>pointers.delete(event.pointerId));
    const observer=new ResizeObserver(request);observer.observe(canvas);
    const ready=load().then(data=>{if(!alive)return;features=data.features;const select=host.querySelector('[data-world-country]');select.innerHTML='<option value="">Land auswählen …</option>'+[...features].sort((a,b)=>a.properties.name.localeCompare(b.properties.name,'de')).map(feature=>`<option value="${ESC(feature.properties.name)}">${ESC(feature.properties.name)}</option>`).join('');listen(select,'change',()=>{if(select.value)onPick({name:select.value})});renderer=globeRenderer(canvas,texture(features));host.dataset.worldReady='true';status.textContent='Drehen. Entdecken. Euren Ort berühren.';request();}).catch(()=>{if(alive){host.dataset.worldReady='error';status.textContent='Die Weltkarte ist gerade nicht verfügbar. Die direkte Ortsuche bleibt bereit.';}});
    return Object.freeze({ready,fly,snapshot:()=>({...view}),destroy(){alive=false;cancelAnimationFrame(frame);cancelAnimationFrame(flight);observer.disconnect();cleanup.forEach(fn=>fn());pointers.clear();renderer?.destroy();}});
  }
  window.LuviaComposerTravelWorld=Object.freeze({version:VERSION,markup,mount,project,unproject,countryAt});
})();
