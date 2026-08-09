"use client";

import { useState } from "react";

interface Props {
  products: any[];
}

const DEFAULT_PRODUCT_IMAGE = "https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&auto=format&fit=crop&q=60";

export default function ShopCatalogueView({ products }: Props) {
  const [msg, setMsg] = useState("");
  const [addingId, setAddingId] = useState<number | null>(null);

  const handleAddToCart = async (productId: number) => {
    setMsg("");
    setAddingId(productId);

    try {
      const res = await fetch("/api/customer/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, quantity: 1 })
      });

      const data = await res.json();
      if (data.success) {
        setMsg("Item added to cart!");
        window.dispatchEvent(new Event("cartUpdated"));
      } else {
        setMsg(data.message || "Failed to add to cart");
      }
    } catch {
      setMsg("Error adding item to cart");
    } finally {
      setAddingId(null);
    }
  };

  return (
    <div className="space-y-4">
      {msg && <div className="p-3 text-sm bg-blue-50 text-blue-700 border border-blue-200 rounded-md">{msg}</div>}

      <h3 className="text-lg font-bold text-gray-800 border-b pb-2">Available Products ({products.length})</h3>

      {products.length === 0 ? (
        <p className="text-sm text-gray-500 py-6 text-center">No available products in this store currently.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {products.map((p) => {
            const imgSrc = p.imageUrl && p.imageUrl.trim() !== "" ? p.imageUrl : DEFAULT_PRODUCT_IMAGE;

            return (
              <div key={p.id} className="bg-white border border-gray-200 rounded-lg p-4 flex flex-col justify-between shadow-xs hover:shadow-sm transition-shadow">
                <div className="mb-3">
                  <img
                    src={imgSrc}
                    alt={p.title}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = DEFAULT_PRODUCT_IMAGE;
                    }}
                    className="w-full h-36 object-cover rounded-md mb-3 bg-gray-100"
                  />
                  <h4 className="font-semibold text-gray-900 text-base">{p.title}</h4>
                  <p className="text-sm font-bold text-green-700 mt-1">${p.price.toFixed(2)}</p>
                </div>

                <button
                  type="button"
                  disabled={addingId === p.id}
                  onClick={() => handleAddToCart(p.id)}
                  className="w-full bg-green-600 hover:bg-green-700 text-white text-xs font-bold py-2.5 rounded-md transition-colors disabled:opacity-50"
                >
                  {addingId === p.id ? "Adding..." : "Add to Cart"}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
