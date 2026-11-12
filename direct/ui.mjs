const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));

export function screenImage({title,description='',value=null,message='',buttons=[],focus=''},encode){
 const rect=(x,y,w,h,fill,stroke='#24394b')=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="12" fill="${fill}" stroke="${stroke}"/>`;
 const text=(x,y,t,size=24,color='#edf7fb',weight='normal')=>`<text x="${x}" y="${y}" font-size="${size}" fill="${color}" font-weight="${weight}">${esc(t)}</text>`;
 let svg='<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="720" viewBox="0 0 1280 720"><defs><linearGradient id="bg" x2="1" y2="1"><stop stop-color="#08111c"/><stop offset="1" stop-color="#152a3a"/></linearGradient></defs><rect width="1280" height="720" fill="url(#bg)"/><g font-family="Arial,sans-serif">';
 svg+=rect(40,28,40,40,'#79ebce','#79ebce')+text(51,57,'V',29,'#09241f','bold')+text(94,58,'VIO',32,'#edf7fb','bold')+text(200,57,title,27)+text(48,100,description,18,'#a8bed0');
 if(value!==null){svg+=rect(48,118,1184,104,'#0a1724');const long=String(value).length>68,lines=String(value||'Ключ не задан').match(long?/.{1,96}/gu:/.{1,68}/gu)||[''];lines.slice(0,3).forEach((line,i)=>{svg+=text(68,148+i*29,line,long?18:24,'#79ebce');});}
 if(message)svg+=text(48,692,message,17,'#a8bed0');
 for(const button of buttons){const [x,y,w,h]=button.box,active=button.id===focus;svg+=rect(x,y,w,h,active?'#79ebce':'#101f2e',active?'#79ebce':'#2a4154')+text(x+w/2,y+h/2+8,button.label,button.small?19:24,active?'#09241f':'#edf7fb',active?'bold':'normal').replace('<text ','<text text-anchor="middle" ');}
 return encode(svg+'</g></svg>');
}

export function screenPage(config,encode){
 const image=screenImage(config,encode);
 return{name:'VIO',headline:'',type:'pages',flag:'vio-ui',transparent:1,background:image,caption:'',pages:[{items:config.buttons.map((button,i)=>{
  const [gx,gy]=button.layout.split(',').map(Number),[x,y,w,h]=button.box;
  return{id:button.id,type:'default',color:'transparent',layout:button.layout,offset:[(x-72)/96-gx,(y-96)/96-gy,(w-80)/96-(Number(button.layout.split(',')[2])-1),(h-80)/96-(Number(button.layout.split(',')[3])-1)].map(n=>Number(n.toFixed(6))).join(','),focus:button.id===config.focus,action:button.action||'interaction:commit',data:button.data,selection:{important:true,action:'interaction:commit',data:{cmd:'uiFocus',id:button.id}}};
 })}],overlay:{important:true,items:[{id:'vioUi',type:'space',layout:'0,0,12,6',offset:'-0.75,-1,1.5,1.666667',image,imageFiller:'width-center',imagePreload:true}]}};
}
