import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Hyperlocal Marketplace",
  description: "Hyperlocal Marketplace Platform built with Next.js 16 and Prisma",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900 min-h-screen flex flex-col">
        <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
          <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-8">
            <Link href="/" className="font-bold text-lg text-blue-600 flex items-center gap-1.5 shrink-0">
              🛒 Hyperlocal Market
            </Link>

            <div className="flex items-center gap-5 text-sm font-medium">
              <Link href="/" className="text-gray-700 hover:text-blue-600 transition-colors">
                Home
              </Link>
              <Link href="/vendor" className="text-gray-700 hover:text-blue-600 transition-colors">
                Vendor Portal
              </Link>
              <Link href="/customer" className="text-gray-700 hover:text-blue-600 transition-colors">
                Customer Portal
              </Link>
              <Link href="/admin" className="text-gray-700 hover:text-blue-600 transition-colors">
                Admin Portal
              </Link>
            </div>
          </div>
        </nav>

        <main className="flex-1 max-w-6xl w-full mx-auto p-4 md:p-6">{children}</main>

        <footer className="bg-white border-t border-gray-200 py-4 text-center text-xs text-gray-500">
          © {new Date().getFullYear()} Hyperlocal Marketplace Platform
        </footer>
      </body>
    </html>
  );
}
