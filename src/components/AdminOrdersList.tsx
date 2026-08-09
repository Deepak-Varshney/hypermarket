"use client";

interface Props {
  orders: any[];
}

export default function AdminOrdersList({ orders }: Props) {
  return (
    <div className="border border-gray-200 rounded-lg p-5 bg-white shadow-sm">
      <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">
        Platform System Orders ({orders.length})
      </h3>

      {orders.length === 0 ? (
        <p className="text-sm text-gray-500 py-4 text-center">No customer orders placed yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-gray-700">
                <th className="p-3">Order #</th>
                <th className="p-3">Customer</th>
                <th className="p-3">Store Name</th>
                <th className="p-3">Total Amount</th>
                <th className="p-3">Status</th>
                <th className="p-3">Delivery Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {orders.map((o) => (
                <tr key={o.id} className="hover:bg-gray-50">
                  <td className="p-3 font-medium text-gray-900">#{o.id}</td>
                  <td className="p-3 font-medium text-gray-800">
                    {o.customer?.name} <span className="text-xs text-gray-500">({o.customer?.email})</span>
                  </td>
                  <td className="p-3 font-semibold text-gray-900">{o.shop?.name}</td>
                  <td className="p-3 text-green-700 font-semibold">${o.totalAmount.toFixed(2)}</td>
                  <td className="p-3">
                    <span className="text-xs px-2.5 py-1 rounded-full bg-green-100 text-green-800 font-semibold border border-green-200">
                      {o.status}
                    </span>
                  </td>
                  <td className="p-3 text-gray-600">{o.deliveryAddress}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
