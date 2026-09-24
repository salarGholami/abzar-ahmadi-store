import Link from "next/link";
import { ArrowRight, PackageCheck, ShieldCheck } from "lucide-react";
import ProductActions from "@/components/commerce/ProductActions";
import ProductGallery from "@/components/commerce/ProductGallery";
import ProductTabs from "@/components/commerce/ProductTabs";
import RatingStars from "@/components/commerce/RatingStars";
import ProductRow from "@/components/commerce/ProductRow";
import { getProducts } from "@/lib/data";

export default async function ProductDetail({params}:{params:Promise<{id:string}>}){
 const {id}=await params;
 const products = await getProducts();
 const p = products.find(x=>x.id===id);
 if(!p) return <><main className="mx-auto max-w-5xl px-6 py-24 text-center"><h1 className="text-3xl font-black">محصول پیدا نشد</h1><Link className="mt-5 inline-flex btn btn-primary" href="/products">بازگشت</Link></main></>;
 const final=Math.round(p.price*(1-p.discount/100));
 const related = products.filter((item) => item.category === p.category && item.id !== p.id && item.stock > 0).slice(0, 8);
 return <><main className="mx-auto max-w-[1200px] px-4 py-8 sm:px-6 lg:px-8">
  <Link href="/products" className="mb-6 inline-flex items-center gap-2 text-sm text-[var(--muted)]"><ArrowRight size={16}/>بازگشت به محصولات</Link>
  <div className="grid gap-8 lg:grid-cols-2">
   <ProductGallery title={p.title} images={p.images?.length ? p.images : [{ id: `legacy-${p.id}`, url: p.image, alt: p.title, position: 0, createdAt: "" }]} />
   <div className="py-2">
    <div className="text-sm font-bold text-[var(--primary)]">{p.brand} · {p.sku}</div>
    <h1 className="mt-3 text-3xl font-black leading-tight">{p.title}</h1>
    {p.rating ? <div className="mt-3"><RatingStars rating={p.rating} reviewCount={p.reviewCount} /></div> : null}
    <div className="mt-5 flex flex-wrap gap-2">{p.stock>0?<span className="badge bg-green-100 text-green-700"><PackageCheck size={14}/>موجود در انبار ({p.stock} عدد)</span>:<span className="badge bg-red-100 text-red-700"><PackageCheck size={14}/>ناموجود</span>}<span className="badge bg-blue-100 text-blue-700"><ShieldCheck size={14}/>ضمانت اصالت</span></div>
    <div className="my-8 border-y border-[var(--border)] py-6">{p.discount>0&&<div className="text-sm text-[var(--muted)] line-through">{p.price.toLocaleString("fa-IR")} تومان</div>}<div className="mt-1 text-3xl font-black">{final.toLocaleString("fa-IR")} <span className="text-sm font-normal">تومان</span></div></div>
    <ProductActions product={p} />
    <div className="mt-8 grid gap-3 sm:grid-cols-2"><div className="card p-4"><b>دسته‌بندی</b><div className="mt-1 text-sm text-[var(--muted)]">{p.category}</div></div><div className="card p-4"><b>موجودی</b><div className="mt-1 text-sm text-[var(--muted)]">{p.stock} عدد</div></div></div>
   </div>
  </div>
  <ProductTabs description={p.description} specs={p.specs} />
 </main>
 <ProductRow title="محصولات مشابه" subtitle={p.category} products={related} viewAllHref={`/products?category=${encodeURIComponent(p.category)}`} />
 </>
}
