(function(){
  'use strict';

  const CONTRACT_ID='media.v1';
  const VERSION='1';
  const RUNTIME_VERSION='1.0.0';

  function providerError(provider){
    const error=new Error(`Media contract provider unavailable: ${provider}`);
    error.code='MEDIA_CONTRACT_PROVIDER_UNAVAILABLE';
    error.provider=provider;
    return error;
  }

  function provider(owner,method){
    const service=window[owner];
    if(!service||typeof service[method]!=='function'){
      throw providerError(`${owner}.${method}`);
    }
    return service[method].bind(service);
  }

  const freezeArray=items=>Object.freeze(
    items.map(item=>
      item&&typeof item==='object'&&!Object.isFrozen(item)
        ?Object.freeze(item)
        :item
    )
  );

  const text=value=>value==null?null:String(value);
  const number=value=>value==null||value===''?null:Number(value);
  const bool=value=>Boolean(value);

  const pick=(obj,...keys)=>{
    for(const key of keys){
      if(obj&&obj[key]!==undefined)return obj[key];
    }
    return undefined;
  };

  function projectEditSettings(value){
    if(!value||typeof value!=='object'||Array.isArray(value)){
      return Object.freeze({});
    }

    const out={};

    for(const key of [
      'rotation',
      'crop',
      'brightness',
      'contrast',
      'saturation',
      'warmth',
      'filter'
    ]){
      if(value[key]!==undefined)out[key]=value[key];
    }

    return Object.freeze(out);
  }

  function projectMedia(item){
    if(!item)return null;

    return Object.freeze({
      id:text(item.id),
      tripId:text(pick(item,'tripId','trip_id')),
      participantId:text(pick(item,'participantId','participant_id')),
      type:text(item.type),
      purpose:text(item.purpose),
      source:text(item.source),
      originalName:text(pick(item,'originalName','original_name')),
      displayName:text(pick(item,'displayName','display_name')),
      mimeType:text(pick(item,'mimeType','mime_type')),
      status:text(item.status),
      capturedAt:text(pick(item,'capturedAt','captured_at')),
      dayKey:text(pick(item,'dayKey','day_key')),
      timezone:text(item.timezone),
      latitude:number(item.latitude),
      longitude:number(item.longitude),
      width:number(item.width),
      height:number(item.height),
      fileSize:number(pick(item,'fileSize','file_size')),
      placeId:text(pick(item,'placeId','place_id')),
      favorite:bool(item.favorite),
      editSettings:projectEditSettings(
        pick(item,'editSettings','edit_settings')
      ),
      createdAt:text(pick(item,'createdAt','created_at')),
      updatedAt:text(pick(item,'updatedAt','updated_at'))
    });
  }

  function projectContribution(row){
    if(!row)return null;

    return Object.freeze({
      id:text(row.id),
      userId:text(pick(row,'userId','user_id')),
      promptKey:text(pick(row,'promptKey','prompt_key')),
      promptText:text(pick(row,'promptText','prompt_text')),
      answerText:text(pick(row,'answerText','answer_text')),
      reaction:text(row.reaction),
      mediaId:text(pick(row,'mediaId','media_id')),
      updatedAt:text(pick(row,'updatedAt','updated_at'))
    });
  }

  function projectAlbum(row){
    if(!row)return null;

    const mediaIds=Array.isArray(row.mediaIds)
      ?row.mediaIds.map(String)
      :[];

    const favorites=Array.isArray(row.favorites)
      ?row.favorites.map(x=>Object.freeze({
          userId:text(pick(x,'userId','user_id')),
          mediaId:text(pick(x,'mediaId','media_id'))
        }))
      :[];

    const contributions=Array.isArray(row.contributions)
      ?row.contributions.map(projectContribution).filter(Boolean)
      :[];

    return Object.freeze({
      id:text(row.id),
      tripId:text(pick(row,'tripId','trip_id')),
      sourceClusterId:text(
        pick(row,'sourceClusterId','source_cluster_id')
      ),
      title:text(row.title),
      description:text(row.description),
      mood:text(row.mood),
      coverMediaId:text(
        pick(row,'coverMediaId','cover_media_id')
      ),
      status:text(row.status),
      mediaIds:freezeArray(mediaIds),
      favorites:freezeArray(favorites),
      contributions:freezeArray(contributions),
      createdAt:text(pick(row,'createdAt','created_at')),
      updatedAt:text(pick(row,'updatedAt','updated_at'))
    });
  }

  function projectCard(row){
    if(!row)return null;

    return Object.freeze({
      id:text(row.id),
      tripId:text(pick(row,'tripId','trip_id')),
      authorId:text(pick(row,'authorId','author_id')),
      cardType:text(pick(row,'cardType','card_type')),
      sourceType:text(pick(row,'sourceType','source_type')),
      content:text(row.content),
      mediaId:text(pick(row,'mediaId','media_id')),
      clusterId:text(pick(row,'clusterId','cluster_id')),
      journeyId:text(pick(row,'journeyId','journey_id')),
      reaction:text(row.reaction),
      weight:number(row.weight),
      visibility:text(row.visibility),
      status:text(row.status),
      createdAt:text(pick(row,'createdAt','created_at')),
      updatedAt:text(pick(row,'updatedAt','updated_at'))
    });
  }

  function projectJourneyChapter(row){
    if(!row)return null;

    return Object.freeze({
      id:text(row.id),
      position:number(row.position),
      title:text(row.title),
      dayKey:text(pick(row,'dayKey','day_key')),
      summary:text(row.summary),
      mood:text(row.mood),
      coverMediaId:text(
        pick(row,'coverMediaId','cover_media_id')
      )
    });
  }

  function projectJourneyItem(row){
    if(!row)return null;

    return Object.freeze({
      id:text(row.id),
      chapterPosition:number(
        pick(row,'chapterPosition','chapter_position')
      ),
      position:number(row.position),
      itemType:text(pick(row,'itemType','item_type')),
      mediaId:text(pick(row,'mediaId','media_id')),
      clusterId:text(pick(row,'clusterId','cluster_id')),
      memoryAlbumId:text(
        pick(row,'memoryAlbumId','memory_album_id')
      ),
      timelineEventId:text(
        pick(row,'timelineEventId','timeline_event_id')
      ),
      dayKey:text(pick(row,'dayKey','day_key'))
    });
  }

  function projectJourney(row){
    if(!row)return null;

    const chapters=Array.isArray(row.chapters)
      ?row.chapters.map(projectJourneyChapter).filter(Boolean)
      :[];

    const items=Array.isArray(row.items)
      ?row.items.map(projectJourneyItem).filter(Boolean)
      :[];

    const contributions=Array.isArray(row.contributions)
      ?row.contributions.map(projectContribution).filter(Boolean)
      :[];

    return Object.freeze({
      id:text(row.id),
      tripId:text(pick(row,'tripId','trip_id')),
      title:text(row.title),
      subtitle:text(row.subtitle),
      description:text(row.description),
      coverMediaId:text(
        pick(row,'coverMediaId','cover_media_id')
      ),
      status:text(row.status),
      chapters:freezeArray(chapters),
      items:freezeArray(items),
      contributions:freezeArray(contributions),
      createdAt:text(pick(row,'createdAt','created_at')),
      updatedAt:text(pick(row,'updatedAt','updated_at'))
    });
  }

  async function listMedia(options={}){
    const rows=await provider(
      'LuviaMediaCore',
      'list'
    )(options);

    return freezeArray(
      rows.map(projectMedia).filter(Boolean)
    );
  }

  async function getMedia(mediaId){
    return projectMedia(
      await provider(
        'LuviaMediaCore',
        'get'
      )(mediaId)
    );
  }

  async function resolveRawMedia(mediaId){
    return provider(
      'LuviaMediaCore',
      'get'
    )(mediaId);
  }

  async function signedUrl(mediaId,expiresIn=3600){
    const item=await resolveRawMedia(mediaId);

    if(!item)return null;

    return provider(
      'LuviaMediaCore',
      'signedUrl'
    )(item,expiresIn);
  }

  async function signedOriginalUrl(
    mediaId,
    expiresIn=3600
  ){
    const item=await resolveRawMedia(mediaId);

    if(!item)return null;

    return provider(
      'LuviaMediaCore',
      'signedOriginalUrl'
    )(item,expiresIn);
  }

  async function listAlbums(){
    const rows=await provider(
      'LuviaMemoryAlbums',
      'list'
    )();

    return freezeArray(
      rows.map(projectAlbum).filter(Boolean)
    );
  }

  async function listCards(filters={}){
    const rows=await provider(
      'LuviaMemoryCards',
      'list'
    )(filters);

    return freezeArray(
      rows.map(projectCard).filter(Boolean)
    );
  }

  async function listJourneys(){
    const rows=await provider(
      'LuviaMemoryJourneys',
      'list'
    )();

    return freezeArray(
      rows.map(projectJourney).filter(Boolean)
    );
  }

  const mediaCommands=Object.freeze({

    async upload(file,options={}){
      const result=await provider(
        'LuviaMediaCore',
        'upload'
      )(file,options);

      return Object.freeze({
        entity:projectMedia(
          result?.entity||result
        ),
        duplicate:Boolean(result?.duplicate)
      });
    },

    async update(mediaId,patch={}){
      return projectMedia(
        await provider(
          'LuviaMediaCore',
          'update'
        )(mediaId,patch)
      );
    },

    async reanalyze(mediaId){
      return projectMedia(
        await provider(
          'LuviaMediaCore',
          'reanalyze'
        )(mediaId)
      );
    },

    async toggleFavorite(mediaId){
      return projectMedia(
        await provider(
          'LuviaMediaCore',
          'toggleFavorite'
        )(mediaId)
      );
    },

    async setPolaroid(mediaId,dayKey){
      const row=await provider(
        'LuviaMediaCore',
        'setPolaroid'
      )(mediaId,dayKey);

      return Object.freeze({
        mediaId:text(
          pick(row,'mediaId','media_id')??mediaId
        ),
        dayKey:text(
          pick(row,'dayKey','day_key')??dayKey
        ),
        selectedAt:text(
          pick(row,'selectedAt','selected_at')
        )
      });
    },

    async linkPlace(mediaId,placeId,options={}){
      const row=await provider(
        'LuviaMediaCore',
        'linkPlace'
      )(mediaId,placeId,options);

      return Object.freeze({
        mediaId:text(
          pick(row,'mediaId','media_id')??mediaId
        ),
        placeId:text(
          pick(row,'placeId','place_id')??placeId
        ),
        source:text(
          row?.source??options.source??'manual'
        ),
        confidence:number(
          row?.confidence??options.confidence??1
        )
      });
    },

    async remove(mediaId){
      return Boolean(
        await provider(
          'LuviaMediaCore',
          'remove'
        )(mediaId)
      );
    }

  });

  const albumCommands=Object.freeze({

    async save(input={}){
      return projectAlbum(
        await provider(
          'LuviaMemoryAlbums',
          'save'
        )(input)
      );
    },

    async remove(id){
      return Boolean(
        await provider(
          'LuviaMemoryAlbums',
          'remove'
        )(id)
      );
    },

    async setFavorite(albumId,mediaId){
      const row=await provider(
        'LuviaMemoryAlbums',
        'setFavorite'
      )(albumId,mediaId);

      return row
        ?Object.freeze({
            albumId:text(
              pick(row,'albumId','album_id')??albumId
            ),
            mediaId:text(
              pick(row,'mediaId','media_id')??mediaId
            ),
            userId:text(
              pick(row,'userId','user_id')
            )
          })
        :null;
    },

    async saveContribution(albumId,input={}){
      return projectContribution(
        await provider(
          'LuviaMemoryAlbums',
          'saveContribution'
        )(albumId,input)
      );
    }

  });

  const cardCommands=Object.freeze({

    async save(input={}){
      return projectCard(
        await provider(
          'LuviaMemoryCards',
          'save'
        )(input)
      );
    },

    async setWeight(id,weight){
      return projectCard(
        await provider(
          'LuviaMemoryCards',
          'setWeight'
        )(id,weight)
      );
    },

    async dismiss(id){
      return Boolean(
        await provider(
          'LuviaMemoryCards',
          'dismiss'
        )(id)
      );
    },

    async setAlbumReview(cardId,decision){
      const row=await provider(
        'LuviaMemoryCards',
        'setAlbumReview'
      )(cardId,decision);

      return row
        ?Object.freeze({
            cardId:text(
              pick(row,'cardId','card_id')??cardId
            ),
            decision:text(
              row.decision??decision
            ),
            userId:text(
              pick(row,'userId','user_id')
            )
          })
        :null;
    },

    async saveAlbumVotes(
      clusterId,
      votes={},
      budget=0
    ){
      const rows=await provider(
        'LuviaMemoryCards',
        'saveAlbumVotes'
      )(clusterId,votes,budget);

      return freezeArray(
        (rows||[]).map(row=>Object.freeze({
          clusterId:text(
            pick(row,'clusterId','cluster_id')??clusterId
          ),
          cardId:text(
            pick(row,'cardId','card_id')
          ),
          points:number(row.points)
        }))
      );
    },

    async updateStory(id,content){
      return projectCard(
        await provider(
          'LuviaMemoryCards',
          'updateStory'
        )(id,content)
      );
    },

    async syncPhotoCandidates(
      clusterId,
      mediaIds=[]
    ){
      const result=await provider(
        'LuviaMemoryCards',
        'syncPhotoCandidates'
      )(clusterId,mediaIds);

      return Object.freeze({
        clusterId:text(clusterId),
        mediaIds:freezeArray(
          (mediaIds||[]).map(String)
        ),
        ok:result!==false
      });
    },

    async saveTitleProposal(
      clusterId,
      title
    ){
      const row=await provider(
        'LuviaMemoryCards',
        'saveTitleProposal'
      )(clusterId,title);

      return row
        ?Object.freeze({
            clusterId:text(
              pick(row,'clusterId','cluster_id')??clusterId
            ),
            title:text(
              row.title??title
            ),
            userId:text(
              pick(row,'userId','user_id')
            )
          })
        :null;
    },

    async dissolveStack(clusterId){
      return Boolean(
        await provider(
          'LuviaMemoryCards',
          'dissolveStack'
        )(clusterId)
      );
    }

  });

  const journeyCommands=Object.freeze({

    async save(input={}){
      return projectJourney(
        await provider(
          'LuviaMemoryJourneys',
          'save'
        )(input)
      );
    },

    async saveContribution(
      journeyId,
      input={}
    ){
      return projectContribution(
        await provider(
          'LuviaMemoryJourneys',
          'saveContribution'
        )(journeyId,input)
      );
    },

    async remove(id){
      return Boolean(
        await provider(
          'LuviaMemoryJourneys',
          'remove'
        )(id)
      );
    }

  });

  function safeEventPayload(detail={}){
    return Object.freeze({
      tripId:text(
        pick(detail,'tripId','trip_id')
      ),
      mediaId:text(
        pick(detail,'mediaId','media_id')
      ),
      albumId:text(
        pick(detail,'albumId','album_id')
      ),
      cardId:text(
        pick(detail,'cardId','card_id')
      ),
      journeyId:text(
        pick(detail,'journeyId','journey_id')
      ),
      clusterId:text(
        pick(detail,'clusterId','cluster_id')
      ),
      dayKey:text(
        pick(detail,'dayKey','day_key')
      ),
      action:text(detail.action),
      deleted:Boolean(detail.deleted),
      local:Boolean(detail.local)
    });
  }

  function publish(name,sourceEvent){
    window.dispatchEvent(
      new CustomEvent(
        `luvia:${name}`,
        {
          detail:Object.freeze({
            contractId:CONTRACT_ID,
            version:VERSION,
            source:'media',
            sourceEvent:sourceEvent.type,
            payload:safeEventPayload(
              sourceEvent.detail||{}
            )
          })
        }
      )
    );
  }

  const bridges=[
    [
      'luvia:media-composite-updated',
      'media.changed'
    ],
    [
      'luvia:media-deleted',
      'media.deleted'
    ],
    [
      'luvia:media-polaroid-changed',
      'media.polaroid.changed'
    ],
    [
      'luvia:memory-card-updated',
      'memory.changed'
    ],
    [
      'luvia:memory-album-updated',
      'memory.changed'
    ],
    [
      'luvia:memory-journey-updated',
      'memory.changed'
    ],
    [
      'luvia:memory-contribution-updated',
      'memory.changed'
    ],
    [
      'luvia:memory-album-review-updated',
      'memory.changed'
    ],
    [
      'luvia:memory-album-votes-updated',
      'memory.changed'
    ],
    [
      'luvia:memory-curation-updated',
      'memory.changed'
    ]
  ];

  for(const [source,target] of bridges){
    window.addEventListener(
      source,
      event=>publish(target,event)
    );
  }

  const reads=Object.freeze({
    listMedia,
    getMedia,
    signedUrl,
    signedOriginalUrl,
    listAlbums,
    listCards,
    listJourneys
  });

  const commands=Object.freeze({
    media:mediaCommands,
    albums:albumCommands,
    cards:cardCommands,
    journeys:journeyCommands
  });

  const events=Object.freeze([
    'media.changed',
    'media.deleted',
    'media.polaroid.changed',
    'memory.changed'
  ]);

  const diagnostics=()=>Object.freeze({
    contractId:CONTRACT_ID,
    version:VERSION,
    runtimeVersion:RUNTIME_VERSION,

    ready:Boolean(
      window.LuviaMediaCore&&
      window.LuviaMemoryAlbums&&
      window.LuviaMemoryCards&&
      window.LuviaMemoryJourneys
    ),

    providers:Object.freeze({
      media:Boolean(
        window.LuviaMediaCore
      ),
      albums:Boolean(
        window.LuviaMemoryAlbums
      ),
      cards:Boolean(
        window.LuviaMemoryCards
      ),
      journeys:Boolean(
        window.LuviaMemoryJourneys
      )
    })
  });

  const api=Object.freeze({
    contractId:CONTRACT_ID,
    version:VERSION,
    runtimeVersion:RUNTIME_VERSION,

    reads,
    commands,
    events,

    listMedia,
    getMedia,
    signedUrl,
    signedOriginalUrl,
    listAlbums,
    listCards,
    listJourneys,

    diagnostics
  });

  window.LuviaMediaContractV1=api;
  window.LuviaMediaContract=api;

  window.LuviaGlobalContracts?.register?.({
    id:CONTRACT_ID,
    version:VERSION,
    owner:'Media/Memory',
    api,

    probe:()=>({
      available:diagnostics().ready,
      detail:'Luvia Media Contract v1'
    })
  });

})();