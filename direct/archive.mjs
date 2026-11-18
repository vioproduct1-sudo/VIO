export const archiveWindowSeconds=4*24*3600;
// This is the existing iEdem URL adapter, not a claim that every channel has replay.
export function archiveToken(id,seconds,now=Math.floor(Date.now()/1000)){
 if(!/^[A-Za-z0-9_-]{1,128}$/.test(id)||!Number.isInteger(seconds)||seconds<60||seconds>archiveWindowSeconds)throw Error('Некорректное время архива');
 return ['archive',id,now-seconds,now].join('~');
}
export function parseArchiveToken(token,now=Math.floor(Date.now()/1000)){
 const parts=String(token).split('~');if(parts.length!==4||parts[0]!=='archive'||!/^[A-Za-z0-9_-]{1,128}$/.test(parts[1])||!parts.slice(2).every(x=>/^\d{1,12}$/.test(x)))return null;
 const start=Number(parts[2]),end=Number(parts[3]);
 if(start<now-archiveWindowSeconds-300||end>now+30||end-start<60||end-start>archiveWindowSeconds)return null;
 return{id:parts[1],start,end};
}
export function archiveUrl(live,range){const url=new URL(live);url.searchParams.set('utc',String(range.start));url.searchParams.set('lutc',String(range.end));return url.href;}
