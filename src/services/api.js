const API = (import.meta.env.VITE_API_URL || (import.meta.env.DEV ? "http://localhost:5000/api" : "/api")).replace(/\/$/, "");

async function request(path, options = {}) {
  const token = localStorage.getItem("nm_token");
  const headers = { "Content-Type": "application/json", ...(options.headers || {}) };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API}${path}`, { ...options, headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || "Request failed");
  return data;
}

export const api = {
  products: (params = "") => request(`/products${params ? `?${params}` : ""}`),
  search: query => request(`/products/search?q=${encodeURIComponent(query)}`),
  product: id => request(`/products/${id}`),
  announcements: () => request("/announcements"),
  paymentConfig: () => request("/payment-config"),
  register: body => request("/auth/register", { method: "POST", body: JSON.stringify(body) }),
  login: body => request("/auth/login", { method: "POST", body: JSON.stringify(body) }),
  me: () => request("/auth/me"),
  deliveryAddress: () => request("/account/delivery-address"),
  saveDeliveryAddress: address => request("/account/delivery-address", { method: "PUT", body: JSON.stringify({ address }) }),
  quoteOrder: items => request("/orders/quote", { method: "POST", body: JSON.stringify({ items }) }),
  createOrder: body => request("/orders", { method: "POST", body: JSON.stringify(body) }),
  myOrders: () => request("/orders/my")
};
