import { SidebarProvider } from "@/components/ui/sidebar";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex-1">
      <SidebarProvider>{children}</SidebarProvider>
    </div>
  );
}
