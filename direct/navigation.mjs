import {skinTarget} from '../server/msx-skin.mjs';
// Keep the native selection engine at a fixed anchor. Direction buttons return
// focus synchronously, before the interaction iframe receives the step. Neither
// the native page nor its logical grid changes while the remote repeats a key.
export function stableNavigation(page,{count,categoryList=false,large=false,playAction,labels=[]}){
 const old=page.pages[0].items,nav=old.filter(i=>['all','favorites','categories','settings','admin'].includes(i.id));
 const tiny={x:0,y:-35,w:1,h:1};
 const anchor=skinTarget(16,tiny,{id:'nav_anchor',type:'default',color:'transparent',focus:count>0,action:categoryList?'interaction:commit':playAction('current'),data:categoryList?{cmd:'categoryAt',current:true}:null,selection:{important:true,action:'interaction:commit',data:{cmd:'listNav',id:'',categoryList}}});
 const arrows=[[-1,8],[1,24]].map(([delta,slot])=>skinTarget(slot,tiny,{id:delta<0?'nav_up':'nav_down',type:'default',color:'transparent',action:'none',selection:{important:true,action:'[focus:nav_anchor|interaction:commit]',data:{cmd:'listStep',delta,categoryList}}}));
 const hits=Array.from({length:count?(large?8:22):0},(_,i)=>skinTarget(4+i%4+Math.floor(i/4)*8,{x:12,y:86+i*(large?120:44),w:850,h:large?112:40},{id:'row_'+i,display:i<count,enable:i<count,label:labels[i]||'',type:'default',color:'transparent',action:categoryList?'interaction:commit':playAction('row_'+i),data:categoryList?{cmd:'categoryAt',index:i}:null,selection:{important:true,action:'[focus:nav_anchor|interaction:commit]',data:{cmd:'listPick',index:i,categoryList}}}));
 for(const i of nav)i.selection={important:true,action:'interaction:commit',data:{cmd:'listNav',id:i.id,categoryList}};
 if(!count){nav[0].focus=true;page.pages[0].items=nav;}else page.pages[0].items=[anchor,...arrows,...hits,...nav];
 return page;
}
