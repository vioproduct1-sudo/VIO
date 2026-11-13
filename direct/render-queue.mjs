export function createRenderQueue({schedule,cancel,preload,execute}){
 let task=null,ticket=null,revision=0;
 function deliver(result,version){if(!result||version!==revision)return;const effects=result.effects||[result],images=effects.filter(e=>e.data&&e.data.image).map(e=>e.data.image);preload(images,ok=>{if(!ok||version!==revision)return;for(const effect of effects)execute(effect.action,effect.data);if(result.onApplied)result.onApplied();});}
 return{enqueue(result){const version=++revision;if(ticket!==null)cancel(ticket);task=result;ticket=schedule(()=>{ticket=null;const current=task;task=null;deliver(current.render?current.render():current,version);});},clear(){revision++;task=null;if(ticket!==null)cancel(ticket);ticket=null;}};
}
