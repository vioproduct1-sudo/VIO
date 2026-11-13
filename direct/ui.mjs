import {skinBackdrop} from '../server/msx-background.mjs';
export const compactBox=([x,y,w,h])=>[160+(x-48)*960/1184,210+(y-245)*0.82,w*960/1184,h*0.82];
const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));

export function screenImage({title,description='',value=null,message='',buttons=[],focus='',layer='all'},encode){
 const rect=(x,y,w,h,fill,stroke='#24394b')=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="12" fill="${fill}" stroke="${stroke}"/>`;
 const text=(x,y,t,size=24,color='#edf7fb',weight='normal')=>`<text x="${x}" y="${y}" font-size="${size}" fill="${color}" font-weight="${weight}">${esc(t)}</text>`;
 let svg='<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="720" viewBox="0 0 1280 720"><defs><linearGradient id="bg" x2="1" y2="1"><stop stop-color="#0a1019"/><stop offset="1" stop-color="#142536"/></linearGradient></defs><g font-family="Arial,sans-serif">';
 if(layer==='all')svg+='<rect width="1280" height="720" fill="url(#bg)"/>';
 if(layer==='all')svg+=rect(160,34,32,32,'#79ebce','#79ebce')+text(169,58,'V',24,'#09241f','bold')+text(204,60,'VIO',26,'#edf7fb','bold')+text(292,59,title,28)+text(160,96,description,18,'#a8bed0');
 if(value!==null&&layer!=='focus'){svg+=rect(160,115,960,84,'#0a1724');const long=String(value).length>68,lines=String(value||'Ключ не задан').match(long?/.{1,96}/gu:/.{1,68}/gu)||[''];lines.slice(0,3).forEach((line,i)=>{svg+=text(176,140+i*24,line,long?16:20,'#79ebce');});}
 if(message&&layer!=='focus')svg+='<rect x="150" y="575" width="990" height="36" fill="#142536"/>'+text(160,596,message,18,'#a8bed0');
 for(const button of buttons){const [x,y,w,h]=compactBox(button.box),active=button.id===focus;if(layer==='field'||layer==='focus'&&!active)continue;svg+=rect(x,y,w,h,active?'#79ebce':'#101b29',active?'#79ebce':'#2a4154')+text(x+w/2,y+h/2+7,button.label,button.small?18:24,active?'#09241f':'#edf7fb',active?'bold':'normal').replace('<text ','<text text-anchor="middle" ');}
 return encode(svg+'</g></svg>');
}

export function screenPage(config,encode){
 const split=!!config.keyboard;const image=screenImage(split?{...config,focus:'',value:null,message:''}:config,encode);
 return{name:'VIO',headline:'',type:'pages',flag:'vio-ui',transparent:1,background:skinBackdrop,caption:'',pages:[{items:config.buttons.map((button,i)=>{
  const [gx,gy]=button.layout.split(',').map(Number),[x,y,w,h]=compactBox(button.box);
  return{id:button.id,key:button.key,type:'default',color:'transparent',layout:button.layout,offset:[(x-72)/96-gx,(y-96)/96-gy,(w-80)/96-(Number(button.layout.split(',')[2])-1),(h-80)/96-(Number(button.layout.split(',')[3])-1)].map(n=>Number(n.toFixed(6))).join(','),focus:button.id===config.focus,action:button.action||'interaction:commit',data:button.data,selection:{important:true,action:'interaction:commit',data:{cmd:'uiFocus',id:button.id,view:config.view}}};
 })}],overlay:{important:true,items:[{id:'vioUi',type:'space',layout:'0,0,12,6',offset:'-0.75,-1,1.5,1.666667',image,imageFiller:'width-center',imagePreload:true},...(split?['field','focus'].map(layer=>({id:layer==='field'?'vioField':'vioFocus',type:'space',layout:'0,0,12,6',offset:'-0.75,-1,1.5,1.666667',image:screenImage({...config,layer},encode),imageFiller:'width-center',imagePreload:true})):[])]}};
}

export function connectionErrorPage(encode){
 return screenPage({title:'Нет связи с каталогом',description:'Не удалось загрузить каналы VIO. Проверьте интернет и повторите подключение.',message:'Ваш сохранённый ключ не изменён.',focus:'retry',buttons:[{id:'retry',label:'Повторить подключение',layout:'0,0,8,1',box:[48,250,1184,72],action:'reload'}]},encode);
}

