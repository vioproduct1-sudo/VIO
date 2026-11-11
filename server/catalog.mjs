import {readFileSync} from 'node:fs';import {webUrl} from './core.mjs';
const info=JSON.parse(readFileSync(new URL('./catalog/index.json',import.meta.url),'utf8'));
const base=new URL(webUrl(info.streamBase));if(base.pathname!=='/'||base.search||base.hash)throw Error('Некорректный сервер шаблона');
const entries=info.parts.flatMap(p=>{if(!/^part-\d+\.json$/.test(p))throw Error('Некорректная часть шаблона');return JSON.parse(readFileSync(new URL('./catalog/'+p,import.meta.url),'utf8'));});
if(entries.length!==info.count||new Set(entries.map(c=>c.id)).size!==entries.length)throw Error('Неполный шаблон VIO');
export const templateCount=entries.length;
export function vioTemplate(){return entries.map((c,i)=>{if(!/^\d+\/(?:index|video)\.m3u8$/.test(c.streamPath))throw Error('Некорректный канал шаблона');const {streamPath,...meta}=c;return{...meta,number:i+1,url:base.origin+'/iptv/VIO_TEMPLATE_PLACEHOLDER/'+streamPath};});}
