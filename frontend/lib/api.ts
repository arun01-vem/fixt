export type CustomerResponse = {
  id: string;
  name: string;
  phone: string;
};

export type OrderResponse = {
  id: string;
  order_number: string | null;
  device: string;
  brand: string | null;
  model: string | null;
  issue: string;
  issue_details: string | null;
  estimated_price: number | null;
  price_min: number | null;
  price_max: number | null;
  district: string | null;
  village: string | null;
  address_line: string | null;
  pincode: string | null;
  nearby_location: string | null;
  landmark: string | null;
  latitude: number | null;
  longitude: number | null;
  alternate_phone: string | null;
  slot: string | null;
  customer_id: string;
  status: string;
  created_at: string;
  customer?: {
    id: string;
    name: string;
    phone: string;
  } | null;
  status_events?: OrderStatusEvent[];
};

export type OrderStatusEvent = {
  id: string;
  status: string;
  changed_at: string;
};

export type HealthResponse = {
  status: string;
};

export type AdminLoginResponse = {
  access_token: string;
  token_type: string;
  expires_in: number;
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

async function request<T>(path: string, init: RequestInit): Promise<T> {
  let response: Response;
  const headers = new Headers(init.headers ?? {});
  if (!headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...init,
      headers,
    });
  } catch {
    throw new Error("Could not connect to the booking server. Please start the FastAPI backend and try again.");
  }

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `Request failed with status ${response.status}`);
  }

  return response.json() as Promise<T>;
}

type RequestOptions = {
  token?: string;
};

async function authorizedRequest<T>(path: string, init: RequestInit, options?: RequestOptions): Promise<T> {
  const headers = new Headers(init.headers ?? {});
  if (options?.token) {
    headers.set("Authorization", `Bearer ${options.token}`);
  }
  return request<T>(path, {
    ...init,
    headers,
  });
}

export function createCustomer(input: { name: string; phone: string }) {
  return request<CustomerResponse>("/customers/", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function createOrder(input: {
  customer_id: string;
  device: string;
  brand: string;
  model: string;
  issue: string;
  issue_details?: string;
  estimated_price: number;
  price_min: number;
  price_max: number;
  district: string;
  village: string;
  address_line: string;
  pincode: string;
  nearby_location: string;
  landmark?: string;
  latitude: number;
  longitude: number;
  alternate_phone?: string;
  booking_date: string;
  slot: string;
}) {
  return request<OrderResponse>("/orders/", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function getSlotAvailability(date: string) {
  return request<Record<string, number>>(`/slots/availability?date=${encodeURIComponent(date)}`, {
    method: "GET",
  });
}

export function getOrder(orderNumber: string) {
  return request<OrderResponse>(`/orders/${encodeURIComponent(orderNumber)}`, {
    method: "GET",
  });
}

export function getOrderTimeline(orderNumber: string) {
  return request<OrderStatusEvent[]>(`/orders/${encodeURIComponent(orderNumber)}/timeline`, {
    method: "GET",
  });
}

export function getHealth() {
  return request<HealthResponse>("/health", {
    method: "GET",
  });
}

export function adminLogin(input: { username: string; password: string }) {
  return request<AdminLoginResponse>("/admin/login", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function listAdminOrders(token: string, status?: string) {
  const suffix = status ? `?status=${encodeURIComponent(status)}` : "";
  return authorizedRequest<OrderResponse[]>(`/admin/orders${suffix}`, {
    method: "GET",
  }, { token });
}

export function updateOrderStatus(token: string, orderId: string, status: string) {
  return authorizedRequest<OrderResponse>(`/orders/${encodeURIComponent(orderId)}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  }, { token });
}

export function deleteOrder(token: string, orderId: string) {
  return authorizedRequest<{ message: string }>(`/orders/${encodeURIComponent(orderId)}`, {
    method: "DELETE",
  }, { token });
}
