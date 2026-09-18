"use client";
import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [dark,setDark]=useState(false);
  useEffect(()=>{ setDark(document.documentElement.classList.contains("dark")); },[]);
  function toggle(){ const next=!dark; document.documentElement.classList.toggle("dark",next); setDark(next); localStorage.setItem("theme",next?"dark":"light"); }
  return <button aria-label="تغییر تم" onClick={toggle} className="btn btn-secondary !p-2.5">{dark?<Sun size={18}/>:<Moon size={18}/>}</button>;
}
