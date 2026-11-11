import {createHash,scrypt,timingSafeEqual,randomBytes} from 'node:crypto';
import {promisify} from 'node:util';
import {XMLParser,XMLValidator} from 'fast-xml-parser';
const derive=promisify(scrypt);
export function webUrl(value){const u=new URL(value);if(!['http:','https:'].includes(u.protocol)||u.username||u.password)throw Error('Нужна ссылка HTTP(S) без логина в адресе');return u.href;}
export function parseM3u(text){
 if(typeof text!=='string'||!text.replace(/^\uFEFF/,'').trimStart().startsWith('#EXTM3U'))throw Error('Нужен плейлист M3U/M3U8 с заголовком #EXTM3U');
 const channels=[];let meta=null;
 for(const raw of text.split(/\r?\n/)){const line=raw.trim();if(line.startsWith('#EXTINF:')){
  let comma=-1,quoted=false;for(let i=0;i<line.length;i++){if(line[i]==='"')quoted=!quoted;if(line[i]===','&&!quoted){comma=i;break;}}
  const attrs=Object.fromEntries([...line.slice(0,comma<0?undefined:comma).matchAll(/([\w-]+)="([^"]*)"/g)].map(m=>[m[1],m[2]]));
  meta={name:(comma<0?'Канал':line.slice(comma+1).trim())||'Канал',category:attrs['group-title']||'Общие',epgId:attrs['tvg-id']||'',logo:attrs['tvg-logo']||''};
 }else if(meta&&line.startsWith('#EXTGRP:'))meta.category=line.slice(8).trim()||'Общие';
 else if(line&&!line.startsWith('#')&&meta){try{const url=webUrl(line);channels.push({...meta,url,id:createHash('sha256').update(meta.epgId||url).digest('hex').slice(0,20)});}catch{}meta=null;}}
 return [...new Map(channels.map(c=>[c.id,c])).values()];
}
export async function hashPassword(password){const salt=randomBytes(16).toString('hex');return salt+':'+(await derive(password,salt,64)).toString('hex');}
export async function verifyPassword(password,hash){try{const[salt,key]=hash.split(':');const expected=Buffer.from(key,'hex'),actual=await derive(password,salt,64);return expected.length===actual.length&&timingSafeEqual(actual,expected);}catch{return false;}}
export function xmltvTime(s){const m=String(s||'').match(/^(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})?\s*([+-]\d{4}|Z)?$/);if(!m)return NaN;const z=m[7]||'+0000';return Date.parse(`${m[1]}-${m[2]}-${m[3]}T${m[4]}:${m[5]}:${m[6]||'00'}${z==='Z'?'Z':z.slice(0,3)+':'+z.slice(3)}`);}
export function parseXmltv(xml){
 if(typeof xml!=='string'||/<!DOCTYPE|<!ENTITY/i.test(xml))throw Error('XMLTV с DTD/ENTITY не поддерживается');if(XMLValidator.validate(xml)!==true)throw Error('Некорректный XMLTV');
 const p=new XMLParser({ignoreAttributes:false,attributeNamePrefix:'@',parseTagValue:false,isArray:n=>['programme','title','desc'].includes(n)}).parse(xml);if(!p.tv)throw Error('Нужен XMLTV с элементом tv');
 const text=v=>typeof v==='object'?String(v?.['#text']||''):String(v||'');
 return(p.tv.programme||[]).map(p=>({channel:String(p['@channel']||''),start:xmltvTime(p['@start']),stop:xmltvTime(p['@stop']),title:text(p.title?.[0]),description:text(p.desc?.[0])})).filter(p=>p.channel&&Number.isFinite(p.start)&&p.stop>p.start).slice(0,150000);
}
export function nowNext(programmes,epgId,now=Date.now()){const list=programmes.filter(p=>p.channel===epgId&&p.stop>now).sort((a,b)=>a.start-b.start);return{now:list.find(p=>p.start<=now)||null,next:list.find(p=>p.start>now)||null};}
export function msx(channels,base){const items=channels.map(c=>({type:'button',label:c.name,action:'video:'+c.url,properties:{'video:info:title':c.name}}));const pages=[];for(let n=0;n<Math.max(1,items.length);n+=18)pages.push({items:[{type:'button',layout:'0,0,12,1',label:'VIO · Открыть ТВ-пульт',action:'link:'+base+'/'},...items.slice(n,n+18).map((c,i)=>({...c,layout:`${Math.floor(i/6)*4},${i%6+1},4,1`}))]});return{headline:'VIO · Телеканалы',type:'pages',compress:true,pages};}
