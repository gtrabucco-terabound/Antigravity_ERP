'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { 
  Settings, 
  User, 
  ShieldCheck, 
  Bell, 
  Palette, 
  Globe, 
  Database,
  Lock,
  Save
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function SettingsPage() {
  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="space-y-1">
        <h1 className="text-4xl font-bold tracking-tight">Ajustes del Sistema</h1>
        <p className="text-muted-foreground text-lg">Configure los parámetros globales y preferencias de su entorno.</p>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="bg-muted/20 p-1 rounded-xl mb-8">
          <TabsTrigger value="profile" className="rounded-lg px-6 gap-2">
            <User className="h-4 w-4" />
            Perfil
          </TabsTrigger>
          <TabsTrigger value="security" className="rounded-lg px-6 gap-2">
            <ShieldCheck className="h-4 w-4" />
            Seguridad
          </TabsTrigger>
          <TabsTrigger value="notifications" className="rounded-lg px-6 gap-2">
            <Bell className="h-4 w-4" />
            Notificaciones
          </TabsTrigger>
          <TabsTrigger value="system" className="rounded-lg px-6 gap-2">
            <Settings className="h-4 w-4" />
            Sistema
          </TabsTrigger>
        </TabsList>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <TabsContent value="profile" className="mt-0 space-y-6">
              <Card className="border-border/50 bg-card shadow-xl shadow-black/20">
                <CardHeader>
                  <CardTitle>Información del Administrador</CardTitle>
                  <CardDescription>Actualice sus datos personales y profesionales.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">Nombre</Label>
                      <Input id="firstName" defaultValue="Alex" className="bg-muted/10 border-border" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Apellido</Label>
                      <Input id="lastName" defaultValue="Rivera" className="bg-muted/10 border-border" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Correo Electrónico</Label>
                    <Input id="email" defaultValue="alex.rivera@terabound.com" className="bg-muted/10 border-border" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bio">Reseña Profesional</Label>
                    <Input id="bio" placeholder="Describa su rol..." className="bg-muted/10 border-border" />
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-end">
                <Button className="bg-primary text-primary-foreground font-bold shadow-lg shadow-primary/20 gap-2">
                  <Save className="h-4 w-4" />
                  Guardar Perfil
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="security" className="mt-0 space-y-6">
              <Card className="border-border/50 bg-card shadow-xl shadow-black/20">
                <CardHeader>
                  <CardTitle>Autenticación de Dos Factores (2FA)</CardTitle>
                  <CardDescription>Añada una capa extra de seguridad a su cuenta.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-xl border border-border/50 bg-muted/5">
                    <div className="space-y-0.5">
                      <div className="text-sm font-bold">Estado de 2FA</div>
                      <div className="text-xs text-muted-foreground">Proteja su acceso con una app de autenticación.</div>
                    </div>
                    <Switch checked={true} />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border/50 bg-card shadow-xl shadow-black/20">
                <CardHeader>
                  <CardTitle>Cambiar Contraseña</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentPass">Contraseña Actual</Label>
                    <Input id="currentPass" type="password" underline className="bg-muted/10 border-border" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="newPass">Nueva Contraseña</Label>
                    <Input id="newPass" type="password" underline className="bg-muted/10 border-border" />
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-end">
                <Button className="bg-primary text-primary-foreground font-bold shadow-lg shadow-primary/20 gap-2">
                  <Lock className="h-4 w-4" />
                  Actualizar Seguridad
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="notifications" className="mt-0 space-y-6">
              <Card className="border-border/50 bg-card shadow-xl shadow-black/20">
                <CardHeader>
                  <CardTitle>Preferencias de Alerta</CardTitle>
                  <CardDescription>Elija cómo desea ser notificado sobre eventos críticos.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { title: "Nuevas Suscripciones", desc: "Recibir correo cuando un tenante active un plan." },
                    { title: "Alertas de Infraestructura", desc: "Notificar sobre picos de carga o caídas de nodos." },
                    { title: "Logs de Auditoría", desc: "Recumen diario de acciones administrativas." },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between p-4 rounded-xl border border-border/50 hover:bg-muted/5 transition-colors">
                      <div className="space-y-0.5">
                        <div className="text-sm font-bold">{item.title}</div>
                        <div className="text-xs text-muted-foreground">{item.desc}</div>
                      </div>
                      <Switch defaultChecked={i < 2} />
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>
          </div>

          <div className="space-y-6">
            <Card className="border-border/50 bg-card/50 shadow-xl">
              <CardHeader className="pb-4">
                <CardTitle className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Resumen de Cuenta</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                    <ShieldCheck className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="text-sm font-bold">Nivel de Acceso</div>
                    <div className="text-xs text-muted-foreground">Super Administrador</div>
                  </div>
                </div>
                <div className="pt-4 border-t border-border/30">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-muted-foreground">Último Login</span>
                    <span className="font-bold">Hace 12 min</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Ubicación</span>
                    <span className="font-bold">Argentina (IP: 190.x.x.x)</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-primary/20 bg-primary/5 shadow-xl">
              <CardHeader className="pb-4">
                <CardTitle className="text-sm font-bold uppercase tracking-widest text-primary">Preferencia Visual</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col gap-2">
                  <Label className="text-[10px] font-bold text-muted-foreground">TEMA DEL SISTEMA</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Button variant="outline" className="h-16 flex flex-col gap-1 border-primary/30 bg-primary/5">
                      <Palette className="h-4 w-4 text-primary" />
                      <span className="text-[10px] font-bold">OSCURO</span>
                    </Button>
                    <Button variant="outline" className="h-16 flex flex-col gap-1 opacity-50 cursor-not-allowed" disabled>
                      <Globe className="h-4 w-4" />
                      <span className="text-[10px] font-bold">CLARO</span>
                    </Button>
                  </div>
                </div>
                <p className="text-[10px] text-muted-foreground italic">
                  * El modo claro está deshabilitado por política de diseño corporativo.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </Tabs>
    </div>
  );
}
