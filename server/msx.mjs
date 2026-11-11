const clean=s=>String(s||'').replace(/[{}]/g,'');
const commit=data=>({action:'interaction:commit',data});
export function nativeChannels(channels,base,{favorites=[],onlyFavorites=false,category='',last='',large=false,fallback=false}={}){
 const fav=new Set(favorites),filtered=channels.filter(c=>(!onlyFavorites||fav.has(c.id))&&(!category||c.category===category));
 const rows=large?3:6,pages=[],half=large?6:8,buttonWidth=half/2,right=large?7:9,bottom=large?5:7;
 for(let n=0;n<Math.max(1,filtered.length);n+=rows){const items=[
  {type:'button',layout:`0,0,${buttonWidth},1`,label:'Телеканалы',action:'content:request:interaction:all'},
  {type:'button',layout:`${buttonWidth},0,${buttonWidth},1`,label:'★ Избранное',action:'content:request:interaction:favorites'},
  {type:'button',layout:`0,1,${buttonWidth},1`,label:category?clean(category):'Категории',action:'panel:request:interaction:categories'},
  {type:'button',layout:`${buttonWidth},1,${buttonWidth},1`,label:'Настройки',action:'panel:request:interaction:settings'}
 ];
 filtered.slice(n,n+rows).forEach((c,i)=>items.push({
  id:'ch_'+c.id,type:'control',compress:false,layout:`0,${i+2},${half},1`,...(large?{offset:`0,${i*0.25},0,0.25`}:{}),focus:c.id===last,
  label:(fav.has(c.id)?'★ ':'')+String(channels.indexOf(c)+1).padStart(2,'0')+'  '+clean(c.name),color:'#152332',
  description:[clean(c.now?.title||'Телепрограмма не подключена'),c.next?'Далее: '+clean(c.next.title):'','OK — полный экран. Назад — список.'].filter(Boolean).join('{br}'),
  playerLabel:clean(c.name),action:fallback?'video:'+c.url:'video:plugin:'+base+'/msx/player.html?id='+encodeURIComponent(c.id),
  selection:{important:true,action:'[update:content:overlay:details|interaction:commit|delay:autoplay:1:autoplay]',data:{cmd:'selected',id:c.id,headline:clean(c.name),text:[clean(c.now?.title||c.category),c.next?'Далее: '+clean(c.next.title):'','OK — полный экран. Назад — список.'].filter(Boolean).join('{br}')}},
  live:{type:'playback',running:{stamp:'В ЭФИРЕ'},action:'player:show'},
  properties:{'control:type':'extended','control:transparent':'true','control:reuse':'retain','control:timeout':'3','trigger:active':'event:pip:disable','trigger:inactive':'event:pip:validate','trigger:execute':'delay:autoplay:cancel'}
 }));
 if(!filtered.length)items.push({type:'space',layout:'0,1,6,4',color:'#152332',headline:onlyFavorites?'Избранное пока пусто':'Каналы не найдены',text:onlyFavorites?'Выберите канал в общем списке и нажмите «★ Добавить / убрать».':'Подключите M3U через админку на компьютере: '+base+'/admin'});
 items.push({type:'button',layout:`${right},${bottom},${large?3:4},1`,label:'★ Добавить / убрать',...commit({cmd:'favorite'})},{type:'button',layout:`${large?10:13},${bottom},${large?2:3},1`,label:'Во весь экран',action:'player:show'});
 pages.push({items});}
 return {headline:'VIO · '+(onlyFavorites?'Избранное':category?clean(category):'Телеканалы')+' · '+filtered.length,flag:'pip',transparent:2,type:'pages',compress:!large,navigationSpan:half,pages,underlay:{action:'event:pip:validate'},overlay:{items:[{id:'details',type:'space',layout:`${right},${large?3:4},${large?5:7},2`,offset:'-0.5,0.5,0.5,-0.5',headline:'VIO',text:'Выберите канал слева. Просмотр появится справа.'}]}};
}
export function nativeCategories(channels){return{headline:'Категории',template:{type:'control',layout:'0,0,8,1',action:'[back|interaction:commit]'},items:[{label:'Все категории',data:{cmd:'category',value:''}},...[...new Set(channels.map(c=>c.category))].map(c=>({label:clean(c),data:{cmd:'category',value:c}}))]};}
