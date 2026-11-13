export function showSubscriptionNotice(message,doc=document,schedule=setTimeout){
 if(typeof message!=='string'||!message)return;
 const element=doc.createElement('div');element.textContent='VIO · '+message;
 element.setAttribute('role','status');
 element.style.cssText='position:fixed;z-index:9999;left:5%;right:5%;top:4%;padding:18px 24px;background:#102923ee;color:#d8fff5;border:2px solid #79ebce;border-radius:12px;font:600 26px Arial,sans-serif;pointer-events:none;text-align:center';
 doc.body.appendChild(element);schedule(()=>element.remove(),30000);
}
