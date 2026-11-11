const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));
export const reference={width:2048,height:1080,listX:12,listY:86,listWidth:850,rowHeight:40,rowGap:4,video:{x:876,y:68,w:1158,h:990},rows:22};
export function renderSkin({channels=[],selected='',favorites=[],category='',onlyFavorites=false,clock='19:12',online=true,video=false}={}){
 const g=reference,fav=new Set(favorites),items=channels.slice(0,g.rows),rect=(x,y,w,h,fill,stroke='none',rx=5)=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="${fill}" stroke="${stroke}"/>`,text=(x,y,value,size=12,color='#f4f7fb',weight='normal')=>`<text x="${x}" y="${y}" font-size="${size}" font-weight="${weight}" fill="${color}">${esc(value)}</text>`;
 let out=`<svg xmlns="http://www.w3.org/2000/svg" width="2048" height="1080" viewBox="0 0 2048 1080" preserveAspectRatio="none"><defs><linearGradient id="bg"><stop stop-color="#0a1019"/><stop offset="1" stop-color="#142536"/></linearGradient><clipPath id="list"><rect x="12" y="80" width="850" height="972"/></clipPath><mask id="frame"><rect width="2048" height="1080" fill="white"/>${video?rect(g.video.x+1,g.video.y+1,g.video.w-2,g.video.h-2,'black','none',6):''}</mask></defs><g font-family="Arial,sans-serif" mask="url(#frame)">${rect(0,0,2048,1080,'url(#bg)','none',0)}`;
 out+=rect(12,3,18,18,'#79ebce')+text(17,16,'V',13,'#0b2421','bold')+text(35,17,'VIO',16,'#f4f7fb','bold')+text(75,14,'Т Е Л Е В И Д Е Н И Е',4,'#9aaabd');
 out+=text(1940,14,online?'● Сервер подключён':'○ Нет связи',5,online?'#79ebce':'#ffd49a')+text(2011,16,clock,10);
 out+=rect(12,29,85,25,onlyFavorites?'#152130':'#79ebce','#253243',4)+text(21,45,'Телеканалы',11,onlyFavorites?'#f4f7fb':'#0b2421','bold');
 out+=text(110,45,'★ Избранное',11,onlyFavorites?'#79ebce':'#f4f7fb')+rect(194,29,100,25,'#0d1723','#253243',4)+text(204,44,category||'Все категории',9)+text(280,44,'⌄',9);
 out+=rect(1880,29,74,25,'#0d1723','#253243',4)+text(1889,44,'⚙ Настройки',9)+rect(1960,29,74,25,'#0d1723','#253243',4)+text(1967,44,'Администратор',8);
 out+='<path d="M12 61H2034" stroke="#253243"/>'+text(12,75,onlyFavorites?'Любимые каналы':category||'Все телеканалы',8)+text(790,75,'Каналов: '+channels.length,7,'#9aaabd');
 out+='<g clip-path="url(#list)">';items.forEach((c,i)=>{const y=g.listY+i*(g.rowHeight+g.rowGap),active=c.id===selected;out+=rect(g.listX,y,g.listWidth,g.rowHeight,active?'#15302f':'#101b29',active?'#79ebce':'#192839',5)+text(21,y+22,String(c.number||i+1).padStart(2,'0'),6,'#9aaabd')+text(39,y+18,c.name,12)+text(39,y+31,c.now?.title||c.category||'Общие',7,'#9aaabd');if(fav.has(c.id))out+=text(837,y+24,'★',12,'#79ebce');});out+='</g>';
 if(!items.length)out+=text(39,124,'Подключите ваши телеканалы',16)+text(39,151,'Администратор добавляет плейлист один раз.',11,'#9aaabd');
 out+=rect(g.video.x,g.video.y,g.video.w,g.video.h,'#05080d','#253243',7)+rect(888,78,76,14,'#0a1019','none',3)+text(895,88,'● ПРЯМОЙ ЭФИР',5,'#79ebce');
 out+=text(12,1045,'VIO',5,'#d8e3ed','bold')+text(31,1045,'Просто включите любимый канал',5,'#9aaabd')+text(1960,1045,'Подключение',5,'#9aaabd');return out+'</g></svg>';
}
// Native hit targets remain real MSX items; the visual layer is rendered above them.
export function skinTarget(index,{x,y,w,h},data){const gx=index%8,gy=Math.floor(index/8);const px=x*1280/2048,py=y*720/1080,pw=w*1280/2048,ph=h*720/1080;return{...data,layout:`${gx},${gy},1,1`,offset:[(px-72)/96-gx,(py-96)/96-gy,(pw-80)/96,(ph-80)/96].map(n=>Number(n.toFixed(6))).join(',')};}

// Keep previous/current/next on one logical column. MSX navigates its logical
// grid, irrespective of visual offsets. Rebuild after selection to keep this
// invariant while rendering all 22 rows and retaining real mouse hit targets.
export function cursorSlots(count,current){let spare=0;return Array.from({length:count},(_,i)=>i===current?16:i===current-1?8:i===current+1?24:(()=>{const n=spare++;return 1+n%7+Math.floor(n/7)*8;})());}
