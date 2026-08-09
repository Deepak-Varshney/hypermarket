"use client";

import { useState, useEffect } from "react";

interface Props {
  editingProduct?: any;
  onSuccess: (product: any, isEdit: boolean) => void;
  onCancelEdit?: () => void;
}

export default function VendorProductForm({ editingProduct, onSuccess, onCancelEdit }: Props) {
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [isAvailable, setIsAvailable] = useState(true);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (editingProduct) {
      setTitle(editingProduct.title || "");
      setPrice(String(editingProduct.price || ""));
      setImageUrl(editingProduct.imageUrl || "");
      setIsAvailable(editingProduct.isAvailable ?? true);
    } else {
      setTitle("");
      setPrice("");
      setImageUrl("");
      setIsAvailable(true);
    }
  }, [editingProduct]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg("");
    setLoading(true);

    const isEdit = Boolean(editingProduct?.id);
    const url = isEdit ? `/api/vendor/products/${editingProduct.id}` : "/api/vendor/products";
    const method = isEdit ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          imageUrl,
          price: parseFloat(price),
          isAvailable
        })
      });

      const data = await res.json();
      if (data.success) {
        onSuccess(data.data, isEdit);
        if (!isEdit) {
          setTitle("");
          setPrice("");
          setImageUrl("");
        }
      } else {
        setMsg(data.message || "Failed to save product.");
      }
    } catch {
      setMsg("Error submitting product.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="border border-gray-200 rounded-lg p-5 bg-white shadow-sm max-w-md">
      <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">
        {editingProduct ? "Edit Product" : "Add Product to Catalogue"}
      </h3>

      {msg && <div className="p-3 mb-4 text-sm bg-red-50 text-red-700 rounded-md border border-red-200">{msg}</div>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Product Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Fresh Red Apples (1kg)"
            className="w-full border border-gray-300 rounded-md p-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Price ($)</label>
          <input
            type="number"
            step="0.01"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="3.50"
            className="w-full border border-gray-300 rounded-md p-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Image URL (Optional)</label>
          <input
            type="text"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="https://..."
            className="w-full border border-gray-300 rounded-md p-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="availableCheck"
            checked={isAvailable}
            onChange={(e) => setIsAvailable(e.target.checked)}
            className="h-4 w-4 text-blue-600 rounded"
          />
          <label htmlFor="availableCheck" className="text-sm font-medium text-gray-700 cursor-pointer">
            Available for Customers
          </label>
        </div>

        <div className="flex gap-2">
          <button
            type="submit"
            disabled={loading}
            className="bg-green-600 hover:bg-green-700 text-white text-sm font-medium py-2 px-4 rounded-md transition-colors disabled:opacity-50"
          >
            {loading ? "Processing..." : editingProduct ? "Update Product" : "Add Product"}
          </button>

          {editingProduct && onCancelEdit && (
            <button
              type="button"
              onClick={onCancelEdit}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium py-2 px-4 rounded-md border border-gray-300"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
