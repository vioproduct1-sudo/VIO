import {build} from 'esbuild';
import {transformAsync} from '@babel/core';
import presetEnv from '@babel/preset-env';
export async function legacyBundle(options){
 const result=await build({...options,bundle:true,write:false,target:'es2015',format:'iife',minify:false});
 const transformed=await transformAsync(result.outputFiles[0].text,{babelrc:false,configFile:false,presets:[[presetEnv,{targets:{ie:'11'},modules:false}]],comments:false,compact:true});
 return transformed.code;
}
