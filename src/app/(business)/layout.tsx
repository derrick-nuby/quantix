import { AppSidebar } from "@/components/AppSidebar";
import { TopBar } from "@/components/top-bar";

export default function BusinessLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex h-screen bg-background">
      <AppSidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <TopBar />
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}

