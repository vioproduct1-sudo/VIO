const tokenPath=/^(\/iptv\/)([A-Za-z0-9_-]+)(\/.+)$/;
export function supportsIedemKey(channel){try{return tokenPath.test(new URL(channel.url).pathname);}catch{return false;}}
export function applyIedemKey(channels,value){
 if(typeof value!=='string'||!/^[A-Za-z0-9_-]{8,256}$/.test(value.trim()))throw Error('Введите полный ключ доступа: от 8 до 256 букв, цифр, знаков _ или -.');
 const key=value.trim();let changed=0;
 const next=channels.map(c=>{if(!supportsIedemKey(c))return c;const u=new URL(c.url);u.pathname=u.pathname.replace(tokenPath,(_all,head,_old,tail)=>head+key+tail);changed++;return{...c,url:u.href};});
 if(!changed)throw Error('Для ключа нужен ранее подключённый каталог iEdem. Один ключ не содержит списка каналов.');
 return{channels:next,changed,sample:next.find(supportsIedemKey).url};
}
