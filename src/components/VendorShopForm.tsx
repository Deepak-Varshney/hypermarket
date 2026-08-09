"use client";

import { useState } from "react";

interface Props {
  initialShop: any;
  onShopSaved?: (shop: any) => void;
}

export default function VendorShopForm({ initialShop, onShopSaved }: Props) {
  const [shopName, setShopName] = useState(initialShop?.name || "");
  const [shopAddress, setShopAddress] = useState(initialShop?.address || "");
  const [lat, setLat] = useState(initialShop ? String(initialShop.latitude) : "");
  const [lng, setLng] = useState(initialShop ? String(initialShop.longitude) : "");
  const [description, setDescription] = useState(initialShop?.description || "");
  const [status, setStatus] = useState(initialShop?.status || null);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [locating, setLocating] = useState(false);

  const handleLocateMe = () => {
    setLocating(true);
    setMsg("");

    if (typeof window !== "undefined" && "geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLat(String(pos.coords.latitude));
          setLng(String(pos.coords.longitude));
          setLocating(false);
          setMsg("Location auto-detected successfully!");
        },
        async () => {
          await fallbackIpLocation();
        },
        { timeout: 5000 }
      );
    } else {
      fallbackIpLocation();
    }
  };

  const fallbackIpLocation = async () => {
    try {
      const res = await fetch("https://ipapi.co/json/");
      const data = await res.json();
      if (data.latitude && data.longitude) {
        setLat(String(data.latitude));
        setLng(String(data.longitude));
        setMsg("Location detected via IP.");
      }
    } catch {
      setMsg("Failed to detect location automatically.");
    } finally {
      setLocating(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg("");
    setLoading(true);

    try {
      const res = await fetch("/api/vendor/shop", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: shopName,
          address: shopAddress,
          latitude: parseFloat(lat),
          longitude: parseFloat(lng),
          description
        })
      });

      const data = await res.json();
      if (data.success) {
        setStatus(data.data.status);
        setMsg("Shop details saved successfully.");
        if (onShopSaved) onShopSaved(data.data);
      } else {
        setMsg(data.message || "Failed to save shop.");
      }
    } catch {
      setMsg("Error saving shop details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="border border-gray-200 rounded-lg p-5 bg-white shadow-sm">
      <div className="flex justify-between items-center mb-4 border-b pb-3">
        <h3 className="text-lg font-bold text-gray-800">Shop Configuration</h3>
        {status && (
          <span className="text-xs font-semibold px-2.5 py-1 rounded bg-yellow-100 text-yellow-800 border border-yellow-200">
            {status}
          </span>
        )}
      </div>

      {msg && <div className="p-3 mb-4 text-sm bg-blue-50 text-blue-700 rounded-md border border-blue-200">{msg}</div>}

      <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Shop Name</label>
          <input
            type="text"
            value={shopName}
            onChange={(e) => setShopName(e.target.value)}
            placeholder="Store Name"
            className="w-full border border-gray-300 rounded-md p-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
          <input
            type="text"
            value={shopAddress}
            onChange={(e) => setShopAddress(e.target.value)}
            placeholder="123 Main Street"
            className="w-full border border-gray-300 rounded-md p-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            required
          />
        </div>

        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="block text-sm font-medium text-gray-700">Shop Coordinates</label>
            <button
              type="button"
              onClick={handleLocateMe}
              disabled={locating}
              className="text-xs text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1 disabled:opacity-50"
            >
              {locating ? "Locating..." : "📍 Auto-Detect My Location"}
            </button>
          </div>

          <div className="flex gap-3">
            <div className="flex-1">
              <label className="block text-xs text-gray-500 mb-1">Latitude</label>
              <input
                type="number"
                step="any"
                value={lat}
                onChange={(e) => setLat(e.target.value)}
                placeholder="28.6139"
                className="w-full border border-gray-300 rounded-md p-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                required
              />
            </div>
            <div className="flex-1">
              <label className="block text-xs text-gray-500 mb-1">Longitude</label>
              <input
                type="number"
                step="any"
                value={lng}
                onChange={(e) => setLng(e.target.value)}
                placeholder="77.2090"
                className="w-full border border-gray-300 rounded-md p-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                required
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description (Optional)</label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Groceries & Daily Essentials"
            className="w-full border border-gray-300 rounded-md p-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 px-4 rounded-md transition-colors disabled:opacity-50"
        >
          {loading ? "Saving..." : initialShop ? "Update Shop Details" : "Create Shop"}
        </button>
      </form>
    </div>
  );
}
