import { getProfile } from "@/src/app/api/profile/route";
import LogoutButton from "@/src/components/LogoutButton";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getProfile();
  const adminUser = user?.role === "ADMIN" ? user : null;

  return (
    <div>
      <div className="flex justify-between items-center border-b pb-3 mb-6">
        <div>
          <h1 className="text-xl font-bold">Admin Governance Portal</h1>
          <p className="text-xs text-gray-500">Approve vendor registrations and oversee platform orders</p>
        </div>
        {adminUser && (
          <div className="flex items-center gap-3">
            <div className="text-right text-xs">
              <p className="font-semibold text-gray-800">{adminUser.name}</p>
              <p className="text-gray-500">{adminUser.email}</p>
            </div>
            <LogoutButton />
          </div>
        )}
      </div>

      {children}
    </div>
  );
}
