"use client";

import Link from "next/link";
import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { getOrder, type OrderResponse } from "@/lib/api";
import { SiteLogo } from "@/components/SiteLogo";

function TrackContent() {
  const params = useSearchParams();
  const [orderId, setOrderId] = useState(params.get("order") ?? "");
  const [order, setOrder] = useState<OrderResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  async function checkStatus() {
    if (!orderId.trim()) return;

    setIsLoading(true);
    setError("");
    setOrder(null);

    try {
      const result = await getOrder(orderId.trim());
      setOrder(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Order not found. Please check the order ID.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="grid min-h-screen place-items-center bg-[#f5f5f7] px-5 py-12 text-[#1d1d1f]">
      <section className="w-full max-w-2xl rounded-[36px] bg-white p-6 shadow-2xl shadow-zinc-200 md:p-10">
        <div className="flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2 text-sm font-semibold text-zinc-500 transition hover:text-black">
            <SiteLogo size={28} className="h-7 w-7 shrink-0" />
            Back to FIXT
          </Link>
        </div>
        <p className="mt-8 text-sm font-semibold uppercase text-orange-600">Track order</p>
        <h1 className="mt-2 text-4xl font-bold tracking-normal md:text-6xl">Repair status.</h1>
        <p className="mt-4 text-lg leading-8 text-zinc-600">
          Enter your FIXT order ID to load the current booking status from the backend.
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <input
            value={orderId}
            onChange={(event) => setOrderId(event.target.value)}
            placeholder="FIXT-20260508-0001"
            className="min-w-0 flex-1 rounded-2xl border border-zinc-300 px-5 py-4 text-lg font-semibold outline-none focus:border-zinc-950"
          />
          <button
            className="rounded-2xl bg-zinc-950 px-7 py-4 font-semibold text-white disabled:opacity-40"
            type="button"
            onClick={checkStatus}
            disabled={isLoading || !orderId.trim()}
          >
            {isLoading ? "Checking..." : "Check"}
          </button>
        </div>

        {order ? (
          <>
            <div className="mt-8 rounded-[28px] bg-[#f5f5f7] p-6">
              <p className="text-sm font-semibold uppercase text-zinc-500">Current status</p>
              <p className="mt-3 text-3xl font-bold capitalize">{order.status}</p>
              <div className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
                <p><span className="text-zinc-500">Device:</span> <b>{order.device}</b></p>
                <p><span className="text-zinc-500">Issue:</span> <b>{order.issue}</b></p>
                <p><span className="text-zinc-500">Area:</span> <b>{order.village ?? "Pending"}, {order.district ?? "Pending"}</b></p>
                <p><span className="text-zinc-500">Slot:</span> <b>{order.slot ?? "Pending"}</b></p>
              </div>
            </div>

            <div className="mt-8">
              <p className="text-sm font-semibold uppercase text-zinc-500">Need help? Contact us</p>
              <div className="mt-4 flex flex-wrap gap-4">
                <a href="tel:+918008617460" className="flex items-center gap-2 rounded-2xl bg-white border border-zinc-200 px-5 py-3 font-semibold text-zinc-800 transition hover:border-zinc-950">
                  <span>📞</span> 8008617460
                </a>
                <a href="https://www.instagram.com/fixt_official?igsh=MXNhdG5hcHgzaHBxdA==" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 rounded-2xl bg-white border border-zinc-200 px-5 py-3 font-semibold text-zinc-800 transition hover:border-zinc-950">
                  <span>📸</span> Instagram
                </a>
                <a href="https://www.youtube.com/@FIXT_OFFICIAL" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 rounded-2xl bg-white border border-zinc-200 px-5 py-3 font-semibold text-zinc-800 transition hover:border-zinc-950">
                  <span>🎥</span> YouTube
                </a>
                <a href="https://www.facebook.com/share/1CtktCmDYt/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 rounded-2xl bg-white border border-zinc-200 px-5 py-3 font-semibold text-zinc-800 transition hover:border-zinc-950">
                  <span>📘</span> Facebook
                </a>
              </div>
            </div>
          </>
        ) : null}

        {error ? (
          <div className="mt-6 rounded-2xl bg-red-50 p-4">
            <p className="text-sm font-semibold text-red-700">{error}</p>
            <button
              type="button"
              onClick={checkStatus}
              disabled={isLoading || !orderId.trim()}
              className="mt-3 rounded-full bg-red-700 px-4 py-2 text-xs font-semibold text-white transition hover:bg-red-800 disabled:opacity-40"
            >
              Retry
            </button>
          </div>
        ) : null}
      </section>
    </main>
  );
}

export default function TrackPage() {
  return (
    <Suspense fallback={<div className="grid min-h-screen place-items-center text-zinc-500">Loading tracker...</div>}>
      <TrackContent />
    </Suspense>
  );
}
