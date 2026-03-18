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
  Database,
  Building
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

export default function DashboardPage() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

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
      value: "1,284", 
      subValue: "v.s mes pasado 1,146", 
      trend: "+12%", 
      trendUp: true, 
      icon: Building 
    },
    { 
      label: "TENANTES ACTIVOS", 
      value: "1,142", 
      subValue: "88.9% Tasa de actividad", 
      trend: "+5%", 
      trendUp: true, 
      icon: Zap 
    },
    { 
      label: "SUSCRIPCIONES", 
      value: "943", 
      subValue: "24 Nuevas esta semana", 
      trend: "+8.2%", 
      trendUp: true, 
      icon: CreditCard 
    },
    { 
      label: "INGRESOS TOTALES", 
      value: "$124,500", 
      subValue: "Meta: $150k", 
      trend: "+15%", 
      trendUp: true, 
      icon: DollarSign 
    },
  ];

  const activities = [
    { 
      title: "Acme Corp activó el módulo Global CDN", 
      time: "hace 2 minutos", 
      icon: CheckCircle2, 
      color: "text-primary" 
    },
    { 
      title: "Registro de nuevo tenante: Lumina Systems", 
      time: "hace 45 minutos", 
      icon: Users, 
      color: "text-blue-500" 
    },
    { 
      title: "Alerta de Carga Alta en nodo Cluster: us-east-1a", 
      time: "hace 1 hora", 
      icon: AlertTriangle, 
      color: "text-amber-500" 
    },
    { 
      title: "Renovación de suscripción para CloudScale Inc.", 
      time: "hace 3 horas", 
      icon: CreditCard, 
      color: "text-purple-500" 
    },
    { 
      title: "Backup del sistema completado con éxito", 
      time: "hace 5 horas", 
      icon: RefreshCcw, 
      color: "text-muted-foreground" 
    },
  ];

  if (!isMounted) return null;

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-4xl font-bold tracking-tight">Vista General del Sistema</h1>
          <p className="text-muted-foreground text-lg">Rendimiento de infraestructura y suscripciones en tiempo real.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="h-11 px-6 rounded-xl border-border/50 bg-muted/20 gap-2 hover:bg-muted/40">
            <Download className="h-4 w-4" />
            Exportar CSV
          </Button>
          <Button className="h-11 px-6 rounded-xl bg-primary text-primary-foreground font-bold hover:bg-primary/90 gap-2 shadow-lg shadow-primary/20">
            <Plus className="h-4 w-4" />
            Nuevo Tenante
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <Card key={i} className="border-border/50 bg-card/40 backdrop-blur-sm relative overflow-hidden group hover:border-primary/30 transition-all duration-300">
            <CardHeader className="flex flex-row items-start justify-between pb-2">
              <div className="space-y-1">
                <CardTitle className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.15em]">{stat.label}</CardTitle>
                <div className="text-3xl font-bold tracking-tight">{stat.value}</div>
              </div>
              <div className="p-2.5 rounded-xl bg-muted/30 group-hover:bg-primary/10 transition-colors">
                <stat.icon className="h-5 w-5 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="outline" className={`rounded-md px-1.5 py-0 border-none flex items-center gap-1 ${stat.trendUp ? 'bg-primary/10 text-primary' : 'bg-destructive/10 text-destructive'}`}>
                  {stat.trendUp ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                  <span className="text-[11px] font-bold">{stat.trend}</span>
                </Badge>
                <span className="text-xs text-muted-foreground">{stat.subValue}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 border-border/50 bg-card/40 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="space-y-1">
              <CardTitle className="text-xl font-bold">Resumen de Ingresos</CardTitle>
              <p className="text-sm text-muted-foreground font-medium">Rendimiento de crecimiento en los últimos 30 días</p>
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

        <Card className="border-border/50 bg-card/40 backdrop-blur-sm flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between pb-8">
            <CardTitle className="text-xl font-bold">Actividad Reciente</CardTitle>
            <Button variant="link" className="text-primary font-bold text-xs p-0 h-auto">Ver Todo</Button>
          </CardHeader>
          <CardContent className="flex-1">
            <div className="space-y-8">
              {activities.map((item, i) => (
                <div key={i} className="flex gap-4 group">
                  <div className="flex flex-col items-center">
                    <div className={`p-2 rounded-xl bg-muted/30 group-hover:scale-110 transition-transform ${item.color}`}>
                      <item.icon className="h-4 w-4" />
                    </div>
                    {i !== activities.length - 1 && <div className="w-px h-full bg-border/50 my-2" />}
                  </div>
                  <div className="space-y-1 pb-4">
                    <p className="text-sm font-semibold leading-tight text-foreground/90">{item.title}</p>
                    <p className="text-xs text-muted-foreground font-medium">{item.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/50 bg-card/40 backdrop-blur-sm overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-xl font-bold">Tenantes Activos</CardTitle>
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <input 
              placeholder="Filtrar..." 
              className="w-full pl-9 pr-4 h-9 bg-muted/30 border-none rounded-lg text-xs font-medium focus:ring-1 focus:ring-primary/30"
            />
          </div>
        </CardHeader>
        <div className="p-8 pt-0">
          <div className="text-sm text-muted-foreground italic">
            Visualización detallada de la tabla en desarrollo...
          </div>
        </div>
      </Card>
    </div>
  );
}