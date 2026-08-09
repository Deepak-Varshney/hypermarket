"use client";

import Link from "next/link";

interface Props {
  shops: any[];
}

export default function ShopList({ shops }: Props) {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center pb-2 border-b">
        <h3 className="text-xl font-bold text-gray-800">Nearby Stores</h3>
        <span className="text-xs text-gray-500 font-medium">Auto-Sorted by Distance</span>
      </div>

      {shops.length === 0 ? (
        <div className="border border-gray-200 rounded-lg p-8 text-center bg-white">
          <p className="text-sm text-gray-500">No approved stores found nearby.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {shops.map((s) => (
            <div
              key={s.id}
              className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-start mb-2">
                  <span className="text-2xl">🏪</span>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
                    📍 {s.distanceKm} km away
                  </span>
                </div>
                <h4 className="font-bold text-gray-900 text-lg mb-1">{s.name}</h4>
                <p className="text-xs text-gray-600 mb-2">📍 {s.address}</p>
                {s.description && (
                  <p className="text-xs text-gray-500 line-clamp-2 mb-4">{s.description}</p>
                )}
              </div>

              <Link
                href={`/customer/shops/${s.id}`}
                className="w-full text-center bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2.5 px-4 rounded-lg transition-colors inline-block mt-3"
              >
                Visit Store →
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
