export default function Stat({title,value,sub,trend}:{title:string;value:string;sub:string;trend:string}){
 return <div className="card p-5"><div className="flex items-start justify-between"><div><div className="text-sm font-bold text-[var(--muted)]">{title}</div><div className="mt-3 text-2xl font-black">{value}</div></div>{trend&&<span className="badge bg-green-50 text-green-700 dark:bg-green-950/40 dark:text-green-300">{trend}</span>}</div><div className="mt-3 text-xs text-[var(--muted)]">{sub}</div></div>
}
