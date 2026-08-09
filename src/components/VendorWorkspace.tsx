"use client";

import { useState } from "react";
import VendorShopForm from "@/src/components/VendorShopForm";
import VendorProductForm from "@/src/components/VendorProductForm";
import VendorProductList from "@/src/components/VendorProductList";

interface Props {
  initialShop: any;
  initialProducts: any[];
}

export default function VendorWorkspace({ initialShop, initialProducts }: Props) {
  const [shop, setShop] = useState<any>(initialShop);
  const [products, setProducts] = useState<any[]>(initialProducts || []);
  const [editingProduct, setEditingProduct] = useState<any>(null);

  const handleProductSuccess = (product: any, isEdit: boolean) => {
    if (isEdit) {
      setProducts((prev) => prev.map((p) => (p.id === product.id ? product : p)));
      setEditingProduct(null);
    } else {
      setProducts((prev) => [product, ...prev]);
    }
  };

  const handleDeleteProduct = async (id: number) => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    try {
      const res = await fetch(`/api/vendor/products/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setProducts((prev) => prev.filter((p) => p.id !== id));
      } else {
        alert(data.message || "Failed to delete product");
      }
    } catch {
      alert("Error deleting product");
    }
  };

  return (
    <div className="space-y-6">
      <VendorShopForm initialShop={shop} onShopSaved={(updatedShop) => setShop(updatedShop)} />

      {shop && (
        <div className="space-y-6">
          <VendorProductForm
            editingProduct={editingProduct}
            onSuccess={handleProductSuccess}
            onCancelEdit={() => setEditingProduct(null)}
          />
          <VendorProductList
            products={products}
            onEdit={(prod) => setEditingProduct(prod)}
            onDelete={handleDeleteProduct}
          />
        </div>
      )}
    </div>
  );
}
