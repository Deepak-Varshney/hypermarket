import { getProfile } from "@/src/app/api/profile/route";
import LogoutButton from "@/src/components/LogoutButton";

export default async function VendorLayout({ children }: { children: React.ReactNode }) {
  const user = await getProfile();
  const vendorUser = user?.role === "VENDOR" ? user : null;

  return (
    <div>
      <div className="flex justify-between items-center border-b pb-3 mb-6">
        <div>
          <h1 className="text-xl font-bold">Vendor Dashboard</h1>
          <p className="text-xs text-gray-500">Manage your grocery store and product catalogue</p>
        </div>
        {vendorUser && (
          <div className="flex items-center gap-3">
            <div className="text-right text-xs">
              <p className="font-semibold text-gray-800">{vendorUser.name}</p>
              <p className="text-gray-500">{vendorUser.email}</p>
            </div>
            <LogoutButton />
          </div>
        )}
      </div>

      {children}
    </div>
  );
}
