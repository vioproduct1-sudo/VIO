// PIN verifier/configuration is created and kept on the device, never bundled.
export const adminPinIterations=60000;
const bytes=hex=>Uint8Array.from(hex.match(/../g)||[],n=>parseInt(n,16));
const hex=buffer=>Array.from(buffer,n=>n.toString(16).padStart(2,'0')).join('');
async function derive(pin,salt,iterations){const key=await crypto.subtle.importKey('raw',new TextEncoder().encode(pin),'PBKDF2',false,['deriveBits']);return new Uint8Array(await crypto.subtle.deriveBits({name:'PBKDF2',salt:bytes(salt),iterations,hash:'SHA-256'},key,256));}
export async function createAdminPinConfig(pin){if(!/^\d{8}$/.test(pin))throw Error('PIN must have eight digits');const salt=hex(crypto.getRandomValues(new Uint8Array(16)));return{salt,iterations:adminPinIterations,digest:hex(await derive(pin,salt,adminPinIterations))};}
export async function verifyAdminPin(pin,config){if(!/^\d{8}$/.test(pin)||!config||!Number.isInteger(config.iterations)||config.iterations<1000||config.iterations>1000000||!/^[a-f0-9]{32}$/.test(config.salt)||!/^[a-f0-9]{64}$/.test(config.digest))return false;const bits=await derive(pin,config.salt,config.iterations),expected=bytes(config.digest);let mismatch=bits.length^expected.length;for(let i=0;i<bits.length;i++)mismatch|=bits[i]^expected[i];return mismatch===0;}
