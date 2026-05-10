import { BottomNav } from "@/components/consumer/bottom-nav";

export default function ConsumerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-black text-white selection:bg-blue-500/30">
      <div className="relative min-h-screen">
        {children}
        <BottomNav />
      </div>
    </div>
  );
}
