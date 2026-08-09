"use client";

import { useState } from "react";

interface Props {
  cart: any;
  cartItems: any[];
  cartTotal: number;
  onUpdateQty: (itemId: number, quantity: number) => void;
  onRemoveItem: (itemId: number) => void;
  onPlaceOrder: (address: string) => void;
}

export default function CartView({
  cart,
  cartItems,
  cartTotal,
  onUpdateQty,
  onRemoveItem,
  onPlaceOrder
}: Props) {
  const [address, setAddress] = useState("");

  return (
    <div className="border border-gray-200 rounded-lg p-5 bg-white shadow-sm">
      <div className="flex justify-between items-center mb-2 border-b pb-2">
        <h3 className="text-lg font-bold text-gray-800">Your Cart</h3>
        {cart?.shop && (
          <span className="text-xs text-gray-500 font-medium">
            Store: <strong className="text-gray-800">{cart.shop.name}</strong>
          </span>
        )}
      </div>

      {cartItems.length === 0 ? (
        <p className="text-sm text-gray-500 py-4 text-center">Cart is currently empty.</p>
      ) : (
        <>
          <div className="overflow-x-auto mb-4">
            <table className="w-full text-sm text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-gray-700">
                  <th className="p-3">Item</th>
                  <th className="p-3">Price</th>
                  <th className="p-3">Quantity</th>
                  <th className="p-3">Total</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {cartItems.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="p-3 font-medium text-gray-900">{item.product?.title}</td>
                    <td className="p-3 text-gray-800">${item.product?.price.toFixed(2)}</td>
                    <td className="p-3 text-gray-900 font-semibold">x{item.quantity}</td>
                    <td className="p-3 text-green-700 font-semibold">${(item.product?.price * item.quantity).toFixed(2)}</td>
                    <td className="p-3 text-right space-x-1">
                      <button
                        onClick={() => onUpdateQty(item.id, item.quantity - 1)}
                        className="bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs px-2 py-1 rounded border border-gray-300 font-bold"
                      >
                        -
                      </button>
                      <button
                        onClick={() => onUpdateQty(item.id, item.quantity + 1)}
                        className="bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs px-2 py-1 rounded border border-gray-300 font-bold"
                      >
                        +
                      </button>
                      <button
                        onClick={() => onRemoveItem(item.id)}
                        className="bg-red-600 hover:bg-red-700 text-white text-xs px-2.5 py-1 rounded font-medium ml-1"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="border-t pt-4 flex flex-col gap-3 max-w-sm">
            <div className="flex justify-between items-center text-sm font-bold">
              <span className="text-gray-700">Grand Total:</span>
              <span className="text-lg text-green-700">${cartTotal.toFixed(2)}</span>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Address</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Enter complete delivery address"
                className="w-full border border-gray-300 rounded-md p-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                required
              />
            </div>

            <button
              onClick={() => onPlaceOrder(address)}
              className="bg-green-600 hover:bg-green-700 text-white text-sm font-bold py-2.5 px-4 rounded-md transition-colors w-full"
            >
              Place Order Now
            </button>
          </div>
        </>
      )}
    </div>
  );
}
