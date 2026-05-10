import { Header } from "@/components/consumer/header";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import {
  User,
  Shield,
  FileText,
  HelpCircle,
  LogOut,
  ChevronRight,
  Crown,
} from "lucide-react";
import Link from "next/link";

export default async function ProfilePage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const user = session?.user;

  const menuItems = [
    { label: "Help & Support", icon: HelpCircle, href: "/help" },
    { label: "Privacy Policy", icon: Shield, href: "/privacy" },
    { label: "Terms of Service", icon: FileText, href: "/terms" },
  ];

  return (
    <main className="min-h-screen bg-black text-white pb-24">
      <Header />

      <div className="p-6">
        {/* User Card */}
        <div className="flex items-center gap-4 mb-10 p-6 bg-white/5 border border-white/10 rounded-[32px] relative overflow-hidden">
          <div className="w-16 h-16 rounded-full bg-blue-500 flex items-center justify-center text-2xl font-black">
            {user?.name?.charAt(0) || "U"}
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold">{user?.name || "Guest User"}</h2>
            <p className="text-sm text-gray-500">{user?.email}</p>
            {user?.plan === "paid" && (
              <div className="flex items-center gap-1 mt-1 text-yellow-500 font-bold text-[10px] uppercase tracking-widest">
                <Crown className="h-3 w-3" />
                Premium Member
              </div>
            )}
          </div>

          {user?.plan !== "paid" && (
            <Link
              href="/upgrade"
              className="absolute top-4 right-4 bg-yellow-500 text-black px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter"
            >
              UPGRADE
            </Link>
          )}
        </div>

        {/* Menu Items */}
        <div className="space-y-2">
          {menuItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="flex items-center gap-4 p-5 hover:bg-white/5 rounded-2xl transition-colors group"
            >
              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
                <item.icon className="h-5 w-5 text-gray-400 group-hover:text-white transition-colors" />
              </div>
              <span className="flex-1 font-bold text-gray-200">
                {item.label}
              </span>
              <ChevronRight className="h-5 w-5 text-gray-700" />
            </Link>
          ))}
        </div>

        <div className="mt-10 pt-10 border-t border-white/5">
          <button className="flex items-center gap-4 p-5 w-full hover:bg-red-500/5 rounded-2xl transition-colors group text-red-500">
            <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center">
              <LogOut className="h-5 w-5" />
            </div>
            <span className="flex-1 font-bold text-left">Logout</span>
          </button>
        </div>

        <p className="text-center text-gray-600 text-[10px] mt-10 uppercase tracking-widest">
          AI Seekho v1.0.0
        </p>
      </div>
    </main>
  );
}
