import { redirect } from "next/navigation";
import StoreHeader from "@/components/layout/StoreHeader";
import RegisterForm from "@/components/auth/RegisterForm";
import { getSession } from "@/lib/auth";

export default async function Register() {
  const session = await getSession();
  if (session) redirect("/account");
  return (
    <>
      <StoreHeader />
      <main className="mx-auto max-w-md px-4 py-20">
        <div className="card p-7">
          <h1 className="text-2xl font-black">ساخت حساب</h1>
          <RegisterForm />
        </div>
      </main>
    </>
  );
}
