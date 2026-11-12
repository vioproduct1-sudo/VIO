const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));
export const reference={width:2048,height:1080,listX:12,listY:86,listWidth:850,rowHeight:40,rowGap:4,video:{x:876,y:68,w:1158,h:990},rows:22};
export function renderSkin({channels=[],selected='',favorites=[],category='',onlyFavorites=false,clock='19:12',online=true,video=false,large=false,nav='',fallback=false,categoryList=false,total=channels.length}={}){
 const g=large?{...reference,rows:8,rowHeight:112,rowGap:8}:reference,fav=new Set(favorites),items=channels.slice(0,g.rows),rect=(x,y,w,h,fill,stroke='none',rx=5)=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="${fill}" stroke="${stroke}"/>`,text=(x,y,value,size=12,color='#f4f7fb',weight='normal')=>`<text x="${x}" y="${y}" font-size="${size}" font-weight="${weight}" fill="${color}">${esc(value)}</text>`;
 let out=`<svg xmlns="http://www.w3.org/2000/svg" width="2048" height="1152" viewBox="0 0 2048 1080" style="background:#0a1019" preserveAspectRatio="xMidYMid meet"><defs><linearGradient id="bg"><stop stop-color="#0a1019"/><stop offset="1" stop-color="#142536"/></linearGradient><clipPath id="list"><rect x="12" y="80" width="850" height="972"/></clipPath><mask id="frame"><rect width="2048" height="1080" fill="white"/>${video?rect(g.video.x+1,g.video.y+1,g.video.w-2,g.video.h-2,'black','none',6):''}</mask></defs><g font-family="Arial,sans-serif" mask="url(#frame)">${rect(0,0,2048,1080,'url(#bg)','none',0)}`;
 out+=rect(12,3,18,18,'#79ebce')+text(17,16,'V',13,'#0b2421','bold')+text(35,17,'VIO',16,'#f4f7fb','bold')+text(75,14,'Т Е Л Е В И Д Е Н И Е',4,'#9aaabd');
 out+=text(1940,14,online?'● Сервер подключён':'○ Нет связи',5,online?'#79ebce':'#ffd49a')+text(2011,16,clock,10);
 out+=rect(12,29,85,25,onlyFavorites?'#152130':'#79ebce','#253243',4)+text(21,45,'Телеканалы',11,onlyFavorites?'#f4f7fb':'#0b2421','bold');
 out+=text(110,45,'★ Избранное',11,onlyFavorites?'#79ebce':'#f4f7fb')+rect(194,29,100,25,'#0d1723','#253243',4)+text(204,44,category||'Все категории',9)+text(280,44,'⌄',9);
 out+=rect(1880,29,74,25,'#0d1723','#253243',4)+text(1889,44,'⚙ Настройки',9)+rect(1960,29,74,25,'#0d1723','#253243',4)+text(1967,44,'Администратор',8);
 const navBoxes={all:[12,29,85,25],favorites:[106,29,84,25],categories:[194,29,100,25],settings:[1880,29,74,25],admin:[1960,29,74,25]};if(navBoxes[nav])out+=rect(...navBoxes[nav],'none','#79ebce',4);
 out+='<path d="M12 61H2034" stroke="#253243"/>'+text(12,75,onlyFavorites?'Любимые каналы':categoryList?'Категории':category||'Все телеканалы',8)+text(790,75,(categoryList?'Категорий: ':'Каналов: ')+total,7,'#9aaabd');
 out+='<g clip-path="url(#list)">';items.forEach((c,i)=>{const y=g.listY+i*(g.rowHeight+g.rowGap),active=c.id===selected;out+=rect(g.listX,y,g.listWidth,g.rowHeight,active?'#15302f':'#101b29',active?'#79ebce':'#192839',5)+text(17,y+22,String(c.number||i+1).padStart(3,'0'),9,'#9aaabd')+text(51,y+(large?45:18),c.name,large?28:12)+text(39,y+(large?80:31),categoryList?'Выбрать категорию':c.now?.title||c.category||'Общие',large?18:7,'#9aaabd');if(fav.has(c.id))out+=text(837,y+24,'★',12,'#79ebce');});out+='</g>';
 if(!items.length)out+=text(39,124,'Подключите ваши телеканалы',16)+text(39,151,'Администратор добавляет плейлист один раз.',11,'#9aaabd');
 out+=rect(g.video.x,g.video.y,g.video.w,g.video.h,'#05080d','#253243',7)+rect(888,78,76,14,'#0a1019','none',3)+text(895,88,'● ПРЯМОЙ ЭФИР',5,'#79ebce');
 if(fallback&&!categoryList)out+=text(1110,440,'Нажмите OK для просмотра',28)+text(1110,485,'Встроенный плеер MSX · полный кадр',18,'#9aaabd');
 out+=text(12,1045,'VIO',5,'#d8e3ed','bold')+text(31,1045,'Просто включите любимый канал',5,'#9aaabd')+text(1960,1045,'Подключение',5,'#9aaabd');return out+'</g></svg>';
}
// Native hit targets remain real MSX items; the visual layer is rendered above them.
export function skinTarget(index,{x,y,w,h},data){const gx=index%8,gy=Math.floor(index/8);const px=x*1280/2048,py=(y+36)*720/1152,pw=w*1280/2048,ph=h*720/1152;return{...data,layout:`${gx},${gy},1,1`,offset:[(px-72)/96-gx,(py-96)/96-gy,(pw-80)/96,(ph-80)/96].map(n=>Number(n.toFixed(6))).join(',')};}

// Keep previous/current/next on one logical column. MSX navigates its logical
// grid, irrespective of visual offsets. Rebuild after selection to keep this
// invariant while rendering all 22 rows and retaining real mouse hit targets.
export function cursorSlots(count,current){let spare=0;return Array.from({length:count},(_,i)=>i===current?16:i===current-1?8:i===current+1?24:(()=>{const n=spare++;return 2+n%6+Math.floor(n/6)*8;})());}

export function skinChannels(channels,base,options={}){
 const {favorites=[],onlyFavorites=false,category='',last='',fallback=false,large=false}=options;
 const filtered=channels.filter(c=>(!onlyFavorites||favorites.includes(c.id))&&(!category||c.category===category));
 const rows=large?8:22,step=large?120:44,height=large?112:40;
 const current=Math.max(0,filtered.findIndex(c=>c.id===last)),start=Math.floor(current/rows)*rows,visible=filtered.slice(start,start+rows),local=current-start,slots=cursorSlots(visible.length,local);
 const query=new URLSearchParams({favorites:favorites.join(','),onlyFavorites:String(onlyFavorites),category,last:filtered[current]?.id||'',fallback:String(fallback),large:String(large)});
 const image=base+'/msx/skin.svg?'+query,move=id=>'replace:content:pip:request:interaction:move_'+id;
 const items=visible.map((c,i)=>skinTarget(slots[i],{x:12,y:86+i*step,w:850,h:height},{id:'ch_'+c.id,type:'default',color:'transparent',focus:i===local,playerLabel:c.name,
  action:fallback?'video:'+c.url:'video:plugin:'+base+'/msx/player.html?id='+encodeURIComponent(c.id)+'&skin=1',
  selection:i===local?{important:true,action:fallback?'[update:content:overlay:skin|interaction:commit]':'[update:content:overlay:skin|interaction:commit|delay:autoplay:1:autoplay]',data:{cmd:'selected',id:c.id,image}}:{important:true,action:move(c.id)},
  properties:{'control:type':'extended','control:transparent':'true','control:reuse':'retain','control:timeout':'3','trigger:active':'event:pip:disable','trigger:inactive':'event:pip:validate','trigger:execute':'delay:autoplay:cancel','trigger:back':'player:content'}
 }));
 const nav=[['all',17,{x:12,y:29,w:85,h:25},'content:request:interaction:all'],['favorites',25,{x:110,y:29,w:80,h:25},'content:request:interaction:favorites'],['categories',33,{x:194,y:29,w:100,h:25},'content:request:interaction:categories'],['settings',9,{x:1880,y:29,w:74,h:25},'panel:request:interaction:settings'],['admin',1,{x:1960,y:29,w:74,h:25},'info:Администратор: '+base+'/admin']];
 nav.forEach(([id,slot,box,action])=>items.push(skinTarget(slot,box,{id,type:'default',color:'transparent',action,selection:{important:true,action:'update:content:overlay:skin',data:{image:image+'&nav='+id}}})));
 for(const [idx,slot]of [[current-1,8],[current+1,24]])if(idx>=0&&idx<filtered.length&&(idx<start||idx>=start+rows))items.push(skinTarget(slot,{x:0,y:0,w:1,h:1},{id:'edge_'+idx,type:'default',color:'transparent',action:move(filtered[idx].id),selection:{important:true,action:move(filtered[idx].id)}}));
 if(!filtered.length)items[0].focus=true;
 return {name:'VIO',headline:'',flag:'pip',type:'pages',transparent:1,wrap:false,pages:[{items}],overlay:{items:[{id:'skin',type:'space',layout:'0,0,12,6',offset:'-0.75,-1,1.5,1.666667',image,imageFiller:'width-center',imagePreload:true}]}};
}

export function channelSkin(channels,options={}){
 const {favorites=[],onlyFavorites=false,category='',last='',large=false,nav='',fallback=false,categoryList=false}=options;
 const filtered=channels.filter(c=>(!onlyFavorites||favorites.includes(c.id))&&(!category||c.category===category));
 const rows=large?8:22,current=Math.max(0,filtered.findIndex(c=>c.id===last)),start=Math.floor(current/rows)*rows;
 const time=new Date().toLocaleTimeString('ru-RU',{hour:'2-digit',minute:'2-digit'});
 return renderSkin({channels:filtered.slice(start,start+rows).map(c=>({...c,number:c.number||channels.indexOf(c)+1})),selected:filtered[current]?.id,favorites,onlyFavorites,category,clock:time,video:!fallback,large,nav,fallback,categoryList,total:filtered.length});
}

export function categoryRows(channels){return [{id:'cat_0',number:1,name:'Все категории',category:'',value:''},...[...new Set(channels.map(c=>c.category))].map((value,i)=>({id:'cat_'+(i+1),number:i+2,name:value,category:'',value}))];}
export function skinCategories(channels,base,options={}){
 const rows=categoryRows(channels),last=options.categoryCursor||'cat_0';
 const page=skinChannels(rows,base,{last,large:options.large,fallback:true});
 page.overlay.items[0].image=base+'/msx/skin.svg?categoryList=true&last='+last+'&large='+!!options.large;
 for(const item of page.pages[0].items){
  if(item.id.startsWith('ch_')){const row=rows.find(r=>'ch_'+r.id===item.id);item.action='interaction:commit';item.data={cmd:'category',value:row.value};if(item.focus)item.selection={important:true,action:'update:content:overlay:skin',data:{image:page.overlay.items[0].image}};else item.selection.action=item.selection.action.replace('move_cat_','categoryMove_cat_');}
  else if(item.id.startsWith('edge_')){item.action=item.action.replace('move_cat_','categoryMove_cat_');item.selection.action=item.action;}
  else if(item.selection?.data)item.selection.data.image=page.overlay.items[0].image+'&nav='+item.id;
 }return page;
}
