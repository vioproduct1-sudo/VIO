import {skinTarget} from '../server/msx-skin.mjs';
// Keep the native selection engine at a fixed anchor. Direction buttons return
// focus synchronously, before the interaction iframe receives the step. Neither
// the native page nor its logical grid changes while the remote repeats a key.
export function stableNavigation(page,{count,categoryList=false,large=false,playAction}){
 const old=page.pages[0].items,nav=old.filter(i=>['all','favorites','categories','settings','admin'].includes(i.id));
 const tiny={x:0,y:-35,w:1,h:1};
 const anchor=skinTarget(16,tiny,{id:'nav_anchor',type:'default',color:'transparent',focus:count>0,action:categoryList?'interaction:commit':playAction('current'),data:categoryList?{cmd:'categoryAt',current:true}:null,selection:{important:true,action:'interaction:commit',data:{cmd:'listNav',id:'',categoryList}}});
 const arrows=[[-1,8],[1,24]].map(([delta,slot])=>skinTarget(slot,tiny,{id:delta<0?'nav_up':'nav_down',type:'default',color:'transparent',action:'none',selection:{important:true,action:'[focus:nav_anchor|interaction:commit]',data:{cmd:'listStep',delta,categoryList}}}));
 const hits=Array.from({length:count?(large?8:22):0},(_,i)=>skinTarget(4+i%4+Math.floor(i/4)*8,{x:12,y:86+i*(large?120:44),w:850,h:large?112:40},{id:'row_'+i,display:i<count,enable:i<count,type:'default',color:'transparent',action:categoryList?'interaction:commit':playAction('row_'+i),data:categoryList?{cmd:'categoryAt',index:i}:null,selection:{important:true,action:'[focus:nav_anchor|interaction:commit]',data:{cmd:'listPick',index:i,categoryList}}}));
 for(const i of nav)i.selection={important:true,action:'interaction:commit',data:{cmd:'listNav',id:i.id,categoryList}};
 if(!count){nav[0].focus=true;page.pages[0].items=nav;}else page.pages[0].items=[anchor,...arrows,...hits,...nav];
 return page;
}

// Render only the active row above an unchanged screen. MSX image transitions
// then affect the highlight, not the complete channel list or keyboard.
export function listLayers(svg,encode){
 const row=svg.match(/<rect x="12" y="[0-9.]+" width="850" height="[0-9.]+" rx="5" fill="#15302f"[^>]*\/>[\s\S]*?(?=<rect|<\/g>)/)?.[0]||'';
 const nav=(svg.match(/<rect[^>]*fill="none" stroke="#79ebce"[^>]*\/>/g)||[]).join('');
 return{base:encode(svg.split('fill="#15302f"').join('fill="#101b29"').split('stroke="#79ebce"').join('stroke="#192839"')),focus:encode('<svg xmlns="http://www.w3.org/2000/svg" width="2048" height="1152" viewBox="0 0 2048 1080" preserveAspectRatio="xMidYMid meet"><g font-family="Arial,sans-serif">'+row+nav+'</g></svg>')};
}
