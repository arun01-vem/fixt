"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminIndexPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/admin/orders");
  }, [router]);

  return <main className="grid min-h-screen place-items-center text-zinc-500">Redirecting to admin panel...</main>;
}
