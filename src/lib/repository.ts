import "server-only";
import { getJson, writeJson, deleteJson } from "./github";

export type Entity={id:string;createdAt?:string;updatedAt?:string;[key:string]:any};
export class JsonRepository<T extends Entity>{
 constructor(private file:string, private fallback:T[]=[]){}
 async all(){return (await getJson<T[]>(this.file,this.fallback)).data}
 async find(id:string){return (await this.all()).find(x=>x.id===id)||null}
 async create(input:Omit<T,"id">){
  const all=await this.all(); const item={...input,id:crypto.randomUUID(),createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()} as T;
  all.push(item); const f=await getJson<T[]>(this.file,[]); await writeJson(this.file,all,`Create ${item.id}`,f.sha||undefined); return item;
 }
 async update(id:string,input:Partial<T>){
  const f=await getJson<T[]>(this.file,this.fallback); const i=f.data.findIndex(x=>x.id===id); if(i<0)throw new Error("NOT_FOUND");
  f.data[i]={...f.data[i],...input,id,updatedAt:new Date().toISOString()}; await writeJson(this.file,f.data,`Update ${id}`,f.sha||undefined); return f.data[i];
 }
 async remove(id:string){
  const f=await getJson<T[]>(this.file,this.fallback); const next=f.data.filter(x=>x.id!==id); if(next.length===f.data.length)throw new Error("NOT_FOUND");
  await writeJson(this.file,next,`Delete ${id}`,f.sha||undefined);
 }
}
