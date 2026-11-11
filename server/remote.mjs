import {lookup} from 'node:dns/promises';import http from 'node:http';import https from 'node:https';import net from 'node:net';import {webUrl} from './core.mjs';
import {createGunzip} from 'node:zlib';
import {xmltvCollector} from './xmltv-stream.mjs';
export function isPublicIp(address){if(net.isIP(address)===4){const[a,b]=address.split('.').map(Number);return!(a===0||a===10||a===127||a>=224||a===169&&b===254||a===172&&b>=16&&b<=31||a===192&&(b===168||b===0)||a===100&&b>=64&&b<=127||a===198&&(b===18||b===19));}if(net.isIP(address)===6)return/^[23][0-9a-f]{3}:/i.test(address)&&!/^2001:(db8|0):/i.test(address);return false;}
export async function fetchText(input,limit=6*1024*1024,hops=0,consumer=null){
 if(hops>3)throw Error('Слишком много перенаправлений');const url=new URL(webUrl(input)),host=url.hostname.replace(/^\[|\]$/g,'');const addresses=net.isIP(host)?[{address:host,family:net.isIP(host)}]:await lookup(host,{all:true});
 if(!addresses.length||addresses.some(a=>!isPublicIp(a.address)))throw Error('Ссылка должна вести на общедоступный сервер. Локальный плейлист загрузите файлом.');const chosen=addresses[0];
 return new Promise((resolve,reject)=>{const req=(url.protocol==='https:'?https:http).get(url,{headers:{'User-Agent':'VIO/1.0','Accept-Encoding':'identity'},lookup:(_h,o,cb)=>{if(o?.all)cb(null,[chosen]);else cb(null,chosen.address,chosen.family);}},res=>{
 if([301,302,303,307,308].includes(res.statusCode)){res.resume();if(!res.headers.location)return reject(Error('Пустое перенаправление'));fetchText(new URL(res.headers.location,url).href,limit,hops+1,consumer).then(resolve,reject);return;}if(res.statusCode!==200){res.resume();reject(Error('Источник ответил HTTP '+res.statusCode));return;}
 const gzip=/gzip/i.test(res.headers['content-encoding']||'')||/\.gz$/i.test(url.pathname),stream=gzip?res.pipe(createGunzip()):res;
 const chunks=[];let size=0;stream.on('data',c=>{try{size+=c.length;if(size>limit)throw Error('Распакованный источник слишком большой');if(consumer)consumer.write(c);else chunks.push(c);}catch(e){reject(e);stream.destroy();req.destroy();}});stream.on('end',()=>{try{resolve(consumer?consumer.finish():Buffer.concat(chunks).toString('utf8'));}catch(e){reject(e);}});stream.on('error',reject);res.on('error',reject);});req.setTimeout(30000,()=>req.destroy(Error('Источник не ответил за 30 секунд')));req.on('error',reject);});
}
export async function fetchXmltv(url,ids,names=new Set()){return fetchText(url,800*1024*1024,0,xmltvCollector(ids,Date.now(),names));}
