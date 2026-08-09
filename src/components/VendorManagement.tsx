"use client";

import { useState } from "react";

interface Props {
  vendors?: any[];
  initialVendors?: any[];
}

export default function VendorManagement({ vendors: passedVendors, initialVendors }: Props) {
  const [vendors, setVendors] = useState<any[]>(passedVendors || initialVendors || []);
  const [msg, setMsg] = useState("");

  const handleStatusChange = async (shopId: number, status: string) => {
    setMsg("");
    try {
      const res = await fetch(`/api/admin/vendors/${shopId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      });

      const data = await res.json();
      if (data.success) {
        setVendors((prev) =>
          prev.map((vendor) => {
            if (vendor.shops && vendor.shops.length > 0 && vendor.shops[0].id === shopId) {
              return { ...vendor, shops: [{ ...vendor.shops[0], status }] };
            }
            return vendor;
          })
        );
        setMsg(`Shop status updated to ${status}`);
      } else {
        setMsg(data.message || "Failed to update shop status");
      }
    } catch {
      setMsg("Error updating shop status");
    }
  };

  return (
    <div className="border border-gray-200 rounded-lg p-5 bg-white shadow-sm">
      <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">
        Registered Vendors ({vendors.length})
      </h3>

      {msg && <div className="p-3 mb-4 text-sm bg-blue-50 text-blue-700 border border-blue-200 rounded-md">{msg}</div>}

      {vendors.length === 0 ? (
        <p className="text-sm text-gray-500 py-4 text-center">No vendors registered yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-gray-700">
                <th className="p-3">ID</th>
                <th className="p-3">Vendor Name</th>
                <th className="p-3">Email</th>
                <th className="p-3">Shop Name</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {vendors.map((vendor) => {
                const shop = vendor.shops && vendor.shops.length > 0 ? vendor.shops[0] : null;
                const statusColor =
                  shop?.status === "APPROVED"
                    ? "bg-green-100 text-green-800 border-green-200"
                    : shop?.status === "REJECTED"
                    ? "bg-red-100 text-red-800 border-red-200"
                    : shop?.status === "DISABLED"
                    ? "bg-gray-200 text-gray-800 border-gray-300"
                    : "bg-yellow-100 text-yellow-800 border-yellow-200";

                return (
                  <tr key={vendor.id} className="hover:bg-gray-50">
                    <td className="p-3 font-medium text-gray-900">#{vendor.id}</td>
                    <td className="p-3 font-medium text-gray-800">{vendor.name}</td>
                    <td className="p-3 text-gray-600">{vendor.email}</td>
                    <td className="p-3 font-semibold text-gray-900">{shop ? shop.name : "No Shop"}</td>
                    <td className="p-3">
                      {shop ? (
                        <span className={`text-xs px-2.5 py-1 rounded-full font-semibold border ${statusColor}`}>
                          {shop.status}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400 font-medium">NO SHOP</span>
                      )}
                    </td>
                    <td className="p-3 text-right">
                      {shop ? (
                        <div className="flex justify-end gap-1.5">
                          <button
                            onClick={() => handleStatusChange(shop.id, "APPROVED")}
                            className="bg-green-600 hover:bg-green-700 text-white text-xs px-2.5 py-1 rounded font-medium"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleStatusChange(shop.id, "REJECTED")}
                            className="bg-yellow-600 hover:bg-yellow-700 text-white text-xs px-2.5 py-1 rounded font-medium"
                          >
                            Reject
                          </button>
                          <button
                            onClick={() => handleStatusChange(shop.id, "DISABLED")}
                            className="bg-red-600 hover:bg-red-700 text-white text-xs px-2.5 py-1 rounded font-medium"
                          >
                            Disable
                          </button>
                        </div>
                      ) : (
                        "-"
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
