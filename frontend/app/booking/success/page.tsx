"use client";

import Link from "next/link";
import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { getOrder, type OrderResponse } from "@/lib/api";
import { SiteLogo } from "@/components/SiteLogo";

function SuccessContent() {
  const params = useSearchParams();
  const orderNumber = params.get("order") ?? "FIXT-PENDING";
  const [order, setOrder] = useState<OrderResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  async function loadOrderDetails() {
    if (!orderNumber || orderNumber === "FIXT-PENDING") return;
    setIsLoading(true);
    setError("");
    try {
      const result = await getOrder(orderNumber);
      setOrder(result);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Could not load order details.");
    } finally {
      setIsLoading(false);
    }
  }

  const device = order?.device ?? params.get("device") ?? "Device";
  const issue = order?.issue ?? params.get("issue") ?? "Repair";
  const slot = order?.slot ?? params.get("slot") ?? "TBD";
  const area = order?.village && order?.district ? `${order.village}, ${order.district}` : params.get("area") ?? "Service area";
  const min = order?.price_min ?? params.get("min") ?? "0";
  const max = order?.price_max ?? params.get("max") ?? order?.estimated_price ?? "0";
  const address = order?.address_line;
  const status = order?.status ?? "pending";

  return (
    <main className="grid min-h-screen place-items-center bg-[#f5f5f7] px-5 py-12 text-[#1d1d1f]">
      <section className="w-full max-w-3xl rounded-[36px] bg-white p-6 text-center shadow-2xl shadow-zinc-200 md:p-10">
        <Link href="/" className="mx-auto mb-5 inline-flex" aria-label="FIXT home">
          <SiteLogo size={44} className="h-11 w-11" />
        </Link>
        <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-emerald-100 text-4xl font-bold text-emerald-700">
          ✓
        </div>
        <p className="mt-6 text-sm font-semibold uppercase text-emerald-600">Booking confirmed</p>
        <h1 className="mt-3 text-4xl font-bold tracking-normal md:text-6xl">Your repair is booked.</h1>
        <p className="mx-auto mt-4 max-w-xl text-lg leading-8 text-zinc-600">
          Our team will call within 10 minutes to verify your details before assigning a technician.
        </p>

        <div className="mx-auto mt-8 max-w-md rounded-[28px] bg-black p-6 text-white">
          <p className="text-xs font-semibold uppercase text-zinc-400">Your order ID</p>
          <p className="mt-2 break-words text-3xl font-bold tracking-normal">{orderNumber}</p>
          <p className="mt-2 text-sm text-zinc-400">Current status: {status}</p>
        </div>

        <div className="mt-5">
          {isLoading ? <p className="text-sm font-semibold text-zinc-500">Loading live order details...</p> : null}
          {!isLoading && !order ? (
            <button
              type="button"
              onClick={loadOrderDetails}
              className="rounded-full bg-zinc-900 px-4 py-2 text-xs font-semibold text-white transition hover:bg-zinc-700"
            >
              Load live details
            </button>
          ) : null}
        </div>

        <div className="mt-6 grid gap-3 rounded-[28px] bg-[#f5f5f7] p-6 text-left text-sm md:grid-cols-2">
          <p><span className="text-zinc-500">Device:</span> <b>{device}</b></p>
          <p><span className="text-zinc-500">Issue:</span> <b>{issue}</b></p>
          <p><span className="text-zinc-500">Location:</span> <b>{area}</b></p>
          <p><span className="text-zinc-500">Slot:</span> <b>{slot}</b></p>
          {address ? <p className="md:col-span-2"><span className="text-zinc-500">Address:</span> <b>{address}</b></p> : null}
          <p className="md:col-span-2"><span className="text-zinc-500">Estimate:</span> <b>Rs. {min} - {max}</b></p>
        </div>

        {error ? (
          <div className="mt-5 rounded-2xl bg-orange-50 p-4 text-sm font-semibold text-orange-800">
            <p>Saved order ID is shown. Live details could not be loaded: {error}</p>
            <button
              type="button"
              onClick={loadOrderDetails}
              disabled={isLoading}
              className="mt-3 rounded-full bg-orange-700 px-4 py-2 text-xs font-semibold text-white transition hover:bg-orange-800 disabled:opacity-40"
            >
              Retry
            </button>
          </div>
        ) : null}

        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href={`/track?order=${encodeURIComponent(orderNumber)}`}
            className="rounded-full bg-zinc-950 px-7 py-4 font-semibold text-white transition hover:bg-orange-600"
          >
            Track Order Status
          </Link>
          <Link
            href="/"
            className="rounded-full border border-zinc-300 px-7 py-4 font-semibold text-zinc-700 transition hover:border-zinc-950"
          >
            Back to Home
          </Link>
        </div>
      </section>
    </main>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={<div className="grid min-h-screen place-items-center text-zinc-500">Loading confirmation...</div>}>
      <SuccessContent />
    </Suspense>
  );
}
