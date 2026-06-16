import { useState, useEffect, useCallback } from "react";
import type { Product, PaginatedResponse, ProductFilters } from "@/types";

export function useProducts(initialFilters?: ProductFilters) {
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<ProductFilters>(initialFilters ?? {});

  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    const params = new URLSearchParams();
    if (filters.category) params.set("category", filters.category);
    if (filters.collection) params.set("collection", filters.collection);
    if (filters.sort) params.set("sort", filters.sort);
    if (filters.page) params.set("page", filters.page.toString());
    if (filters.pageSize) params.set("pageSize", filters.pageSize.toString());
    if (filters.search) params.set("search", filters.search);
    if (filters.minPrice) params.set("minPrice", filters.minPrice.toString());
    if (filters.maxPrice) params.set("maxPrice", filters.maxPrice.toString());
    filters.brand?.forEach((b) => params.append("brand", b));
    filters.size?.forEach((s) => params.append("size", s));
    filters.color?.forEach((c) => params.append("color", c));

    try {
      const res = await fetch(`/api/products?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch products");
      const data: PaginatedResponse<Product> = await res.json();
      setProducts(data.data);
      setTotal(data.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return {
    products,
    total,
    isLoading,
    error,
    filters,
    setFilters,
    refetch: fetchProducts,
  };
}
