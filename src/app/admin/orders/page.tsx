"use client";

import { useEffect, useState } from "react";
import { ShoppingCart, Search, Filter, Eye, Truck, XCircle, CheckCircle } from "lucide-react";
import { formatPrice } from "@/lib/utils";

interface OrderItem {
  id: string;
  quantity: number;
  unitPriceCents: number;
  product: { name: string; slug: string };
  variant?: { size: string; color: string | null } | null;
}

interface Order {
  id: string;
  orderNumber: string;
  guestEmail: string | null;
  status: string;
  paymentStatus: string;
  totalCents: number;
  currency: string;
  shippingMethod: string | null;
  trackingNumber: string | null;
  createdAt: string;
  items: OrderItem[];
  user?: { firstName: string; lastName: string; email: string } | null;
}

const STATUS_STYLES: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-700",
  CONFIRMED: "bg-blue-100 text-blue-700",
  PROCESSING: "bg-indigo-100 text-indigo-700",
  SHIPPED: "bg-emerald-100 text-emerald-700",
  DELIVERED: "bg-green-100 text-green-700",
  CANCELLED: "bg-red-100 text-red-700",
  REFUNDED: "bg-neutral-100 text-neutral-600",
};

const PAYMENT_STYLES: Record<string, string> = {
  PENDING: "bg-amber-50 text-amber-600",
  AUTHORIZED: "bg-blue-50 text-blue-600",
  CAPTURED: "bg-green-50 text-green-600",
  FAILED: "bg-red-50 text-red-600",
  REFUNDED: "bg-neutral-50 text-neutral-600",
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, [page, statusFilter, search]);

  async function fetchOrders() {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), pageSize: "15" });
      if (statusFilter) params.set("status", statusFilter);
      if (search) params.set("search", search);
      const res = await fetch(`/api/admin/orders?${params}`);
      if (res.ok) {
        const data = await res.json();
        setOrders(data.data ?? []);
        setTotal(data.total ?? 0);
      }
    } catch (err) {
      console.error("Failed to fetch orders:", err);
    } finally {
      setLoading(false);
    }
  }

  async function updateOrderStatus(orderId: string, newStatus: string) {
    setUpdatingStatus(true);
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        fetchOrders();
        if (selectedOrder?.id === orderId) {
          setSelectedOrder({ ...selectedOrder, status: newStatus });
        }
      }
    } catch (err) {
      console.error("Failed to update order:", err);
    } finally {
      setUpdatingStatus(false);
    }
  }

  async function viewOrderDetail(orderId: string) {
    try {
      const res = await fetch(`/api/orders/${orderId}`);
      if (res.ok) {
        const data = await res.json();
        setSelectedOrder(data);
      }
    } catch (err) {
      console.error("Failed to fetch order detail:", err);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-serif text-neutral-900 mb-1">Orders</h1>
          <p className="text-sm text-neutral-500">Manage and fulfill customer orders</p>
        </div>
        <div className="text-sm text-neutral-500">{total} total orders</div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            placeholder="Search by order number or email..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full h-10 pl-9 pr-4 rounded-lg border border-neutral-200 bg-white text-sm focus:outline-none focus:border-[#0D2C22] focus:ring-1 focus:ring-[#0D2C22]/20 transition-all"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="h-10 px-3 rounded-lg border border-neutral-200 bg-white text-sm focus:outline-none focus:border-[#0D2C22] focus:ring-1 focus:ring-[#0D2C22]/20 transition-all"
        >
          <option value="">All Statuses</option>
          <option value="PENDING">Pending</option>
          <option value="CONFIRMED">Confirmed</option>
          <option value="PROCESSING">Processing</option>
          <option value="SHIPPED">Shipped</option>
          <option value="DELIVERED">Delivered</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Orders Table */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-neutral-100 bg-neutral-50/50">
                <th className="text-left px-4 py-3 text-[10px] font-semibold tracking-[0.15em] uppercase text-neutral-400">Order</th>
                <th className="text-left px-4 py-3 text-[10px] font-semibold tracking-[0.15em] uppercase text-neutral-400">Customer</th>
                <th className="text-left px-4 py-3 text-[10px] font-semibold tracking-[0.15em] uppercase text-neutral-400">Status</th>
                <th className="text-left px-4 py-3 text-[10px] font-semibold tracking-[0.15em] uppercase text-neutral-400">Payment</th>
                <th className="text-left px-4 py-3 text-[10px] font-semibold tracking-[0.15em] uppercase text-neutral-400">Total</th>
                <th className="w-10" />
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}><td colSpan={6} className="px-4 py-4"><div className="h-5 bg-neutral-100 rounded animate-pulse" /></td></tr>
                ))
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-16 text-center">
                    <ShoppingCart className="h-8 w-8 text-neutral-300 mx-auto mb-2" />
                    <p className="text-sm text-neutral-400">No orders found</p>
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr
                    key={order.id}
                    className={`hover:bg-neutral-50 transition-colors cursor-pointer ${selectedOrder?.id === order.id ? "bg-blue-50/50" : ""}`}
                    onClick={() => viewOrderDetail(order.id)}
                  >
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium font-mono text-[#0D2C22]">{order.orderNumber}</p>
                      <p className="text-[10px] text-neutral-400">{new Date(order.createdAt).toLocaleDateString()}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm text-neutral-700">
                        {order.user ? `${order.user.firstName} ${order.user.lastName}` : order.guestEmail || "Guest"}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-0.5 text-[9px] font-semibold tracking-wider uppercase rounded ${STATUS_STYLES[order.status] || ""}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-0.5 text-[9px] font-semibold tracking-wider uppercase rounded ${PAYMENT_STYLES[order.paymentStatus] || ""}`}>
                        {order.paymentStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-neutral-800">
                      {formatPrice(order.totalCents, order.currency)}
                    </td>
                    <td className="px-4 py-3">
                      <Eye size={14} className="text-neutral-400" />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {/* Pagination */}
          {total > 15 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-neutral-100">
              <p className="text-xs text-neutral-400">Page {page} of {Math.ceil(total / 15)}</p>
              <div className="flex gap-2">
                <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1} className="px-3 py-1 text-xs rounded border border-neutral-200 hover:bg-neutral-50 disabled:opacity-50">Prev</button>
                <button onClick={() => setPage(page + 1)} disabled={page * 15 >= total} className="px-3 py-1 text-xs rounded border border-neutral-200 hover:bg-neutral-50 disabled:opacity-50">Next</button>
              </div>
            </div>
          )}
        </div>

        {/* Order Detail Panel */}
        <div className="bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden">
          {selectedOrder ? (
            <div>
              <div className="px-5 py-4 border-b border-neutral-100 bg-neutral-50/50">
                <h3 className="text-sm font-semibold text-neutral-800">Order Details</h3>
                <p className="text-xs text-neutral-400 font-mono">{selectedOrder.orderNumber}</p>
              </div>
              <div className="p-5 space-y-4">
                {/* Status */}
                <div>
                  <label className="block text-[10px] font-semibold tracking-wider uppercase text-neutral-400 mb-2">Status</label>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold tracking-wider uppercase rounded ${STATUS_STYLES[selectedOrder.status] || ""}`}>
                    {selectedOrder.status}
                  </span>
                </div>

                {/* Items */}
                <div>
                  <label className="block text-[10px] font-semibold tracking-wider uppercase text-neutral-400 mb-2">Items</label>
                  <div className="space-y-2">
                    {selectedOrder.items?.map((item) => (
                      <div key={item.id} className="flex items-center justify-between text-xs">
                        <div>
                          <p className="font-medium text-neutral-700">{item.product.name}</p>
                          {item.variant && <p className="text-neutral-400">Size: {item.variant.size}</p>}
                        </div>
                        <div className="text-right">
                          <p className="text-neutral-600">x{item.quantity}</p>
                          <p className="font-medium">{formatPrice(item.unitPriceCents)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Total */}
                <div className="pt-3 border-t border-neutral-100">
                  <div className="flex justify-between text-sm font-semibold">
                    <span>Total</span>
                    <span>{formatPrice(selectedOrder.totalCents, selectedOrder.currency)}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-3 border-t border-neutral-100 space-y-2">
                  <label className="block text-[10px] font-semibold tracking-wider uppercase text-neutral-400 mb-2">Actions</label>
                  {selectedOrder.status === "PENDING" && (
                    <button
                      onClick={() => updateOrderStatus(selectedOrder.id, "CONFIRMED")}
                      disabled={updatingStatus}
                      className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                    >
                      <CheckCircle size={14} />
                      Confirm Order
                    </button>
                  )}
                  {selectedOrder.status === "CONFIRMED" && (
                    <button
                      onClick={() => updateOrderStatus(selectedOrder.id, "PROCESSING")}
                      disabled={updatingStatus}
                      className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-indigo-600 text-white text-xs font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                    >
                      <Filter size={14} />
                      Start Processing
                    </button>
                  )}
                  {selectedOrder.status === "PROCESSING" && (
                    <button
                      onClick={() => updateOrderStatus(selectedOrder.id, "SHIPPED")}
                      disabled={updatingStatus}
                      className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-emerald-600 text-white text-xs font-medium rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition-colors"
                    >
                      <Truck size={14} />
                      Mark as Shipped
                    </button>
                  )}
                  {selectedOrder.status === "SHIPPED" && (
                    <button
                      onClick={() => updateOrderStatus(selectedOrder.id, "DELIVERED")}
                      disabled={updatingStatus}
                      className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-green-600 text-white text-xs font-medium rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                    >
                      <CheckCircle size={14} />
                      Mark Delivered
                    </button>
                  )}
                  {!["CANCELLED", "DELIVERED", "REFUNDED"].includes(selectedOrder.status) && (
                    <button
                      onClick={() => updateOrderStatus(selectedOrder.id, "CANCELLED")}
                      disabled={updatingStatus}
                      className="w-full flex items-center justify-center gap-2 px-3 py-2 border border-red-200 text-red-600 text-xs font-medium rounded-lg hover:bg-red-50 disabled:opacity-50 transition-colors"
                    >
                      <XCircle size={14} />
                      Cancel Order
                    </button>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center">
              <Eye className="h-8 w-8 text-neutral-300 mx-auto mb-2" />
              <p className="text-sm text-neutral-400">Select an order to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
