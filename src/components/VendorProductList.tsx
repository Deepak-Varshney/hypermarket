"use client";

interface Props {
  products: any[];
  onEdit: (product: any) => void;
  onDelete: (productId: number) => void;
}

const DEFAULT_PRODUCT_IMAGE = "https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&auto=format&fit=crop&q=60";

export default function VendorProductList({ products, onEdit, onDelete }: Props) {
  return (
    <div className="border border-gray-200 rounded-lg p-5 bg-white shadow-sm">
      <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">
        Product Catalogue ({products.length})
      </h3>

      {products.length === 0 ? (
        <p className="text-sm text-gray-500 py-4 text-center">No products added to catalogue yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-gray-700">
                <th className="p-3">Image</th>
                <th className="p-3">Title</th>
                <th className="p-3">Price</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {products.map((p) => {
                const imgSrc = p.imageUrl && p.imageUrl.trim() !== "" ? p.imageUrl : DEFAULT_PRODUCT_IMAGE;

                return (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="p-3">
                      <img
                        src={imgSrc}
                        alt={p.title}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = DEFAULT_PRODUCT_IMAGE;
                        }}
                        className="w-12 h-12 object-cover rounded-md bg-gray-100 border border-gray-200"
                      />
                    </td>
                    <td className="p-3 font-medium text-gray-900">{p.title}</td>
                    <td className="p-3 text-gray-800">${p.price.toFixed(2)}</td>
                    <td className="p-3">
                      <span
                        className={`text-xs px-2.5 py-1 rounded-full font-semibold ${
                          p.isAvailable
                            ? "bg-green-100 text-green-800 border border-green-200"
                            : "bg-gray-100 text-gray-800 border border-gray-200"
                        }`}
                      >
                        {p.isAvailable ? "Available" : "Unavailable"}
                      </span>
                    </td>
                    <td className="p-3 text-right space-x-2">
                      <button
                        onClick={() => onEdit(p)}
                        className="bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs px-3 py-1 rounded border border-gray-300 font-medium"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => onDelete(p.id)}
                        className="bg-red-600 hover:bg-red-700 text-white text-xs px-3 py-1 rounded font-medium"
                      >
                        Delete
                      </button>
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
