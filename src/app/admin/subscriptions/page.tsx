'use client';

import { useState, useMemo } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { 
  Search, 
  Plus, 
  MoreVertical, 
  CreditCard, 
  CheckCircle2, 
  AlertCircle, 
  Clock,
  ExternalLink,
  ChevronRight,
  Loader2,
  Filter
} from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger, 
  DropdownMenuSeparator 
} from "@/components/ui/dropdown-menu";
import { useFirestore, useCollection } from '@/firebase';
import { collection } from 'firebase/firestore';
import { SubscriptionDialog } from '@/components/admin/SubscriptionDialog';

interface Subscription {
  id: string;
  tenantId: string;
  tenantName?: string;
  planId: string;
  status: 'active' | 'past_due' | 'canceled' | 'trialing';
  amount: number;
  nextBilling: string;
  billingCycle: 'monthly' | 'yearly';
  createdAt: string;
}

interface Tenant {
  id: string;
  name: string;
}

export default function SubscriptionsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const firestore = useFirestore();

  // Consulta de suscripciones
  const subsQuery = useMemo(() => collection(firestore, '_gl_subscriptions'), [firestore]);
  const { data: subscriptions, loading: loadingSubs } = useCollection<Subscription>(subsQuery);

  // Consulta de tenantes para mapear nombres
  const tenantsQuery = useMemo(() => collection(firestore, '_gl_tenants'), [firestore]);
  const { data: tenants } = useCollection<Tenant>(tenantsQuery);

  // Mapeo de nombres de tenantes
  const enrichedSubscriptions = useMemo(() => {
    return subscriptions.map(sub => ({
      ...sub,
      tenantName: tenants.find(t => t.id === sub.tenantId)?.name || 'Tenante Desconocido'
    }));
  }, [subscriptions, tenants]);

  // Filtrado
  const filteredSubs = useMemo(() => {
    return enrichedSubscriptions.filter(s => 
      s.tenantName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.planId.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [enrichedSubscriptions, searchTerm]);

  const stats = useMemo(() => ({
    total: subscriptions.length,
    active: subscriptions.filter(s => s.status === 'active').length,
    revenue: subscriptions.reduce((acc, curr) => acc + (curr.status === 'active' ? curr.amount : 0), 0)
  }), [subscriptions]);

  const getStatusBadge = (status: Subscription['status']) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-primary/10 text-primary border-primary/20 font-black text-[10px] uppercase tracking-widest px-3 py-1">ACTIVA</Badge>;
      case 'past_due':
        return <Badge className="bg-orange-500/10 text-orange-500 border-orange-500/20 font-black text-[10px] uppercase tracking-widest px-3 py-1">PENDIENTE</Badge>;
      case 'canceled':
        return <Badge className="bg-red-500/10 text-red-500 border-red-500/20 font-black text-[10px] uppercase tracking-widest px-3 py-1">CANCELADA</Badge>;
      case 'trialing':
        return <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20 font-black text-[10px] uppercase tracking-widest px-3 py-1">PRUEBA</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPlanLabel = (planId: string) => {
    const plans: Record<string, string> = {
      'plan_starter': 'Inicial',
      'plan_business': 'Negocios',
      'plan_enterprise': 'Corporativo'
    };
    return plans[planId] || planId;
  };

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-4xl font-bold tracking-tight">Suscripciones</h1>
          <p className="text-muted-foreground text-lg">Control de ingresos recurrentes y ciclo de vida de facturación.</p>
        </div>

        <Button 
          onClick={() => setIsDialogOpen(true)}
          className="h-11 px-6 bg-primary text-primary-foreground font-bold hover:bg-primary/90 shadow-lg shadow-primary/20 gap-2"
        >
          <Plus className="h-5 w-5" />
          Nueva Suscripción
        </Button>
      </div>

      <SubscriptionDialog 
        isOpen={isDialogOpen} 
        onOpenChange={setIsDialogOpen} 
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 bg-card/40 border-border/50 shadow-xl overflow-hidden relative group">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-primary/10 border border-primary/20 text-primary">
              <CreditCard className="h-6 w-6" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">Suscripciones Totales</p>
              <h3 className="text-3xl font-black mt-1">{stats.total}</h3>
            </div>
          </div>
          <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <CreditCard className="h-24 w-24" />
          </div>
        </Card>

        <Card className="p-6 bg-card/40 border-border/50 shadow-xl overflow-hidden relative group">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-green-500/10 border border-green-500/20 text-green-500">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">Tasa de Actividad</p>
              <h3 className="text-3xl font-black mt-1">{stats.total > 0 ? Math.round((stats.active / stats.total) * 100) : 0}%</h3>
            </div>
          </div>
          <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <CheckCircle2 className="h-24 w-24" />
          </div>
        </Card>

        <Card className="p-6 bg-card/40 border-border/50 shadow-xl overflow-hidden relative group">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-primary/20 border border-primary/30 text-primary">
              <span className="text-xl font-black">$</span>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">MRR Estimado</p>
              <h3 className="text-3xl font-black mt-1">${stats.revenue.toLocaleString()}</h3>
            </div>
          </div>
          <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity text-primary">
             <span className="text-8xl font-black">$</span>
          </div>
        </Card>
      </div>

      <div className="flex flex-col md:flex-row items-center gap-6 bg-muted/10 p-4 rounded-2xl border border-border/30">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <Input 
            placeholder="Buscar por tenante, plan o ID..." 
            className="pl-12 h-11 bg-background/50 border-border focus-visible:ring-primary/30 transition-all w-full md:max-w-md rounded-xl"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
           <Button variant="outline" className="h-11 rounded-xl border-border/50 gap-2">
             <Filter className="h-4 w-4" />
             Filtros
           </Button>
        </div>
      </div>

      <Card className="border-border/50 bg-card/30 backdrop-blur-md overflow-hidden shadow-2xl rounded-2xl">
        {loadingSubs ? (
          <div className="flex flex-col items-center justify-center py-32 space-y-4">
            <Loader2 className="h-10 w-10 text-primary animate-spin" />
            <p className="text-muted-foreground font-medium">Cargando libro de suscripciones...</p>
          </div>
        ) : filteredSubs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <Clock className="h-12 w-12 text-muted-foreground/30 mb-4" />
            <h3 className="text-xl font-bold mb-1">Sin suscripciones registradas</h3>
            <p className="text-muted-foreground max-w-sm">No hay registros vigentes en la red global de Terabound para los criterios seleccionados.</p>
          </div>
        ) : (
          <Table>
            <TableHeader className="bg-muted/40 border-b border-border/50">
              <TableRow className="hover:bg-transparent border-none">
                <TableHead className="py-5 font-bold uppercase tracking-[0.2em] text-[10px] text-muted-foreground/70">ID Suscripción / Tenante</TableHead>
                <TableHead className="py-5 font-bold uppercase tracking-[0.2em] text-[10px] text-muted-foreground/70 text-center">Estado</TableHead>
                <TableHead className="py-5 font-bold uppercase tracking-[0.2em] text-[10px] text-muted-foreground/70 text-center">Plan</TableHead>
                <TableHead className="py-5 font-bold uppercase tracking-[0.2em] text-[10px] text-muted-foreground/70 text-center">Ingreso</TableHead>
                <TableHead className="py-5 font-bold uppercase tracking-[0.2em] text-[10px] text-muted-foreground/70 text-center">Próximo Cobro</TableHead>
                <TableHead className="py-5 font-bold uppercase tracking-[0.2em] text-[10px] text-muted-foreground/70 text-right pr-8">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSubs.map((sub) => (
                <TableRow key={sub.id} className="hover:bg-muted/10 transition-all border-b border-border/20 group border-none">
                  <TableCell className="py-6">
                    <div className="flex flex-col">
                      <span className="font-bold text-lg group-hover:text-primary transition-colors">{sub.tenantName}</span>
                      <span className="text-[10px] text-muted-foreground/60 font-mono tracking-widest uppercase">{sub.id}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    {getStatusBadge(sub.status)}
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex flex-col items-center">
                      <span className="text-sm font-bold">{getPlanLabel(sub.planId)}</span>
                      <span className="text-[10px] text-muted-foreground uppercase">{sub.billingCycle === 'monthly' ? 'Mensual' : 'Anual'}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <span className="font-black text-primary">${sub.amount.toLocaleString()}</span>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-2 text-muted-foreground/80">
                      <Clock className="h-4 w-4 text-primary/40" />
                      <span className="text-sm font-medium">{new Date(sub.nextBilling).toLocaleDateString()}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right pr-6">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="hover:bg-primary/10 hover:text-primary rounded-xl">
                          <MoreVertical className="h-5 w-5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-56 bg-card border-border shadow-2xl p-2">
                        <DropdownMenuItem className="rounded-lg h-10 font-medium cursor-pointer gap-2">
                           <ExternalLink className="h-4 w-4" />
                           Ver Detalle Tenante
                        </DropdownMenuItem>
                        <DropdownMenuItem className="rounded-lg h-10 font-medium cursor-pointer gap-2">
                           <CreditCard className="h-4 w-4" />
                           Audit Log Facturación
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-border/50" />
                        <DropdownMenuItem className="text-red-500 rounded-lg h-10 font-bold cursor-pointer gap-2">
                           <AlertCircle className="h-4 w-4" />
                           Suspender Cobros
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>

      <div className="flex items-center justify-between text-muted-foreground">
        <p className="text-xs">Sincronización en tiempo real vía <span className="text-primary font-bold">Terabound Network</span></p>
        <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest">
           Siguiente Página <ChevronRight className="h-3 w-3" />
        </div>
      </div>
    </div>
  );
}
