import "server-only";
import { promises as fs } from "node:fs";
import path from "node:path";

type GithubFile = { sha: string; content: string };
const localRoot = path.join(process.cwd(), "data");
const hasGithub = () => Boolean(process.env.GITHUB_OWNER && process.env.GITHUB_REPO && process.env.GITHUB_TOKEN);
const env = () => ({ owner: process.env.GITHUB_OWNER || "", repo: process.env.GITHUB_REPO || "", branch: process.env.GITHUB_BRANCH || "main", base: (process.env.GITHUB_DATA_PATH || "data").replace(/^\/|\/$/g, ""), token: process.env.GITHUB_TOKEN || "" });
function api(p:string){ const e=env(); return `https://api.github.com/repos/${e.owner}/${e.repo}/contents/${p.replace(/^\/+/,"")}`; }
async function request<T>(url:string, init:RequestInit={}):Promise<T>{ const e=env(); const res=await fetch(url,{...init,headers:{Accept:"application/vnd.github+json",Authorization:`Bearer ${e.token}`,"X-GitHub-Api-Version":"2022-11-28","Content-Type":"application/json",...(init.headers||{})},cache:"no-store"}); if(!res.ok) throw new Error(`GitHub ${res.status}: ${await res.text()}`); return res.json(); }
const decode=(b:string)=>Buffer.from(b.replace(/\n/g,""),"base64").toString("utf8");
const encode=(s:string)=>Buffer.from(s,"utf8").toString("base64");
const localPath=(relative:string)=>path.join(localRoot,relative.replace(/^\/+/,""));

export async function getJsonFile<T>(relative:string):Promise<{data:T;sha:string;path:string}>{
 if(!hasGithub()){ const p=localPath(relative); try{return {data:JSON.parse(await fs.readFile(p,"utf8")) as T,sha:"local",path:p};}catch{throw new Error(`DATA_NOT_FOUND:${p}`);} }
 const e=env(), p=`${e.base}/${relative.replace(/^\/+/,"")}`; const raw=await request<any>(api(p)+`?ref=${encodeURIComponent(e.branch)}`); return {data:JSON.parse(decode(raw.content)),sha:raw.sha,path:p};
}
export async function getJson<T>(relative:string,fallback:T){ try{return await getJsonFile<T>(relative);}catch(e:any){ if(String(e.message).startsWith("DATA_NOT_FOUND:")) return {data:fallback,sha:null,path:relative}; throw e; }}
export async function writeJson<T>(relative:string,data:T,message:string,expectedSha?:string){
 if(!hasGithub()){ const p=localPath(relative); await fs.mkdir(path.dirname(p),{recursive:true}); await fs.writeFile(p,JSON.stringify(data,null,2)+"\n","utf8"); return {local:true,path:p}; }
 const e=env(), p=`${e.base}/${relative.replace(/^\/+/,"")}`; let sha=expectedSha; if(!sha){try{sha=(await getJsonFile<T>(relative)).sha}catch{}} const body:any={message,content:encode(JSON.stringify(data,null,2)+"\n"),branch:e.branch}; if(sha&&sha!=="local")body.sha=sha; return request<any>(api(p),{method:"PUT",body:JSON.stringify(body)});
}
export type JsonCommit<T = unknown> = { path: string; data: T; message: string; expectedSha?: string };

export async function batchCommit(commits: JsonCommit[]): Promise<void> {
  for (const commit of commits) {
    await writeJson(commit.path, commit.data, commit.message, commit.expectedSha);
  }
}

export async function deleteJson(relative:string,message:string){ if(!hasGithub()){try{await fs.unlink(localPath(relative));}catch{} return;} const f=await getJsonFile<unknown>(relative),e=env(); return request<any>(api(f.path),{method:"DELETE",body:JSON.stringify({message,sha:f.sha,branch:e.branch})}); }
