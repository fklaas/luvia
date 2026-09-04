// Only exact entity references. No name/image search, third-party HTML scraping,
// stock images or nearby photos that could misrepresent the selected venue.
const mediaCache=new Map<string,{until:number,photo:any}>(),mediaPending=new Map<string,Promise<any>>();
const plain=(v:any)=>String(v||'').replace(/<[^>]*>/g,'').slice(0,400);
export function linkedWiki(place:any){
  const raw=place?.raw||{},media=raw.wiki_and_media||{},osm=raw.datasource?.raw||{};
  const wiki=String(media.wikidata||raw.wikidata||osm.wikidata||'');
  return{wikidata:/^Q[1-9][0-9]*$/.test(wiki)?wiki:null,commons:/^File:.+/.test(String(media.wikimedia_commons||''))?media.wikimedia_commons:null};
}
async function wikiJson(url:string){const response=await fetch(url,{headers:{'User-Agent':'Luvia/1.0 (https://myluvia.app; exact linked place image)'},signal:AbortSignal.timeout(3500),redirect:'error'});if(!response.ok)throw new Error('PLACE_IMAGE_UNAVAILABLE');return response.json()}
export async function enrichLinkedMedia(place:any){
  if(!place||place.photos?.length)return place;
  const refs=linkedWiki(place),id=refs.commons||refs.wikidata;if(!id)return{...place,mediaStatus:'no-linked-image'};
  const cached=mediaCache.get(id);if(cached&&cached.until>Date.now())return{...place,photos:cached.photo?[cached.photo]:[],mediaStatus:cached.photo?'verified-linked-image':'no-linked-image'};
  const request=mediaPending.get(id)||(async()=>{
    let title=refs.commons;
    if(!title&&refs.wikidata){
      const data=await wikiJson(`https://www.wikidata.org/w/api.php?action=wbgetentities&ids=${refs.wikidata}&props=claims&format=json`);
      const claims=data.entities?.[refs.wikidata]?.claims;
      const image=claims?.P18?.find((c:any)=>c.rank!=='deprecated'&&typeof c.mainsnak?.datavalue?.value==='string')?.mainsnak?.datavalue?.value;
      if(image)title=`File:${image}`;
    }
    let photo=null;
    if(title){
      const params=new URLSearchParams({action:'query',format:'json',titles:title,prop:'imageinfo',iiprop:'url|extmetadata',iiurlwidth:'960'}),data=await wikiJson(`https://commons.wikimedia.org/w/api.php?${params}`),page:any=Object.values(data.query?.pages||{})[0],info=page?.imageinfo?.[0],meta=info?.extmetadata;
      if(info?.url&&/^https:\/\/upload\.wikimedia\.org\//.test(info.url)&&meta?.LicenseShortName?.value&&meta?.Artist?.value){photo={uri:info.thumburl||info.url,sourceUrl:info.descriptionurl,attribution:`${plain(meta.Artist.value)} · ${plain(meta.LicenseShortName.value)}`,attributionUrl:meta.LicenseUrl?.value||info.descriptionurl,license:plain(meta.LicenseShortName.value),provider:'wikimedia',entityReference:id,verified:true}}
    }
    if(mediaCache.size>=256)mediaCache.delete(mediaCache.keys().next().value!);mediaCache.set(id,{until:Date.now()+(photo?24*60*60_000:15*60_000),photo});return photo;
  })();
  mediaPending.set(id,request);
  try{const photo=await request;return{...place,photos:photo?[photo]:[],mediaStatus:photo?'verified-linked-image':'no-linked-image'}}catch{return{...place,mediaStatus:'image-source-unavailable'}}finally{mediaPending.delete(id)}
}
