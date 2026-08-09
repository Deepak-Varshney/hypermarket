"use client";

import { useState, useEffect } from "react";

export default function SideCartPanel() {
  const [cart, setCart] = useState<any>(null);
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [cartTotal, setCartTotal] = useState<number>(0);
  const [address, setAddress] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

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

  const recalculateTotal = (items: any[]) => {
    const total = items.reduce((sum, item) => sum + (item.product?.price || 0) * item.quantity, 0);
    setCartTotal(Number(total.toFixed(2)));
  };

  useEffect(() => {
    fetchCart();

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
    // 1. Optimistic update
    if (newQty <= 0) {
      const nextItems = cartItems.filter((i) => i.id !== itemId);
      setCartItems(nextItems);
      recalculateTotal(nextItems);
    } else {
      const nextItems = cartItems.map((i) => (i.id === itemId ? { ...i, quantity: newQty } : i));
      setCartItems(nextItems);
      recalculateTotal(nextItems);
    }

    // 2. Broadcast to other components
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

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address) {
      setMsg("Enter delivery address");
      return;
    }
    setMsg("");
    setLoading(true);

    try {
      const res = await fetch("/api/customer/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deliveryAddress: address })
      });

      const data = await res.json();
      if (data.success) {
        setMsg("Order placed successfully! 🎉");
        setAddress("");
        setCartItems([]);
        setCartTotal(0);
        window.dispatchEvent(new Event("cartUpdated"));
      } else {
        setMsg(data.message || "Checkout failed");
      }
    } catch {
      setMsg("Error placing order");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-xs sticky top-20">
      <div className="flex justify-between items-center border-b pb-2 mb-3">
        <h4 className="font-bold text-gray-800 text-base flex items-center gap-1.5">
          🛒 Your Cart
        </h4>
        {cartItems.length > 0 && (
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-green-100 text-green-800">
            {cartItems.reduce((acc, item) => acc + item.quantity, 0)} items
          </span>
        )}
      </div>

      {msg && <div className="p-2 mb-3 text-xs bg-blue-50 text-blue-700 rounded border border-blue-200">{msg}</div>}

      {cartItems.length === 0 ? (
        <div className="py-6 text-center text-xs text-gray-500">
          <p className="text-2xl mb-1">🛒</p>
          <p>Your cart is empty.</p>
          <p className="mt-1 text-gray-400">Add items from a store to start your order.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {cart?.shop && (
            <p className="text-xs text-gray-600 bg-gray-50 p-2 rounded border border-gray-200">
              Store: <strong className="text-gray-900">{cart.shop.name}</strong>
            </p>
          )}

          <div className="max-h-60 overflow-y-auto divide-y divide-gray-100 pr-1">
            {cartItems.map((item) => (
              <div key={item.id} className="py-2 flex justify-between items-center text-xs">
                <div className="flex-1 pr-2">
                  <span className="font-semibold text-gray-900 block truncate">{item.product?.title}</span>
                  <span className="text-gray-500">${item.product?.price.toFixed(2)} each</span>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleUpdateQty(item.id, item.quantity - 1)}
                    className="w-6 h-6 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded font-bold flex items-center justify-center border text-xs"
                  >
                    -
                  </button>
                  <span className="font-bold text-gray-900 w-5 text-center text-xs">{item.quantity}</span>
                  <button
                    type="button"
                    onClick={() => handleUpdateQty(item.id, item.quantity + 1)}
                    className="w-6 h-6 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded font-bold flex items-center justify-center border text-xs"
                  >
                    +
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRemoveItem(item.id)}
                    className="ml-1 text-red-600 hover:text-red-800 text-xs font-bold px-1"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="border-t pt-3 space-y-2">
            <div className="flex justify-between items-center text-xs font-bold">
              <span className="text-gray-700">Subtotal:</span>
              <span className="text-sm text-green-700">${cartTotal.toFixed(2)}</span>
            </div>

            <form onSubmit={handlePlaceOrder} className="space-y-2">
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Delivery Address"
                className="w-full border border-gray-300 rounded p-1.5 text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
                required
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 rounded text-xs transition-colors disabled:opacity-50"
              >
                {loading ? "Placing..." : `Checkout ($${cartTotal.toFixed(2)})`}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
