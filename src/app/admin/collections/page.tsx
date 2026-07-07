"use client";

import { useEffect, useState } from "react";
import { Tag, Plus, Edit2, Trash2, Save, X, Star } from "lucide-react";

interface Collection {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  isFeatured: boolean;
  _count?: { products: number };
}

export default function CollectionsPage() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: "", description: "", isFeatured: false });

  useEffect(() => {
    fetchCollections();
  }, []);

  async function fetchCollections() {
    try {
      const res = await fetch("/api/admin/collections");
      if (res.ok) {
        const data = await res.json();
        setCollections(data.data ?? []);
      }
    } catch (err) {
      console.error("Failed to fetch collections:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    try {
      const method = editingId ? "PATCH" : "POST";
      const url = editingId ? `/api/admin/collections/${editingId}` : "/api/admin/collections";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        setShowForm(false);
        setEditingId(null);
        setFormData({ name: "", description: "", isFeatured: false });
        fetchCollections();
      }
    } catch (err) {
      console.error("Failed to save collection:", err);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this collection?")) return;
    try {
      const res = await fetch(`/api/admin/collections/${id}`, { method: "DELETE" });
      if (res.ok) fetchCollections();
    } catch (err) {
      console.error("Failed to delete collection:", err);
    }
  }

  function startEdit(col: Collection) {
    setEditingId(col.id);
    setFormData({ name: col.name, description: col.description || "", isFeatured: col.isFeatured });
    setShowForm(true);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-serif text-neutral-900 mb-1">Collections</h1>
          <p className="text-sm text-neutral-500">Curate and manage product collections</p>
        </div>
        <button
          onClick={() => { setShowForm(true); setEditingId(null); setFormData({ name: "", description: "", isFeatured: false }); }}
          className="flex items-center gap-2 px-4 py-2 bg-[#0D2C22] text-white text-xs font-medium tracking-wider uppercase rounded-lg hover:bg-[#0D2C22]/90 transition-colors"
        >
          <Plus size={14} />
          New Collection
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="mb-6 p-5 bg-white rounded-xl border border-neutral-200 shadow-sm">
          <h3 className="text-sm font-semibold text-neutral-800 mb-4">
            {editingId ? "Edit Collection" : "New Collection"}
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-[11px] font-medium tracking-wider uppercase text-neutral-400 mb-1.5">
                Collection Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Summer 2026, Heritage Classics"
                className="w-full h-10 px-3 rounded-lg border border-neutral-200 bg-white text-sm focus:outline-none focus:border-[#0D2C22] focus:ring-1 focus:ring-[#0D2C22]/20 transition-all"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium tracking-wider uppercase text-neutral-400 mb-1.5">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe this collection..."
                rows={3}
                className="w-full px-3 py-2 rounded-lg border border-neutral-200 bg-white text-sm focus:outline-none focus:border-[#0D2C22] focus:ring-1 focus:ring-[#0D2C22]/20 transition-all resize-none"
              />
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isFeatured}
                onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                className="w-4 h-4 rounded border-neutral-300 text-[#0D2C22] focus:ring-[#0D2C22]"
              />
              <span className="text-sm text-neutral-700">Featured on homepage</span>
            </label>
          </div>
          <div className="flex items-center gap-2 mt-4">
            <button onClick={handleSave} className="flex items-center gap-2 px-4 py-2 bg-[#0D2C22] text-white text-xs font-medium rounded-lg hover:bg-[#0D2C22]/90 transition-colors">
              <Save size={14} />
              {editingId ? "Update" : "Create"}
            </button>
            <button onClick={() => { setShowForm(false); setEditingId(null); }} className="flex items-center gap-2 px-4 py-2 border border-neutral-200 text-neutral-600 text-xs font-medium rounded-lg hover:bg-neutral-50 transition-colors">
              <X size={14} />
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Collections Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-40 bg-white rounded-xl border border-neutral-200 animate-pulse" />
          ))}
        </div>
      ) : collections.length === 0 ? (
        <div className="bg-white rounded-xl border border-neutral-200 p-12 text-center">
          <Tag className="h-8 w-8 text-neutral-300 mx-auto mb-2" />
          <p className="text-sm text-neutral-400">No collections yet</p>
          <p className="text-xs text-neutral-300 mt-1">Create collections to curate products for your customers</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {collections.map((col) => (
            <div key={col.id} className="bg-white rounded-xl border border-neutral-200 shadow-sm p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center">
                    <Tag size={14} className="text-purple-600" />
                  </div>
                  {col.isFeatured && <Star size={12} className="text-amber-500 fill-amber-500" />}
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => startEdit(col)} className="p-1.5 hover:bg-neutral-100 rounded-lg transition-colors">
                    <Edit2 size={14} className="text-neutral-400" />
                  </button>
                  <button onClick={() => handleDelete(col.id)} className="p-1.5 hover:bg-red-50 rounded-lg transition-colors">
                    <Trash2 size={14} className="text-red-400" />
                  </button>
                </div>
              </div>
              <h3 className="text-sm font-semibold text-neutral-800 mb-1">{col.name}</h3>
              {col.description && (
                <p className="text-xs text-neutral-500 line-clamp-2 mb-3">{col.description}</p>
              )}
              <div className="flex items-center justify-between pt-3 border-t border-neutral-100">
                <span className="text-xs text-neutral-400">{col._count?.products || 0} products</span>
                <span className="text-[10px] font-medium tracking-wider uppercase text-neutral-300">/{col.slug}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
