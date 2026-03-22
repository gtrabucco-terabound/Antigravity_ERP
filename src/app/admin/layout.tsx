'use client';

import { SidebarProvider, Sidebar, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarFooter, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { LayoutDashboard, Users, Box, CreditCard, Banknote, Settings, ClipboardList, Bell, HelpCircle, LogOut, Search } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  const mainMenu = [
    { name: "Tablero", icon: LayoutDashboard, href: "/admin", exact: true },
    { name: "Empresas", icon: Users, href: "/admin/tenants" },
    { name: "Módulos", icon: Box, href: "/admin/modules" },
    { name: "Planes", icon: CreditCard, href: "/admin/plans" },
    { name: "Suscripciones", icon: Banknote, href: "/admin/subscriptions" },
  ];

  const systemMenu = [
    { name: "Ajustes", icon: Settings, href: "/admin/settings" },
    { name: "Logs de Auditoría", icon: ClipboardList, href: "/admin/audit" },
  ];

  const isActive = (href: string, exact: boolean = false) => {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background text-foreground">
        <Sidebar variant="sidebar" className="border-r border-border/50 bg-sidebar">
          <SidebarHeader className="p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary shadow-lg shadow-primary/20">
                <Box className="h-6 w-6 text-primary-foreground" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-lg leading-none tracking-tight">TERABOUND</span>
                <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest mt-1">BACKEN ADMIN</span>
              </div>
            </div>
          </SidebarHeader>
          <SidebarContent className="px-4 py-2">
            <div className="mb-6">
              <h3 className="px-4 mb-4 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/50">Menú Principal</h3>
              <SidebarMenu>
                {mainMenu.map((item) => {
                  const active = isActive(item.href, item.exact);
                  return (
                    <SidebarMenuItem key={item.name}>
                      <SidebarMenuButton 
                        asChild 
                        tooltip={item.name} 
                        className={`h-11 rounded-lg transition-all duration-200 ${active ? 'bg-primary text-primary-foreground font-bold shadow-lg shadow-primary/10' : 'hover:bg-sidebar-accent'}`}
                      >
                        <Link href={item.href} className="flex items-center gap-3">
                          <item.icon className={`h-5 w-5 ${active ? 'text-primary-foreground' : 'text-muted-foreground'}`} />
                          <span>{item.name}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </div>
            <div>
              <h3 className="px-4 mb-4 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/50">Sistema</h3>
              <SidebarMenu>
                {systemMenu.map((item) => {
                  const active = isActive(item.href);
                  return (
                    <SidebarMenuItem key={item.name}>
                      <SidebarMenuButton 
                        asChild 
                        tooltip={item.name} 
                        className={`h-11 rounded-lg transition-all duration-200 ${active ? 'bg-primary text-primary-foreground font-bold shadow-lg shadow-primary/10' : 'hover:bg-sidebar-accent'}`}
                      >
                        <Link href={item.href} className="flex items-center gap-3">
                          <item.icon className={`h-5 w-5 ${active ? 'text-primary-foreground' : 'text-muted-foreground'}`} />
                          <span>{item.name}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </div>
          </SidebarContent>
          <SidebarFooter className="p-6 mt-auto border-t border-border/50">
            <div className="flex items-center justify-between w-full group-data-[collapsible=icon]:hidden">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10 border border-border">
                  <AvatarImage src="https://picsum.photos/seed/alex/100/100" />
                  <AvatarFallback>AR</AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <span className="text-sm font-bold">Alex Rivera</span>
                  <span className="text-[10px] text-muted-foreground">Admin del Sistema</span>
                </div>
              </div>
              <button className="text-muted-foreground hover:text-foreground transition-colors p-1 hover:bg-muted rounded-md">
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </SidebarFooter>
        </Sidebar>

        <SidebarInset className="bg-background">
          <header className="flex h-20 items-center border-b border-border/50 px-8 justify-between sticky top-0 z-30 bg-background/80 backdrop-blur-xl">
            <div className="flex items-center gap-6 flex-1 max-w-2xl">
              <SidebarTrigger className="text-muted-foreground hover:text-primary transition-colors" />
              <div className="relative w-full group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input 
                  placeholder="Buscar sistemas, empresas o datos de ingresos..." 
                  className="pl-12 bg-muted/20 border-border h-11 rounded-xl focus-visible:ring-1 focus-visible:ring-primary/30 transition-all"
                />
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <button className="relative p-2.5 rounded-xl hover:bg-muted transition-colors text-muted-foreground">
                  <Bell className="h-5 w-5" />
                  <span className="absolute top-2 right-2 h-2.5 w-2.5 bg-primary border-2 border-background rounded-full" />
                </button>
                <button className="p-2.5 rounded-xl hover:bg-muted transition-colors text-muted-foreground">
                  <HelpCircle className="h-5 w-5" />
                </button>
              </div>
              <div className="h-8 w-px bg-border mx-2" />
              <div className="flex flex-col items-end">
                <span className="text-[11px] font-bold uppercase tracking-widest text-foreground/80">Producción</span>
                <div className="flex items-center gap-2 mt-0.5">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                  <span className="text-[10px] font-bold text-primary uppercase tracking-wider">SALUDABLE</span>
                </div>
              </div>
            </div>
          </header>
          <main className="p-8">
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}