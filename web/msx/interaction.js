(function(){
 'use strict';var channels=[],category='',favoritesOnly=false,selected='',state={favorites:[],last:'',large:false,resume:true,fallback:false};
 try{var saved=JSON.parse(localStorage.getItem('vio.msx')||'{}');Object.keys(state).forEach(function(k){if(saved[k]!==undefined)state[k]=saved[k];});if(!Array.isArray(state.favorites))state.favorites=[];}catch(e){}
 function save(){try{localStorage.setItem('vio.msx',JSON.stringify(state));}catch(e){}}
 function get(url,callback){var x=new XMLHttpRequest();x.open('GET',url,true);x.timeout=15000;x.onload=function(){try{if(x.status!==200)throw Error('HTTP '+x.status);callback(null,JSON.parse(x.responseText));}catch(e){callback(e);}};x.onerror=x.ontimeout=function(){callback(Error('Нет связи с VIO'));};x.send();}
 function page(callback){var q='?favorites='+encodeURIComponent(state.favorites.join(','))+'&onlyFavorites='+favoritesOnly+'&category='+encodeURIComponent(category)+'&last='+encodeURIComponent(selected||(state.resume?state.last:''))+'&large='+state.large+'&fallback='+state.fallback;get('/msx/native.json'+q,function(e,data){if(e){callback({headline:'VIO',items:[{type:'button',layout:'0,0,12,2',label:'Повторить подключение',action:'reload:content'}]});}else callback(data);});}
 function settings(){return{headline:'Настройки VIO',template:{type:'control',layout:'0,0,8,1',action:'[back|interaction:commit]'},items:[
 {label:'★ Добавить / убрать выбранный канал',data:{cmd:'favorite'}},
 {label:'Крупный режим: '+(state.large?'включён':'выключен'),data:{cmd:'toggle',key:'large'}},
 {label:'Последний канал: '+(state.resume?'запоминать':'не восстанавливать'),data:{cmd:'toggle',key:'resume'}},
 {label:'Плеер: '+(state.fallback?'встроенный MSX':'VIO с мини-плеером'),data:{cmd:'toggle',key:'fallback'}},
 {label:'Настройки звука и видео MSX',action:'settings'},
 {label:'Обновить каналы и EPG',data:{cmd:'refresh'}},
 {label:'Администрирование на компьютере',action:'info:Подключение плейлиста и EPG: '+location.origin+'/admin{br}Просмотр каналов остаётся внутри Media Station X.'}
 ]};}
 function reload(){TVXInteractionPlugin.executeAction('content:request:interaction:home');}
 function Handler(){
 this.init=function(){};
 this.ready=function(){};
 this.handleRequest=function(id,data,callback){if(id==='categories'){get('/api/channels',function(e,j){channels=e?channels:j.channels;get('/msx/categories.json',function(err,p){callback(err?{headline:'Нет связи',items:[]}:p);});});return;}if(id==='settings'){callback(settings());return;}if(id.indexOf('move_')===0){selected=id.slice(5);state.last=selected;save();}if(id==='all'){favoritesOnly=false;category='';}if(id==='favorites')favoritesOnly=true;page(callback);};
 this.handleData=function(message){var d=message&&message.data;if(!d)return;if(d.cmd==='selected'){selected=d.id;state.last=d.id;save();return;}if(d.cmd==='favorite'){if(!selected){TVXInteractionPlugin.info('Сначала выберите канал');return;}var i=state.favorites.indexOf(selected);if(i<0)state.favorites.push(selected);else state.favorites.splice(i,1);save();reload();return;}if(d.cmd==='category'){category=d.value||'';reload();return;}if(d.cmd==='toggle'&&['large','resume','fallback'].indexOf(d.key)>=0){state[d.key]=!state[d.key];save();reload();return;}if(d.cmd==='refresh')reload();};
 }
 TVXPluginTools.onReady(function(){TVXInteractionPlugin.setupHandler(new Handler());TVXInteractionPlugin.init();});
})();
