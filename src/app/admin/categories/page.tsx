"use client";

import { useEffect, useState } from "react";
import { Layers, Plus, Edit2, Trash2, Save, X } from "lucide-react";

interface Category {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
  imageUrl: string | null;
  _count?: { products: number };
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: "", parentId: "" });

  useEffect(() => {
    fetchCategories();
  }, []);

  async function fetchCategories() {
    try {
      const res = await fetch("/api/admin/categories");
      if (res.ok) {
        const data = await res.json();
        setCategories(data.data ?? []);
      }
    } catch (err) {
      console.error("Failed to fetch categories:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    try {
      const method = editingId ? "PATCH" : "POST";
      const url = editingId ? `/api/admin/categories/${editingId}` : "/api/admin/categories";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          parentId: formData.parentId || null,
        }),
      });
      if (res.ok) {
        setShowForm(false);
        setEditingId(null);
        setFormData({ name: "", parentId: "" });
        fetchCategories();
      }
    } catch (err) {
      console.error("Failed to save category:", err);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this category?")) return;
    try {
      const res = await fetch(`/api/admin/categories/${id}`, { method: "DELETE" });
      if (res.ok) fetchCategories();
    } catch (err) {
      console.error("Failed to delete category:", err);
    }
  }

  function startEdit(cat: Category) {
    setEditingId(cat.id);
    setFormData({ name: cat.name, parentId: cat.parentId || "" });
    setShowForm(true);
  }

  const parentCategories = categories.filter((c) => !c.parentId);
  const childCategories = (parentId: string) => categories.filter((c) => c.parentId === parentId);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-serif text-neutral-900 mb-1">Categories</h1>
          <p className="text-sm text-neutral-500">Organize your product catalog</p>
        </div>
        <button
          onClick={() => { setShowForm(true); setEditingId(null); setFormData({ name: "", parentId: "" }); }}
          className="flex items-center gap-2 px-4 py-2 bg-[#0D2C22] text-white text-xs font-medium tracking-wider uppercase rounded-lg hover:bg-[#0D2C22]/90 transition-colors"
        >
          <Plus size={14} />
          Add Category
        </button>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div className="mb-6 p-5 bg-white rounded-xl border border-neutral-200 shadow-sm">
          <h3 className="text-sm font-semibold text-neutral-800 mb-4">
            {editingId ? "Edit Category" : "New Category"}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-medium tracking-wider uppercase text-neutral-400 mb-1.5">
                Category Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Dresses, Kente Cloth"
                className="w-full h-10 px-3 rounded-lg border border-neutral-200 bg-white text-sm focus:outline-none focus:border-[#0D2C22] focus:ring-1 focus:ring-[#0D2C22]/20 transition-all"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium tracking-wider uppercase text-neutral-400 mb-1.5">
                Parent Category (optional)
              </label>
              <select
                value={formData.parentId}
                onChange={(e) => setFormData({ ...formData, parentId: e.target.value })}
                className="w-full h-10 px-3 rounded-lg border border-neutral-200 bg-white text-sm focus:outline-none focus:border-[#0D2C22] focus:ring-1 focus:ring-[#0D2C22]/20 transition-all"
              >
                <option value="">None (Top Level)</option>
                {parentCategories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-4">
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-4 py-2 bg-[#0D2C22] text-white text-xs font-medium rounded-lg hover:bg-[#0D2C22]/90 transition-colors"
            >
              <Save size={14} />
              {editingId ? "Update" : "Create"}
            </button>
            <button
              onClick={() => { setShowForm(false); setEditingId(null); }}
              className="flex items-center gap-2 px-4 py-2 border border-neutral-200 text-neutral-600 text-xs font-medium rounded-lg hover:bg-neutral-50 transition-colors"
            >
              <X size={14} />
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Categories List */}
      <div className="bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="h-6 w-48 bg-neutral-100 rounded animate-pulse mx-auto" />
          </div>
        ) : categories.length === 0 ? (
          <div className="p-12 text-center">
            <Layers className="h-8 w-8 text-neutral-300 mx-auto mb-2" />
            <p className="text-sm text-neutral-400">No categories yet</p>
            <p className="text-xs text-neutral-300 mt-1">Create your first category to organize products</p>
          </div>
        ) : (
          <div className="divide-y divide-neutral-100">
            {parentCategories.map((cat) => (
              <div key={cat.id}>
                <div className="flex items-center justify-between px-5 py-3 hover:bg-neutral-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#0D2C22]/5 flex items-center justify-center">
                      <Layers size={14} className="text-[#0D2C22]" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-neutral-800">{cat.name}</p>
                      <p className="text-xs text-neutral-400">/{cat.slug}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-neutral-400">{cat._count?.products || 0} products</span>
                    <button onClick={() => startEdit(cat)} className="p-1.5 hover:bg-neutral-100 rounded-lg transition-colors">
                      <Edit2 size={14} className="text-neutral-400" />
                    </button>
                    <button onClick={() => handleDelete(cat.id)} className="p-1.5 hover:bg-red-50 rounded-lg transition-colors">
                      <Trash2 size={14} className="text-red-400" />
                    </button>
                  </div>
                </div>
                {/* Children */}
                {childCategories(cat.id).map((child) => (
                  <div key={child.id} className="flex items-center justify-between px-5 py-2.5 pl-14 bg-neutral-50/50 hover:bg-neutral-50 transition-colors">
                    <div>
                      <p className="text-sm text-neutral-700">{child.name}</p>
                      <p className="text-xs text-neutral-400">/{child.slug}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-neutral-400">{child._count?.products || 0} products</span>
                      <button onClick={() => startEdit(child)} className="p-1.5 hover:bg-neutral-100 rounded-lg transition-colors">
                        <Edit2 size={12} className="text-neutral-400" />
                      </button>
                      <button onClick={() => handleDelete(child.id)} className="p-1.5 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 size={12} className="text-red-400" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
