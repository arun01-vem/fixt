"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { adminLogin, deleteOrder, listAdminOrders, type OrderResponse, updateOrderStatus } from "@/lib/api";
import { SiteLogo } from "@/components/SiteLogo";

const STATUS_OPTIONS = [
  "pending_verification",
  "confirmed",
  "in_progress",
  "ready_to_deliver",
  "delivered",
  "completed",
  "cancelled",
] as const;

export default function AdminOrdersPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [token, setToken] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [error, setError] = useState("");
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);
  const [savingOrderId, setSavingOrderId] = useState("");
  const [deletingOrderId, setDeletingOrderId] = useState("");
  const [pendingDeleteOrder, setPendingDeleteOrder] = useState<OrderResponse | null>(null);
  const [deleteConfirmationText, setDeleteConfirmationText] = useState("");

  const isLoggedIn = useMemo(() => Boolean(token), [token]);

  async function handleLogin() {
    setIsAuthenticating(true);
    setError("");
    try {
      const result = await adminLogin({ username, password });
      setToken(result.access_token);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Admin login failed.");
    } finally {
      setIsAuthenticating(false);
    }
  }

  async function loadOrders() {
    if (!token) return;
    setIsLoadingOrders(true);
    setError("");
    try {
      const result = await listAdminOrders(token, statusFilter || undefined);
      setOrders(result);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Could not load orders.");
    } finally {
      setIsLoadingOrders(false);
    }
  }

  async function handleStatusChange(orderId: string, status: string) {
    if (!token) return;
    setSavingOrderId(orderId);
    setError("");
    try {
      await updateOrderStatus(token, orderId, status);
      await loadOrders();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Status update failed.");
    } finally {
      setSavingOrderId("");
    }
  }

  async function handleDeleteOrder(order: OrderResponse) {
    setPendingDeleteOrder(order);
    setDeleteConfirmationText("");
  }

  async function confirmDeleteOrder() {
    if (!token || !pendingDeleteOrder) return;
    const order = pendingDeleteOrder;
    if (!token) return;
    const confirmationKey = order.order_number ?? order.id;
    if (deleteConfirmationText.trim() !== confirmationKey) {
      setError("Delete cancelled. Confirmation text did not match.");
      return;
    }

    setDeletingOrderId(order.id);
    setError("");
    try {
      await deleteOrder(token, order.id);
      setPendingDeleteOrder(null);
      setDeleteConfirmationText("");
      await loadOrders();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Delete failed.");
    } finally {
      setDeletingOrderId("");
    }
  }

  function handleLogout() {
    setToken("");
    setOrders([]);
    setUsername("");
    setPassword("");
    setStatusFilter("");
  }

  return (
    <main className="min-h-screen bg-[#f5f5f7] px-5 py-10 text-[#1d1d1f]">
      <div className="mx-auto max-w-6xl rounded-[28px] bg-white p-6 shadow-xl md:p-10">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <SiteLogo size={40} className="mt-1 h-10 w-10 shrink-0" />
            <div>
              <p className="text-sm font-semibold uppercase text-orange-600">Admin panel</p>
              <h1 className="mt-2 text-3xl font-bold md:text-4xl">FIXT Orders</h1>
            </div>
          </div>
          <Link href="/" className="text-sm font-semibold text-zinc-600 hover:text-black">
            Back to website
          </Link>
        </div>

        {!isLoggedIn ? (
          <section className="mt-8 grid gap-3 rounded-2xl bg-[#f5f5f7] p-5 md:grid-cols-[1fr_1fr_auto]">
            <input
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              placeholder="Admin username"
              className="rounded-xl border border-zinc-300 bg-white px-4 py-3 font-semibold outline-none focus:border-zinc-950"
            />
            <input
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Admin password"
              type="password"
              className="rounded-xl border border-zinc-300 bg-white px-4 py-3 font-semibold outline-none focus:border-zinc-950"
            />
            <button
              type="button"
              onClick={handleLogin}
              disabled={isAuthenticating || !username.trim() || !password.trim()}
              className="rounded-xl bg-zinc-950 px-5 py-3 font-semibold text-white disabled:opacity-40"
            >
              {isAuthenticating ? "Signing in..." : "Sign in"}
            </button>
          </section>
        ) : (
          <section className="mt-8 space-y-4">
            <div className="flex flex-wrap gap-3">
              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                className="rounded-xl border border-zinc-300 bg-white px-4 py-3 font-semibold outline-none focus:border-zinc-950"
              >
                <option value="">All statuses</option>
                {STATUS_OPTIONS.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={loadOrders}
                disabled={isLoadingOrders}
                className="rounded-xl bg-zinc-950 px-5 py-3 font-semibold text-white disabled:opacity-40"
              >
                {isLoadingOrders ? "Loading..." : "Load orders"}
              </button>
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-xl border border-zinc-300 px-5 py-3 font-semibold text-zinc-700"
              >
                Logout
              </button>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-zinc-200">
              <table className="min-w-full divide-y divide-zinc-200 text-sm">
                <thead className="bg-zinc-50">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-zinc-600">Order</th>
                    <th className="px-4 py-3 text-left font-semibold text-zinc-600">Customer</th>
                    <th className="px-4 py-3 text-left font-semibold text-zinc-600">Repair details</th>
                    <th className="px-4 py-3 text-left font-semibold text-zinc-600">Location details</th>
                    <th className="px-4 py-3 text-left font-semibold text-zinc-600">Status</th>
                    <th className="px-4 py-3 text-left font-semibold text-zinc-600">Created</th>
                    <th className="px-4 py-3 text-left font-semibold text-zinc-600">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 bg-white">
                  {orders.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-6 text-center font-semibold text-zinc-500">
                        No orders loaded yet.
                      </td>
                    </tr>
                  ) : (
                    orders.map((order) => (
                      <tr key={order.id}>
                        <td className="px-4 py-3">
                          <p className="font-semibold">{order.order_number ?? "N/A"}</p>
                          <p className="text-xs text-zinc-500">ID: {order.id}</p>
                        </td>
                        <td className="px-4 py-3">
                          <p className="font-semibold">{order.customer?.name ?? "N/A"}</p>
                          <p className="text-xs text-zinc-600">Phone: {order.customer?.phone ?? "N/A"}</p>
                          <p className="text-xs text-zinc-600">
                            Alternate: {order.alternate_phone?.trim() ? order.alternate_phone : "N/A"}
                          </p>
                        </td>
                        <td className="px-4 py-3">
                          <p className="font-semibold">{order.device}</p>
                          <p className="text-xs text-zinc-600">
                            Brand/Model: {[order.brand, order.model].filter(Boolean).join(" / ") || "N/A"}
                          </p>
                          <p className="text-xs text-zinc-600">Issue: {order.issue}</p>
                          <p className="text-xs text-zinc-600">
                            Details: {order.issue_details?.trim() ? order.issue_details : "N/A"}
                          </p>
                          <p className="text-xs text-zinc-600">
                            Estimate: Rs. {order.price_min ?? 0} - {order.price_max ?? order.estimated_price ?? 0}
                          </p>
                          <p className="text-xs text-zinc-600">Slot: {order.slot ?? "N/A"}</p>
                          <div className="mt-2">
                            <p className="text-xs font-semibold text-zinc-700">Timeline:</p>
                            <div className="mt-1 space-y-1">
                              {(order.status_events ?? []).length === 0 ? (
                                <p className="text-xs text-zinc-500">No status history yet.</p>
                              ) : (
                                (order.status_events ?? []).map((event) => (
                                  <p key={event.id} className="text-xs text-zinc-600">
                                    {event.status.replace(/_/g, " ")} - {new Date(event.changed_at).toLocaleString()}
                                  </p>
                                ))
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-xs text-zinc-700">
                            {[order.address_line, order.village, order.district].filter(Boolean).join(", ") || "N/A"}
                          </p>
                          <p className="text-xs text-zinc-600">Pincode: {order.pincode ?? "N/A"}</p>
                          <p className="text-xs text-zinc-600">Nearby: {order.nearby_location ?? "N/A"}</p>
                          <p className="text-xs text-zinc-600">Landmark: {order.landmark ?? "N/A"}</p>
                          <p className="text-xs text-zinc-600">
                            Coords:{" "}
                            {order.latitude !== null && order.longitude !== null
                              ? `${order.latitude}, ${order.longitude}`
                              : "N/A"}
                          </p>
                        </td>
                        <td className="px-4 py-3">
                          <select
                            value={order.status}
                            onChange={(event) => handleStatusChange(order.id, event.target.value)}
                            disabled={savingOrderId === order.id}
                            className="rounded-lg border border-zinc-300 bg-white px-2 py-1 font-semibold outline-none focus:border-zinc-950 disabled:opacity-40"
                          >
                            {STATUS_OPTIONS.map((status) => (
                              <option key={status} value={status}>
                                {status}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="px-4 py-3">{new Date(order.created_at).toLocaleString()}</td>
                        <td className="px-4 py-3">
                          <button
                            type="button"
                            onClick={() => handleDeleteOrder(order)}
                            disabled={deletingOrderId === order.id}
                            className="rounded-md bg-red-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-red-700 disabled:opacity-40"
                          >
                            {deletingOrderId === order.id ? "Deleting..." : "Delete"}
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {error ? <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-700">{error}</p> : null}
      </div>

      {pendingDeleteOrder ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-5">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <h2 className="text-xl font-bold text-zinc-900">Confirm permanent delete</h2>
            <p className="mt-3 text-sm text-zinc-600">
              This action permanently deletes the order from database and cannot be undone.
            </p>
            <p className="mt-4 text-sm font-semibold text-zinc-800">
              Type <span className="rounded bg-zinc-100 px-2 py-1">{pendingDeleteOrder.order_number ?? pendingDeleteOrder.id}</span> to confirm.
            </p>
            <input
              value={deleteConfirmationText}
              onChange={(event) => setDeleteConfirmationText(event.target.value)}
              placeholder="Type exact order key"
              className="mt-3 w-full rounded-xl border border-zinc-300 px-4 py-3 font-semibold outline-none focus:border-zinc-950"
            />
            <div className="mt-5 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setPendingDeleteOrder(null);
                  setDeleteConfirmationText("");
                }}
                className="rounded-xl border border-zinc-300 px-4 py-2 font-semibold text-zinc-700"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeleteOrder}
                disabled={deletingOrderId === pendingDeleteOrder.id}
                className="rounded-xl bg-red-600 px-4 py-2 font-semibold text-white disabled:opacity-40"
              >
                {deletingOrderId === pendingDeleteOrder.id ? "Deleting..." : "Delete permanently"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}
