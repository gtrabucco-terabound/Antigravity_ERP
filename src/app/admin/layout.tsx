import { SidebarProvider, Sidebar, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarFooter, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { LayoutDashboard, Users, Box, CreditCard, ClipboardList, ShieldCheck, LogOut } from "lucide-react";
import Link from "next/link";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const navItems = [
    { name: "Tablero", icon: LayoutDashboard, href: "/admin" },
    { name: "Tenantes", icon: Users, href: "/admin/tenants" },
    { name: "Módulos", icon: Box, href: "/admin/modules" },
    { name: "Planes", icon: CreditCard, href: "/admin/plans" },
    { name: "Auditoría", icon: ClipboardList, href: "/admin/audit" },
  ];

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <Sidebar variant="sidebar" collapsible="icon">
          <SidebarHeader className="border-b border-sidebar-border/50 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary shadow-lg shadow-primary/20">
                <ShieldCheck className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="font-headline font-bold text-lg tracking-tight group-data-[collapsible=icon]:hidden">
                TERABOUND
              </span>
            </div>
          </SidebarHeader>
          <SidebarContent className="p-2">
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.name}>
                  <SidebarMenuButton asChild tooltip={item.name}>
                    <Link href={item.href} className="flex items-center gap-3 px-3 py-2 rounded-md transition-all">
                      <item.icon className="h-5 w-5" />
                      <span className="font-medium">{item.name}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter className="border-t border-sidebar-border/50 p-4">
            <SidebarMenuButton className="text-muted-foreground hover:text-foreground">
              <LogOut className="h-5 w-5" />
              <span className="group-data-[collapsible=icon]:hidden">Cerrar Sesión</span>
            </SidebarMenuButton>
          </SidebarFooter>
        </Sidebar>

        <SidebarInset className="flex flex-col">
          <header className="flex h-16 items-center border-b border-border/50 px-6 justify-between bg-background/50 backdrop-blur-md sticky top-0 z-30">
            <div className="flex items-center gap-4">
              <SidebarTrigger />
              <div className="h-4 w-px bg-border/50" />
              <h2 className="text-sm font-medium text-muted-foreground">Gobernanza de Plataforma</h2>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary">
                <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                <span className="text-xs font-bold uppercase tracking-wider">Modo Admin</span>
              </div>
            </div>
          </header>
          <main className="flex-1 overflow-auto">
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
