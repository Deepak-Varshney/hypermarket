"use client";

import { useState, useEffect } from "react";
import CartView from "@/src/components/CartView";

interface Props {
  initialCart: any;
  initialCartItems: any[];
  initialCartTotal: number;
}

export default function CartClient({ initialCart, initialCartItems, initialCartTotal }: Props) {
  const [cart, setCart] = useState<any>(initialCart);
  const [cartItems, setCartItems] = useState<any[]>(initialCartItems || []);
  const [cartTotal, setCartTotal] = useState<number>(initialCartTotal || 0);
  const [msg, setMsg] = useState("");

  const recalculateTotal = (items: any[]) => {
    const total = items.reduce((sum, item) => sum + (item.product?.price || 0) * item.quantity, 0);
    setCartTotal(Number(total.toFixed(2)));
  };

  const fetchCart = async () => {
    try {
      const res = await fetch("/api/customer/cart", { cache: "no-store" });
      const data = await res.json();
      if (data.success && data.data) {
        setCart(data.data.cart);
        setCartItems(data.data.items || []);
        setCartTotal(data.data.total || 0);
      } else {
        setCart(null);
        setCartItems([]);
        setCartTotal(0);
      }
    } catch {
      setCart(null);
    }
  };

  useEffect(() => {
    const handleCartUpdate = (e: any) => {
      if (e.detail?.itemId !== undefined && e.detail?.quantity !== undefined) {
        const { itemId, quantity } = e.detail;
        setCartItems((prev) => {
          let nextItems;
          if (quantity <= 0) {
            nextItems = prev.filter((i) => i.id !== itemId);
          } else {
            nextItems = prev.map((i) => (i.id === itemId ? { ...i, quantity } : i));
          }
          recalculateTotal(nextItems);
          return nextItems;
        });
      } else {
        fetchCart();
      }
    };

    window.addEventListener("cartUpdated", handleCartUpdate);
    return () => window.removeEventListener("cartUpdated", handleCartUpdate);
  }, []);

  const handleUpdateQty = async (itemId: number, newQty: number) => {
    // 1. Local optimistic update
    if (newQty <= 0) {
      const nextItems = cartItems.filter((i) => i.id !== itemId);
      setCartItems(nextItems);
      recalculateTotal(nextItems);
    } else {
      const nextItems = cartItems.map((i) => (i.id === itemId ? { ...i, quantity: newQty } : i));
      setCartItems(nextItems);
      recalculateTotal(nextItems);
    }

    // 2. Broadcast event to SideCartPanel
    window.dispatchEvent(
      new CustomEvent("cartUpdated", { detail: { itemId, quantity: newQty } })
    );

    // 3. Sync DB
    try {
      await fetch(`/api/customer/cart/${itemId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity: newQty })
      });
    } catch {
      fetchCart();
    }
  };

  const handleRemoveItem = async (itemId: number) => {
    const nextItems = cartItems.filter((i) => i.id !== itemId);
    setCartItems(nextItems);
    recalculateTotal(nextItems);

    window.dispatchEvent(
      new CustomEvent("cartUpdated", { detail: { itemId, quantity: 0 } })
    );

    try {
      await fetch(`/api/customer/cart/${itemId}`, { method: "DELETE" });
    } catch {
      fetchCart();
    }
  };

  const handlePlaceOrder = async (address: string) => {
    if (!address) {
      setMsg("Please enter a delivery address");
      return;
    }
    setMsg("");

    const res = await fetch("/api/customer/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ deliveryAddress: address })
    });

    const data = await res.json();
    if (data.success) {
      setMsg("Order placed successfully!");
      setCartItems([]);
      setCartTotal(0);
      window.dispatchEvent(new Event("cartUpdated"));
    } else {
      setMsg(data.message || "Order placement failed");
    }
  };

  return (
    <div className="space-y-4 max-w-2xl mx-auto">
      {msg && <div className="p-3 text-sm bg-blue-50 text-blue-700 border border-blue-200 rounded-md">{msg}</div>}
      <CartView
        cart={cart}
        cartItems={cartItems}
        cartTotal={cartTotal}
        onUpdateQty={handleUpdateQty}
        onRemoveItem={handleRemoveItem}
        onPlaceOrder={handlePlaceOrder}
      />
    </div>
  );
}
