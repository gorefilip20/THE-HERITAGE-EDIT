"use client";

import { useEffect, useState } from "react";
import { Users, Search, Mail, ShoppingBag, Calendar } from "lucide-react";
import { formatPrice } from "@/lib/utils";

interface Customer {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  phone: string | null;
  createdAt: string;
  _count: { orders: number };
  totalSpent: number;
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetchCustomers();
  }, [page, search]);

  async function fetchCustomers() {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), pageSize: "20" });
      if (search) params.set("search", search);
      const res = await fetch(`/api/admin/customers?${params}`);
      if (res.ok) {
        const data = await res.json();
        setCustomers(data.data ?? []);
        setTotal(data.total ?? 0);
      }
    } catch (err) {
      console.error("Failed to fetch customers:", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-serif text-neutral-900 mb-1">Customers</h1>
          <p className="text-sm text-neutral-500">{total} registered customers</p>
        </div>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full h-10 pl-9 pr-4 rounded-lg border border-neutral-200 bg-white text-sm focus:outline-none focus:border-[#0D2C22] focus:ring-1 focus:ring-[#0D2C22]/20 transition-all"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-neutral-100 bg-neutral-50/50">
              <th className="text-left px-5 py-3 text-[10px] font-semibold tracking-[0.15em] uppercase text-neutral-400">Customer</th>
              <th className="text-left px-5 py-3 text-[10px] font-semibold tracking-[0.15em] uppercase text-neutral-400">Email</th>
              <th className="text-left px-5 py-3 text-[10px] font-semibold tracking-[0.15em] uppercase text-neutral-400">Orders</th>
              <th className="text-left px-5 py-3 text-[10px] font-semibold tracking-[0.15em] uppercase text-neutral-400">Total Spent</th>
              <th className="text-left px-5 py-3 text-[10px] font-semibold tracking-[0.15em] uppercase text-neutral-400">Joined</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  <td colSpan={5} className="px-5 py-4">
                    <div className="h-5 bg-neutral-100 rounded animate-pulse w-full" />
                  </td>
                </tr>
              ))
            ) : customers.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-5 py-16 text-center">
                  <Users className="h-8 w-8 text-neutral-300 mx-auto mb-2" />
                  <p className="text-sm text-neutral-400">No customers found</p>
                </td>
              </tr>
            ) : (
              customers.map((customer) => (
                <tr key={customer.id} className="hover:bg-neutral-50 transition-colors">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#0D2C22] to-[#2E1A47] flex items-center justify-center text-white text-[10px] font-bold">
                        {customer.firstName[0]}{customer.lastName[0]}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-neutral-800">
                          {customer.firstName} {customer.lastName}
                        </p>
                        {customer.role === "ADMIN" && (
                          <span className="text-[9px] font-bold tracking-wider uppercase text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded">
                            Admin
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-1.5 text-sm text-neutral-600">
                      <Mail size={12} className="text-neutral-400" />
                      {customer.email}
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-1.5 text-sm text-neutral-600">
                      <ShoppingBag size={12} className="text-neutral-400" />
                      {customer._count.orders}
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <span className="text-sm font-medium text-neutral-800">
                      {formatPrice(customer.totalSpent)}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-1.5 text-xs text-neutral-400">
                      <Calendar size={12} />
                      {new Date(customer.createdAt).toLocaleDateString()}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {total > 20 && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-xs text-neutral-400">
            Showing {(page - 1) * 20 + 1} to {Math.min(page * 20, total)} of {total}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="px-3 py-1.5 text-xs font-medium rounded-lg border border-neutral-200 hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={() => setPage(page + 1)}
              disabled={page * 20 >= total}
              className="px-3 py-1.5 text-xs font-medium rounded-lg border border-neutral-200 hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
