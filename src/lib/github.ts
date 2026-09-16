import "server-only";

type GithubFile = { sha: string; content: string };

const env = () => ({
  owner: process.env.GITHUB_OWNER!,
  repo: process.env.GITHUB_REPO!,
  branch: process.env.GITHUB_BRANCH || "main",
  base: (process.env.GITHUB_DATA_PATH || "data").replace(/^\/|\/$/g, ""),
  token: process.env.GITHUB_TOKEN!
});

function assertEnv() {
  const e=env();
  if(!e.owner||!e.repo||!e.token) throw new Error("GitHub configuration is incomplete");
  return e;
}
function api(path:string){
  const e=assertEnv();
  return `https://api.github.com/repos/${e.owner}/${e.repo}/contents/${path.replace(/^\/+/,"")}`;
}
async function request<T>(url:string, init:RequestInit={}):Promise<T>{
  const e=assertEnv();
  const res=await fetch(url,{...init,headers:{
    Accept:"application/vnd.github+json",
    Authorization:`Bearer ${e.token}`,
    "X-GitHub-Api-Version":"2022-11-28",
    "Content-Type":"application/json",
    ...(init.headers||{})
  },cache:"no-store"});
  if(!res.ok) throw new Error(`GitHub ${res.status}: ${await res.text()}`);
  return res.json();
}
function decode(b64:string){return Buffer.from(b64.replace(/\n/g,""),"base64").toString("utf8")}
function encode(s:string){return Buffer.from(s,"utf8").toString("base64")}

export async function getJsonFile<T>(relative:string):Promise<{data:T;sha:string;path:string}>{
  const e=assertEnv(), path=`${e.base}/${relative.replace(/^\/+/,"")}`;
  try {
    const raw=await request<any>(api(path)+`?ref=${encodeURIComponent(e.branch)}`);
    return {data:JSON.parse(decode(raw.content)),sha:raw.sha,path};
  } catch(err:any) {
    if(String(err.message).startsWith("GitHub 404")) throw new Error(`DATA_NOT_FOUND:${path}`);
    throw err;
  }
}
export async function getJson<T>(relative:string, fallback:T):Promise<{data:T;sha:string|null;path:string}>{
  try{return await getJsonFile<T>(relative)}catch(e:any){
    if(String(e.message).startsWith("DATA_NOT_FOUND:")) return {data:fallback,sha:null,path:`${env().base}/${relative}`};
    throw e;
  }
}
export async function writeJson<T>(relative:string,data:T,message:string,expectedSha?:string){
  const e=assertEnv(), path=`${e.base}/${relative.replace(/^\/+/,"")}`;
  let sha=expectedSha;
  if(!sha){try{sha=(await getJsonFile<T>(relative)).sha}catch{}}
  const body:any={message,content:encode(JSON.stringify(data,null,2)+"\n"),branch:e.branch};
  if(sha) body.sha=sha;
  return request<any>(api(path),{method:"PUT",body:JSON.stringify(body)});
}
export async function deleteJson(relative:string,message:string){
  const f=await getJsonFile<unknown>(relative);
  const e=assertEnv();
  return request<any>(api(f.path),{method:"DELETE",body:JSON.stringify({message,sha:f.sha,branch:e.branch})});
}
export async function batchCommit(ops:Array<{path:string;data:unknown;message:string}>){
  // JSON/GitHub has no cross-file transaction. We snapshot all current files and
  // compensate already-written files if a later write fails.
  const snapshots=await Promise.all(ops.map(async o=>{
    try{const f=await getJsonFile<any>(o.path);return {...o,old:f.data,sha:f.sha,exists:true}}
    catch(e:any){if(String(e.message).startsWith("DATA_NOT_FOUND:"))return {...o,old:null,sha:null,exists:false};throw e}
  }));
  const done:string[]=[];
  try{
    for(const s of snapshots){await writeJson(s.path,s.data,s.message,s.sha||undefined);done.push(s.path)}
  }catch(error){
    for(const path of done){
      const s=snapshots.find(x=>x.path===path)!;
      try{
        if(s.exists) await writeJson(s.path,s.old,`Rollback ${s.path}`);
      }catch{}
    }
    throw error;
  }
}
