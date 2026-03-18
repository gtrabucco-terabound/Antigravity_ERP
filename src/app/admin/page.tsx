
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  Zap, 
  CreditCard, 
  DollarSign, 
  ArrowUpRight, 
  ArrowDownRight, 
  Activity, 
  Download, 
  Plus, 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCcw, 
  Building,
  Search,
  MoreHorizontal
} from "lucide-react";
import { 
  Area, 
  AreaChart, 
  ResponsiveContainer, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip 
} from "recharts";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useFirestore } from '@/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

export default function DashboardPage() {
  const [isMounted, setIsMounted] = useState(false);
  const [statsValue, setStatsValue] = useState<string[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const firestore = useFirestore();
  const { toast } = useToast();

  useEffect(() => {
    setIsMounted(true);
    setStatsValue(["1,284", "1,142", "943", "$124,500"]);
  }, []);

  async function handleCreateTenant(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!firestore) return;

    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    const tenantData = {
      name: formData.get('name') as string,
      country: formData.get('country') as string,
      planId: formData.get('planId') as string,
      status: 'active',
      activeModules: [],
      createdAt: serverTimestamp(),
    };

    try {
      const tenantsRef = collection(firestore, '_gl_tenants');
      addDoc(tenantsRef, tenantData)
        .then(() => {
          setIsDialogOpen(false);
          toast({
            title: "Tenante Creado",
            description: `El tenante ${tenantData.name} ha sido provisionado correctamente.`,
          });
        })
        .catch(async (error) => {
          const permissionError = new FirestorePermissionError({
            path: tenantsRef.path,
            operation: 'create',
            requestResourceData: tenantData,
          });
          errorEmitter.emit('permission-error', permissionError);
        })
        .finally(() => {
          setIsSubmitting(false);
        });
    } catch (error) {
      setIsSubmitting(false);
    }
  }

  const revenueData = [
    { date: '01 May', revenue: 45000 },
    { date: '04 May', revenue: 52000 },
    { date: '08 May', revenue: 68000 },
    { date: '12 May', revenue: 65000 },
    { date: '15 May', revenue: 82000 },
    { date: '19 May', revenue: 78000 },
    { date: '22 May', revenue: 95000 },
    { date: '26 May', revenue: 89000 },
    { date: '29 May', revenue: 112000 },
  ];

  const stats = [
    { 
      label: "TOTAL DE TENANTES", 
      value: statsValue[0] || "...", 
      subValue: "v.s mes pasado 1,146", 
      trend: "+12%", 
      trendUp: true, 
      icon: Building,
      iconBg: "bg-primary/10",
      iconColor: "text-primary"
    },
    { 
      label: "TENANTES ACTIVOS", 
      value: statsValue[1] || "...", 
      subValue: "88.9% Tasa de actividad", 
      trend: "+5%", 
      trendUp: true, 
      icon: Zap,
      iconBg: "bg-blue-500/10",
      iconColor: "text-blue-500"
    },
    { 
      label: "SUSCRIPCIONES", 
      value: statsValue[2] || "...", 
      subValue: "24 Nuevas esta semana", 
      trend: "+8.2%", 
      trendUp: true, 
      icon: CreditCard,
      iconBg: "bg-amber-500/10",
      iconColor: "text-amber-500"
    },
    { 
      label: "INGRESOS TOTALES", 
      value: statsValue[3] || "...", 
      subValue: "Meta: $150k", 
      trend: "+15%", 
      trendUp: true, 
      icon: DollarSign,
      iconBg: "bg-emerald-500/10",
      iconColor: "text-emerald-500"
    },
  ];

  const activities = [
    { 
      title: "Acme Corp activó el módulo Global CDN", 
      time: "hace 2 minutos", 
      icon: CheckCircle2, 
      color: "text-primary",
      bg: "bg-primary/10"
    },
    { 
      title: "Registro de nuevo tenante: Lumina Systems", 
      time: "hace 45 minutos", 
      icon: Users, 
      color: "text-blue-500",
      bg: "bg-blue-500/10"
    },
    { 
      title: "Alerta de Carga Alta en nodo Cluster: us-east-1a", 
      time: "hace 1 hora", 
      icon: AlertTriangle, 
      color: "text-amber-500",
      bg: "bg-amber-500/10"
    },
    { 
      title: "Renovación de suscripción para CloudScale Inc.", 
      time: "hace 3 horas", 
      icon: CreditCard, 
      color: "text-purple-500",
      bg: "bg-purple-500/10"
    },
    { 
      title: "Backup del sistema completado con éxito", 
      time: "hace 5 horas", 
      icon: RefreshCcw, 
      color: "text-muted-foreground",
      bg: "bg-muted/20"
    },
  ];

  if (!isMounted) return null;

  return (
    <div className="space-y-8 animate-in fade-in duration-700 max-w-[1600px] mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-4xl font-bold tracking-tight text-foreground">Vista General del Sistema</h1>
          <p className="text-muted-foreground text-lg">Rendimiento de infraestructura y suscripciones en tiempo real.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="h-10 px-5 rounded-lg border-border bg-card/50 gap-2 hover:bg-card">
            <Download className="h-4 w-4" />
            Exportar CSV
          </Button>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="h-10 px-5 rounded-lg bg-primary text-primary-foreground font-bold hover:bg-primary/90 gap-2 shadow-lg shadow-primary/20">
                <Plus className="h-4 w-4" />
                Nuevo Tenante
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] bg-card border-border shadow-2xl">
              <form onSubmit={handleCreateTenant}>
                <DialogHeader>
                  <DialogTitle className="text-primary">Provisionar Nuevo Tenante</DialogTitle>
                  <DialogDescription>
                    Complete la información para registrar una nueva organización en la plataforma.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Nombre de la Empresa</Label>
                    <Input id="name" name="name" placeholder="Ej. Acme Corp" className="bg-muted/30 border-border" required />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="country">País</Label>
                    <Input id="country" name="country" placeholder="Ej. México" className="bg-muted/30 border-border" required />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="planId">Plan Inicial</Label>
                    <Select name="planId" defaultValue="plan_starter" required>
                      <SelectTrigger className="bg-muted/30 border-border">
                        <SelectValue placeholder="Seleccione un plan" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="plan_starter">Inicial ($49/mes)</SelectItem>
                        <SelectItem value="plan_business">Negocios ($199/mes)</SelectItem>
                        <SelectItem value="plan_enterprise">Corporativo ($999/mes)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isSubmitting}>
                    Cancelar
                  </Button>
                  <Button type="submit" className="bg-primary text-primary-foreground font-bold" disabled={isSubmitting}>
                    {isSubmitting ? "Provisionando..." : "Crear Tenante"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <Card key={i} className="border-border/50 bg-card hover:border-primary/30 transition-all duration-300 shadow-xl shadow-black/20">
            <CardHeader className="flex flex-row items-start justify-between pb-2">
              <div className="space-y-1">
                <CardTitle className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.15em]">{stat.label}</CardTitle>
                <div className="text-3xl font-bold tracking-tight mt-2">{stat.value}</div>
              </div>
              <div className={`p-2 rounded-lg ${stat.iconBg}`}>
                <stat.icon className={`h-5 w-5 ${stat.iconColor}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 mt-2">
                <div className={`flex items-center gap-1 text-[11px] font-bold ${stat.trendUp ? 'text-primary' : 'text-destructive'}`}>
                  {stat.trendUp ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                  <span>{stat.trend}</span>
                </div>
                <span className="text-[11px] text-muted-foreground">{stat.subValue}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 border-border/50 bg-card shadow-xl shadow-black/20">
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="space-y-1">
              <CardTitle className="text-xl font-bold">Resumen de Ingresos</CardTitle>
              <p className="text-sm text-muted-foreground">Crecimiento de ingresos en el periodo seleccionado</p>
            </div>
            <Select defaultValue="30">
              <SelectTrigger className="w-[140px] h-9 bg-muted/30 border-none rounded-lg text-xs font-semibold">
                <SelectValue placeholder="Periodo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Últimos 7 días</SelectItem>
                <SelectItem value="30">Últimos 30 días</SelectItem>
                <SelectItem value="90">Últimos 90 días</SelectItem>
              </SelectContent>
            </Select>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueData}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted)/0.1)" />
                  <XAxis 
                    dataKey="date" 
                    stroke="hsl(var(--muted-foreground)/0.5)" 
                    fontSize={11} 
                    tickLine={false} 
                    axisLine={false} 
                    dy={10}
                  />
                  <YAxis 
                    stroke="hsl(var(--muted-foreground)/0.5)" 
                    fontSize={11} 
                    tickLine={false} 
                    axisLine={false} 
                    tickFormatter={(value) => `$${value/1000}k`}
                    dx={-10}
                  />
                  <RechartsTooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      borderColor: 'hsl(var(--border))', 
                      borderRadius: '12px',
                      fontSize: '12px',
                      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)'
                    }}
                    itemStyle={{ color: 'hsl(var(--primary))' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorRevenue)" 
                    dot={{ r: 4, fill: 'hsl(var(--primary))', strokeWidth: 0 }}
                    activeDot={{ r: 6, strokeWidth: 0 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-3 gap-8 mt-10 pt-8 border-t border-border/50">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">VENTA PROMEDIO</span>
                <div className="text-2xl font-bold tracking-tight">$132.50</div>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">RETENCIÓN</span>
                <div className="text-2xl font-bold tracking-tight">94.2%</div>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">TASA DE REEMBOLSO</span>
                <div className="text-2xl font-bold tracking-tight">1.2%</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card shadow-xl shadow-black/20 flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between pb-8">
            <CardTitle className="text-xl font-bold">Actividad Reciente</CardTitle>
            <Button variant="link" className="text-primary font-bold text-xs p-0 h-auto">Ver Todo</Button>
          </CardHeader>
          <CardContent className="flex-1">
            <div className="space-y-8 relative before:absolute before:left-[17px] before:top-2 before:bottom-2 before:w-px before:bg-border/50">
              {activities.map((item, i) => (
                <div key={i} className="flex gap-4 group relative">
                  <div className={`z-10 p-2 rounded-full border border-background shadow-sm ${item.bg} ${item.color}`}>
                    <item.icon className="h-4 w-4" />
                  </div>
                  <div className="space-y-1 pb-4">
                    <p className="text-sm font-semibold leading-tight text-foreground/90">{item.title}</p>
                    <p className="text-[11px] text-muted-foreground font-medium">{item.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/50 bg-card shadow-xl shadow-black/20 overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-xl font-bold">Tenantes Activos</CardTitle>
          <div className="flex items-center gap-4">
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <input 
                placeholder="Filtrar tenantes..." 
                className="w-full pl-9 pr-4 h-9 bg-muted/30 border-none rounded-lg text-xs font-medium focus:ring-1 focus:ring-primary/30"
              />
            </div>
            <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <div className="p-8 pt-0 min-h-[100px] flex items-center justify-center border-t border-border/30">
          <div className="text-sm text-muted-foreground italic flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Vista de tabla de tenantes en fase de implementación...
          </div>
        </div>
      </Card>
    </div>
  );
}
