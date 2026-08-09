import Link from "next/link";

export default function Home() {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="text-center py-8 border-b mb-8">
        <h1 className="text-3xl font-bold mb-2">Hyperlocal Marketplace Platform</h1>
        <p className="text-gray-600 text-sm">
          Discover local grocery stores, manage product catalogues, and place orders.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="border border-gray-300 rounded p-6 bg-white flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-semibold mb-2">Vendor Portal</h3>
            <p className="text-sm text-gray-600 mb-4">
              Register grocery store, configure location, and manage product catalogue.
            </p>
          </div>
          <Link
            href="/vendor"
            className="bg-blue-600 text-white text-sm font-medium py-2 px-4 rounded text-center block hover:bg-blue-700"
          >
            Vendor Portal
          </Link>
        </div>

        <div className="border border-gray-300 rounded p-6 bg-white flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-semibold mb-2">Customer Portal</h3>
            <p className="text-sm text-gray-600 mb-4">
              Find nearby stores, browse available products, manage cart, and place orders.
            </p>
          </div>
          <Link
            href="/customer"
            className="bg-green-600 text-white text-sm font-medium py-2 px-4 rounded text-center block hover:bg-green-700"
          >
            Customer Portal
          </Link>
        </div>

        <div className="border border-gray-300 rounded p-6 bg-white flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-semibold mb-2">Admin Portal</h3>
            <p className="text-sm text-gray-600 mb-4">
              Governance oversight: Approve/reject vendor registrations and view all orders.
            </p>
          </div>
          <Link
            href="/admin"
            className="bg-gray-800 text-white text-sm font-medium py-2 px-4 rounded text-center block hover:bg-gray-900"
          >
            Admin Portal
          </Link>
        </div>
      </div>
    </div>
  );
}
