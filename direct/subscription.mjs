// Dates are calendar dates, valid through the end of the local day.
export function validDate(value){if(!/^\d{4}-\d{2}-\d{2}$/.test(value||''))return false;const [y,m,d]=value.split('-').map(Number);const date=new Date(y,m-1,d);return y>=2000&&y<=2199&&date.getFullYear()===y&&date.getMonth()===m-1&&date.getDate()===d;}
export function subscriptionLabel(value,source='manual',now=new Date()){
 if(!validDate(value))return 'Дата окончания не указана';
 const [y,m,d]=value.split('-').map(Number),today=Date.UTC(now.getFullYear(),now.getMonth(),now.getDate()),days=Math.round((Date.UTC(y,m-1,d)-today)/86400000),date=[d,m,y].map((v,i)=>i<2?String(v).padStart(2,'0'):v).join('.');
 return (days<0?'Указанный срок истёк: ':days===0?'Срок заканчивается сегодня: ':days<=3?'Срок заканчивается через '+days+' дн.: ':'Подписка до: ')+date+' · '+(source==='provider'?'данные iEdem':'введено вручную');
}
// No guessed URLs or account passwords. A provider adapter must be verified first.
export async function checkSubscription(key,adapter){
 if(!key)return {status:'missingKey'};
 if(typeof adapter!=='function')return {status:'unsupported'};
 try{const result=await adapter(key);return validDate(result?.expiresOn)?{status:'ok',expiresOn:result.expiresOn}:{status:'unavailable'};}catch{return {status:'unavailable'};}
}
export function subscriptionReminder(subscription,now=new Date()){
 if(!validDate(subscription?.expiresOn))return '';
 const [y,m,d]=subscription.expiresOn.split('-').map(Number),days=Math.round((Date.UTC(y,m-1,d)-Date.UTC(now.getFullYear(),now.getMonth(),now.getDate()))/86400000);
 return days>=0&&days<=3?subscriptionLabel(subscription.expiresOn,subscription.source,now):'';
}
