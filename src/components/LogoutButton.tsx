"use client";

export default function LogoutButton() {
  const handleLogout = async () => {
    await fetch("/api/logout", { method: "POST" });
    window.location.reload();
  };

  return (
    <button
      type="button"
      onClick={handleLogout}
      className="bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 text-xs px-2.5 py-1 rounded font-medium"
    >
      Logout
    </button>
  );
}
