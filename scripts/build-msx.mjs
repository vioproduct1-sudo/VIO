import {directVersion} from './direct-version.mjs';
import {mkdir,writeFile,copyFile,readFile} from 'node:fs/promises';
const raw='https://raw.githubusercontent.com/vioproduct1-sudo/VIO/main';
const direct=!process.env.VIO_TV_URL;
const server=(process.env.VIO_TV_URL||'https://vioproduct1-sudo.github.io/VIO').replace(/\/$/,'');
const interaction=server+(direct?'/interaction.html?v='+directVersion:'/msx/interaction.html');
export function home(base=server){if(direct)return{headline:'VIO · Телевидение',type:'pages',pages:[{items:[{type:'button',layout:'0,0,12,2',label:'Открыть телеканалы VIO',action:'content:request:interaction:home@'+interaction},{type:'space',layout:'0,3,12,2',text:'Ключ доступа вводится внутри VIO и сохраняется только на этом устройстве. Каналы воспроизводятся напрямую от провайдера.'}]}]};return{headline:'VIO · Телевидение',type:'pages',compress:false,pages:[{items:[
 {type:'space',layout:'0,0,12,1',headline:'VIO',text:'ТЕЛЕКАНАЛЫ · ИЗБРАННОЕ · ПРОСТОЕ УПРАВЛЕНИЕ',color:'msx-black'},
 {type:'button',layout:'0,1,5,1',label:'VIO · Загрузить телеканалы в MSX',execute:true,action:'content:request:interaction:home@'+base+'/msx/interaction.html'},
 {type:'button',layout:'0,2,5,1',label:'Администрирование',action:'info:Админка доступна с компьютера: '+base+'/admin. Просмотр телеканалов работает внутри Media Station X.'},
 {type:'button',layout:'0,3,5,1',label:'Как подключить',action:'info:VIO работает с вашим сервером в домашней сети.{br}1. Запустите контейнер VIO на NAS.{br}2. Администратор подключает M3U и EPG.{br}3. Откройте телевидение и выберите канал.{br}{br}Адрес VIO: '+base},
 {type:'space',layout:'6,1,6,3',headline:'Ваши каналы.{br}Большой экран.',text:'Список каналов и просмотр справа.{br}Крупные кнопки. Управление пультом.{br}Последний канал и избранное.',color:'msx-black'},
 {type:'space',layout:'0,5,12,1',text:'Для просмотра нужен запущенный сервер VIO на NAS. Адрес панели /portal/ не является адресом VIO.',color:'msx-black'}
]}]};}
await mkdir('msx/content',{recursive:true});await mkdir('web/vendor',{recursive:true});
await copyFile('node_modules/hls.js/dist/hls.min.js','web/vendor/hls.min.js');
await copyFile('node_modules/hls.js/LICENSE','web/vendor/HLS-LICENSE.txt');
await writeFile('msx/start.json',JSON.stringify({name:'VIO',version:direct?directVersion:'1.1.4',parameter:'content:request:interaction:home@'+interaction},null,2)+'\n');
for(const name of ['home','tv','settings','about','catalog','movies','series'])await writeFile('msx/content/'+name+'.json',JSON.stringify(home(),null,2)+'\n');
await writeFile('msx/menu.json',JSON.stringify({headline:'VIO · Телевидение',menu:[{id:'tv',label:'Телеканалы',data:raw+'/msx/content/home.json'}]},null,2)+'\n');
console.log('VIO: собраны ТВ-страницы MSX и HLS-плеер');
