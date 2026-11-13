import {skinTarget} from '../server/msx-skin.mjs';
// Keep the native selection engine at a fixed anchor. Direction buttons return
// focus synchronously, before the interaction iframe receives the step. Neither
// the native page nor its logical grid changes while the remote repeats a key.
export const playbackControls={'button:content:focus':'true','control:type':'extended','control:transparent':'true','control:timeout':'3','control:retune':'retain','control:action':'[player:content|focus:nav_anchor]','trigger:back':'[player:content|focus:nav_anchor]','trigger:active':'event:pip:disable','trigger:inactive':'event:pip:validate'};
export function cursorTarget(index,large=false){const size=large?8:22,row=((index%size)+size)%size;return skinTarget(16,{x:12,y:86+row*(large?120:44),w:850,h:large?112:40},{}).offset;}
export function stableNavigation(page,{count,currentIndex=0,categoryList=false,large=false,playAction}){
 const old=page.pages[0].items,nav=old.filter(i=>['all','favorites','categories','settings','admin'].includes(i.id));
 const row=currentIndex%(large?8:22),box={x:12,y:86+row*(large?120:44),w:850,h:large?112:40};
 const anchor=skinTarget(16,box,{properties:categoryList?undefined:playbackControls,id:'nav_anchor',type:'default',color:'transparent',focus:count>0,action:categoryList?'interaction:commit':playAction('current'),data:categoryList?{cmd:'categoryAt',current:true}:null,selection:{important:true,action:'interaction:commit',data:{cmd:'listNav',id:'',categoryList}}});
 const arrows=[[-1,8],[1,24]].map(([delta,slot])=>skinTarget(slot,{x:12,y:86+Math.max(0,Math.min((large?8:22)-1,row+delta))*(large?120:44),w:850,h:large?112:40},{id:delta<0?'nav_up':'nav_down',type:'default',color:'transparent',action:'none',selection:{important:true,action:'[focus:nav_anchor|interaction:commit]',data:{cmd:'listStep',delta,categoryList}}}));
 const hits=Array.from({length:count?(large?8:22):0},(_,i)=>skinTarget(4+i%4+Math.floor(i/4)*8,{x:12,y:86+i*(large?120:44),w:850,h:large?112:40},{properties:categoryList?undefined:playbackControls,id:'row_'+i,display:i<count,enable:i<count,type:'default',color:'transparent',action:categoryList?'interaction:commit':playAction('row_'+i),data:categoryList?{cmd:'categoryAt',index:i}:null,selection:{important:true,action:'[focus:nav_anchor|interaction:commit]',data:{cmd:'listPick',index:i,categoryList}}}));
 for(const i of nav)i.selection={important:true,action:'interaction:commit',data:{cmd:'listNav',id:i.id,categoryList}};
 if(!count){nav[0].focus=true;page.pages[0].items=nav;}else page.pages[0].items=[anchor,...arrows,...hits,...nav];
 return page;
}

// Render only the active row above an unchanged screen. MSX image transitions
// then affect the highlight, not the complete channel list or keyboard.
export function listLayers(svg,encode,{categoryList=false}={}){
 const row=svg.match(/<rect x="12" y="[0-9.]+" width="850" height="[0-9.]+" rx="5" fill="#15302f"[^>]*\/>[\s\S]*?(?=<rect|<\/g>)/)?.[0]||'';
 const name=row.match(/<text x="51"[^>]*>([\s\S]*?)<\/text>/)?.[1]||'',number=row.match(/<text x="17"[^>]*>([0-9]+)<\/text>/)?.[1]||'';
 const strong=row.replace('fill="#15302f"','fill="#79ebce"').replace('stroke="#79ebce"','stroke="#d8fff5" stroke-width="3"').replace(/<text /g,'<text font-weight="bold" ').replace(/fill="#(?:f4f7fb|9aaabd)"/g,'fill="#082720"').replace(/(<text[^>]*x="51"[^>]*font-size=")12"/,'$118"');
 const status=name?'<defs><clipPath id="selectedTitle"><rect x="310" y="26" width="1100" height="30"/></clipPath></defs><g clip-path="url(#selectedTitle)"><rect x="310" y="26" width="1100" height="30" rx="5" fill="#0d1723"/><text x="322" y="47" font-size="16" font-weight="bold" fill="#79ebce">'+(categoryList?'Выбрано: ':'Выбран канал ')+number+' · '+name+'</text></g>':'';
 const nav=(svg.match(/<rect[^>]*fill="none" stroke="#79ebce"[^>]*\/>/g)||[]).join('');
 return{base:encode(svg.split('fill="#15302f"').join('fill="#101b29"').split('stroke="#79ebce"').join('stroke="#192839"')),focus:encode('<svg xmlns="http://www.w3.org/2000/svg" width="2048" height="1152" viewBox="0 0 2048 1080" preserveAspectRatio="xMidYMid meet"><g font-family="Arial,sans-serif">'+strong+status+nav+'</g></svg>')};
}
