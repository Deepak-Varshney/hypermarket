import { getProfile } from "@/src/app/api/profile/route";
import Link from "next/link";
import LogoutButton from "@/src/components/LogoutButton";
import SideCartPanel from "@/src/components/SideCartPanel";

export default async function CustomerLayout({ children }: { children: React.ReactNode }) {
  const user = await getProfile();
  const customerUser = user?.role === "CUSTOMER" ? user : null;

  return (
    <div>
      <div className="flex justify-between items-center border-b pb-3 mb-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Customer Portal</h1>
          <p className="text-xs text-gray-500">Discover stores, browse products, and place orders</p>
        </div>
        {customerUser && (
          <div className="flex items-center gap-3">
            <div className="text-right text-xs">
              <p className="font-semibold text-gray-800">{customerUser.name}</p>
              <p className="text-gray-500">{customerUser.email}</p>
            </div>
            <LogoutButton />
          </div>
        )}
      </div>

      {customerUser ? (
        <>
          <div className="flex gap-4 border-b pb-2 mb-6 text-sm font-medium text-gray-600">
            <Link href="/customer" className="hover:text-blue-600">
              🏬 Nearby Stores
            </Link>
            <Link href="/customer/cart" className="hover:text-blue-600">
              🛒 Full Cart & Checkout
            </Link>
            <Link href="/customer/orders" className="hover:text-blue-600">
              📦 Order History
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">{children}</div>
            <div className="md:col-span-1">
              <SideCartPanel />
            </div>
          </div>
        </>
      ) : (
        children
      )}
    </div>
  );
}
