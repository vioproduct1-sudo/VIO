import {skinChannels,channelSkin} from '../server/msx-skin.mjs';
export const previewTestId='vio-preview-test';
export const previewTestUrl='https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8';
export function previewTestPage(base,version,encode){
 const channel={id:previewTestId,name:'Тест малого окна: нажмите OK',number:1,category:'После запуска нажмите OK ещё раз — вернётся список',url:''};
 const page=skinChannels([channel],base,{last:channel.id,large:true,fallback:false});
 page.transparent=2;page.background=null;page.underlay={action:'event:pip:validate'};
 page.overlay.items[0].image=encode(channelSkin([channel],{last:channel.id,large:true,fallback:false}).replace('Сервер подключён','Тест без ключа'));
 const item=page.pages[0].items.find(i=>i.id==='ch_'+channel.id);
 const returnToTest='content:request:interaction:previewTest@'+base+'/interaction.html?v='+version;
 item.action='video:plugin:'+base+'/player.html?id='+channel.id+'&skin=1&v='+version;
 item.selection={action:'none'};
 item.properties={...item.properties,'control:action':returnToTest,'trigger:back':returnToTest,'button:content:icon':'list','button:content:action':returnToTest,'button:content:focus':'true'};
 const back=page.pages[0].items.find(i=>i.id==='all');back.focus=false;back.action='content:request:interaction:home';back.selection={action:'none'};
 page.pages[0].items=[item,back];return page;
}
