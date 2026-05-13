"use client";

import Link from "next/link";
import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { getOrder, type OrderResponse } from "@/lib/api";
import { SiteLogo } from "@/components/SiteLogo";
import { Phone } from "lucide-react";

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
                <p className="sm:col-span-2"><span className="text-zinc-500">Estimate Range:</span> <b>Rs. {order.price_min ?? 0} - {order.price_max ?? order.estimated_price ?? 0}</b></p>
              </div>
            </div>

            {/* Payment Section */}
            {order.status === "cancelled" ? null : (
              <div className="mt-8">
                {order.repair_cost !== null && order.repair_cost !== undefined ? (
                  <div className="rounded-[32px] bg-white border-2 border-orange-500 p-6 shadow-2xl shadow-orange-100 md:p-8">
                    <div className="flex flex-col items-center text-center">
                      <div className="rounded-full bg-orange-100 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-orange-600">
                        Payment Required
                      </div>
                      <p className="mt-4 text-sm font-medium text-zinc-500">Final repair amount set by admin</p>
                      <p className="mt-1 text-6xl font-black tracking-tight text-zinc-950">₹{order.repair_cost}</p>

                      <div className="mt-8 flex flex-col items-center gap-8 md:flex-row md:items-start md:gap-10">
                        <div className="flex flex-col items-center gap-3">
                          <div className="rounded-[28px] bg-white p-4 ring-1 ring-zinc-200 shadow-sm">
                            <img
                              src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(`upi://pay?pa=8008617460-2@axl&pn=FIXT&am=${order.repair_cost}&cu=INR&tn=FIXT Order ${order.order_number}`)}`}
                              alt="UPI QR Code"
                              className="h-[180px] w-[180px] rounded-xl"
                            />
                          </div>
                          <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Scan QR to pay</p>
                        </div>

                        <div className="flex flex-1 flex-col gap-4 self-stretch justify-center">
                          <a
                            href={`upi://pay?pa=8008617460-2@axl&pn=FIXT&am=${order.repair_cost}&cu=INR&tn=FIXT Order ${order.order_number}`}
                            target="_self"
                            rel="noreferrer"
                            className="group relative flex items-center justify-center gap-3 overflow-hidden rounded-2xl bg-[#5f259f] py-5 font-black text-white shadow-lg shadow-purple-200 transition-all hover:bg-[#4a1d7c] hover:scale-[1.02] active:scale-95"
                            onClick={() => {
                              setTimeout(() => {
                                if (document.hasFocus()) {
                                  alert("If your UPI app didn't open automatically, please scan the QR code instead.");
                                }
                              }, 2500);
                            }}
                          >
                            <span className="text-2xl">💳</span>
                            <span>Pay ₹{order.repair_cost} Now</span>
                            <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-500 group-hover:translate-x-full" />
                          </a>

                          <div className="rounded-xl bg-purple-50 p-3 text-center border border-purple-100">
                            <p className="text-[11px] font-bold text-purple-700">UPI ID: 8008617460-2@axl</p>
                          </div>
                          <p className="text-center text-[10px] text-zinc-400">
                            Redirects to PhonePe, Google Pay, or Paytm
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (order.status === "in_progress" || order.status === "confirmed") ? (
                  <div className="rounded-[32px] bg-zinc-50 border border-zinc-200 p-8 text-center">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-zinc-200 text-xl">⏳</div>
                    <h3 className="mt-4 text-lg font-bold text-zinc-900">Payment Pending</h3>
                    <p className="mt-2 text-sm text-zinc-500">
                      Our technician is currently diagnosing your device. Once the final cost is set by the admin, the payment button and QR code will appear here.
                    </p>
                  </div>
                ) : null}
              </div>
            )}

            <div className="mt-10">
              <p className="text-sm font-semibold uppercase text-zinc-500">Need help? Contact us</p>
              <div className="mt-4 flex flex-wrap gap-4">
                <a href="tel:+918008617460" className="flex items-center gap-2.5 rounded-2xl bg-white border border-zinc-200 px-5 py-3 font-semibold text-zinc-800 transition hover:border-zinc-950 hover:bg-zinc-50 shadow-sm">
                  <Phone size={18} className="text-zinc-600" />
                  <span>8008617460</span>
                </a>
                <a href="https://www.instagram.com/fixt_official?igsh=MXNhdG5hcHgzaHBxdA==" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2.5 rounded-2xl bg-white border border-zinc-200 px-5 py-3 font-semibold text-zinc-800 transition hover:border-zinc-950 hover:bg-zinc-50 shadow-sm">
                  <span className="text-lg">📸</span>
                  <span>Instagram</span>
                </a>
                <a href="https://www.youtube.com/@FIXT_OFFICIAL" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2.5 rounded-2xl bg-white border border-zinc-200 px-5 py-3 font-semibold text-zinc-800 transition hover:border-zinc-950 hover:bg-zinc-50 shadow-sm">
                  <span className="text-lg">📺</span>
                  <span>YouTube</span>
                </a>
                <a href="https://www.facebook.com/share/1CtktCmDYt/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2.5 rounded-2xl bg-white border border-zinc-200 px-5 py-3 font-semibold text-zinc-800 transition hover:border-zinc-950 hover:bg-zinc-50 shadow-sm">
                  <span className="text-lg">👥</span>
                  <span>Facebook</span>
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
