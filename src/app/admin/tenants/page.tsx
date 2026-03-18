'use client';

import { useState, useMemo } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { 
  Search, 
  UserPlus, 
  MoreVertical, 
  ShieldAlert, 
  CheckCircle2, 
  Globe2, 
  Loader2,
  PlusCircle
} from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger, 
  DropdownMenuSeparator 
} from "@/components/ui/dropdown-menu";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useFirestore, useCollection } from '@/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

export default function TenantsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const firestore = useFirestore();

  // Consulta en tiempo real a la colección de tenantes
  const tenantsQuery = useMemo(() => collection(firestore, '_gl_tenants'), [firestore]);
  const { data: tenants, loading } = useCollection<{
    id: string;
    name: string;
    country: string;
    status: 'active' | 'suspended';
    planId: string;
    activeModules: string[];
    createdAt: string;
  }>(tenantsQuery);

  // Filtrado de tenantes basado en la búsqueda
  const filteredTenants = useMemo(() => {
    return tenants.filter(t => 
      t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.country.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.id.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [tenants, searchTerm]);

  // Contadores para las insignias superiores
  const stats = useMemo(() => ({
    total: tenants.length,
    active: tenants.filter(t => t.status === 'active').length,
    suspended: tenants.filter(t => t.status === 'suspended').length
  }), [tenants]);

  async function handleCreateTenant(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!firestore || isSubmitting) return;

    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    
    const tenantData = {
      name: formData.get('name') as string,
      country: formData.get('country') as string,
      planId: formData.get('planId') as string,
      status: 'active' as const,
      activeModules: [],
      createdAt: new Date().toISOString(),
    };

    const tenantsRef = collection(firestore, '_gl_tenants');
    
    addDoc(tenantsRef, tenantData)
      .then(() => {
        setIsDialogOpen(false);
      })
      .catch(async (error: any) => {
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
  }

  const getPlanName = (planId: string) => {
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
          <h1 className="text-4xl font-bold tracking-tight">Tenantes</h1>
          <p className="text-muted-foreground text-lg">Gestionar aislamiento y ciclo de vida de las cuentas.</p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="h-11 px-6 bg-primary text-primary-foreground font-bold hover:bg-primary/90 shadow-lg shadow-primary/20 gap-2">
              <UserPlus className="h-5 w-5" />
              Provisionar Tenante
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] bg-card border-border shadow-2xl">
            <form onSubmit={handleCreateTenant}>
              <DialogHeader>
                <DialogTitle className="text-primary text-xl">Provisionar Nuevo Tenante</DialogTitle>
                <DialogDescription className="text-muted-foreground">
                  Complete la información para registrar una nueva organización en la plataforma.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-5 py-6">
                <div className="grid gap-2">
                  <Label htmlFor="name" className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Nombre de la Empresa</Label>
                  <Input id="name" name="name" placeholder="Ej. Acme Corp" className="bg-muted/20 border-border h-11" required />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="country" className="text-sm font-bold uppercase tracking-wider text-muted-foreground">País</Label>
                  <Input id="country" name="country" placeholder="Ej. México" className="bg-muted/20 border-border h-11" required />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="planId" className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Plan Inicial</Label>
                  <Select name="planId" defaultValue="plan_starter" required>
                    <SelectTrigger className="bg-muted/20 border-border h-11">
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
              <DialogFooter className="gap-2 sm:gap-0">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isSubmitting} className="border-border">
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

      <div className="flex flex-col md:flex-row items-center gap-6">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <Input 
            placeholder="Buscar por nombre, ID o país..." 
            className="pl-12 h-11 bg-muted/20 border-border focus-visible:ring-primary/30 transition-all w-full md:max-w-md rounded-xl"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-3">
           <Badge variant="outline" className="px-4 py-1.5 bg-card/50 border-border/50 font-bold text-[10px] uppercase tracking-widest">Todos: {stats.total}</Badge>
           <Badge variant="outline" className="px-4 py-1.5 bg-primary/10 text-primary border-primary/20 font-bold text-[10px] uppercase tracking-widest">Activos: {stats.active}</Badge>
           <Badge variant="outline" className="px-4 py-1.5 bg-red-500/10 text-red-500 border-red-500/20 font-bold text-[10px] uppercase tracking-widest">Suspendidos: {stats.suspended}</Badge>
        </div>
      </div>

      <Card className="border-border/50 bg-card/30 backdrop-blur-md overflow-hidden shadow-2xl shadow-black/40 rounded-2xl">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 space-y-4">
            <Loader2 className="h-10 w-10 text-primary animate-spin" />
            <p className="text-muted-foreground font-medium">Sincronizando tenantes con la red global...</p>
          </div>
        ) : filteredTenants.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <Globe2 className="h-12 w-12 text-muted-foreground/30 mb-4" />
            <h3 className="text-xl font-bold mb-1">No se encontraron tenantes</h3>
            <p className="text-muted-foreground max-w-sm">No hay registros que coincidan con tu búsqueda o aún no has provisionado ninguno.</p>
          </div>
        ) : (
          <Table>
            <TableHeader className="bg-muted/40 border-b border-border/50">
              <TableRow className="hover:bg-transparent">
                <TableHead className="py-5 font-bold uppercase tracking-[0.2em] text-[10px] text-muted-foreground/70">Nombre del Tenante</TableHead>
                <TableHead className="py-5 font-bold uppercase tracking-[0.2em] text-[10px] text-muted-foreground/70 text-center">Estado</TableHead>
                <TableHead className="py-5 font-bold uppercase tracking-[0.2em] text-[10px] text-muted-foreground/70 text-center">Región</TableHead>
                <TableHead className="py-5 font-bold uppercase tracking-[0.2em] text-[10px] text-muted-foreground/70 text-center">Plan</TableHead>
                <TableHead className="py-5 font-bold uppercase tracking-[0.2em] text-[10px] text-muted-foreground/70 text-center">Módulos</TableHead>
                <TableHead className="py-5 font-bold uppercase tracking-[0.2em] text-[10px] text-muted-foreground/70">Creado</TableHead>
                <TableHead className="py-5 font-bold uppercase tracking-[0.2em] text-[10px] text-muted-foreground/70 text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTenants.map((tenant) => (
                <TableRow key={tenant.id} className="hover:bg-muted/20 transition-all border-b border-border/30 group">
                  <TableCell className="py-6">
                    <div className="flex flex-col">
                      <span className="font-bold text-lg group-hover:text-primary transition-colors">{tenant.name}</span>
                      <span className="text-[10px] text-muted-foreground/60 font-mono tracking-widest">{tenant.id}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    {tenant.status === 'active' ? (
                      <div className="flex items-center justify-center gap-2 text-primary">
                        <CheckCircle2 className="h-4 w-4" />
                        <span className="text-[10px] font-black uppercase tracking-widest">ACTIVO</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-2 text-red-500">
                        <ShieldAlert className="h-4 w-4" />
                        <span className="text-[10px] font-black uppercase tracking-widest">SUSPENDIDO</span>
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-2 text-muted-foreground/80">
                      <Globe2 className="h-4 w-4 text-primary/50" />
                      <span className="text-sm font-medium">{tenant.country}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="secondary" className="bg-card border-border/50 text-foreground/80 font-bold px-3 py-1 text-[10px] uppercase">
                      {getPlanName(tenant.planId)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center -space-x-3">
                      {tenant.activeModules && tenant.activeModules.length > 0 ? (
                        <>
                          {tenant.activeModules.slice(0, 3).map((modId) => (
                            <div key={modId} className="h-8 w-8 rounded-full border-2 border-background bg-primary shadow-lg flex items-center justify-center text-[10px] font-black text-primary-foreground" title={modId}>
                              {modId.split('_')[1]?.toUpperCase().slice(0, 2) || 'M'}
                            </div>
                          ))}
                          {tenant.activeModules.length > 3 && (
                            <div className="h-8 w-8 rounded-full border-2 border-background bg-muted flex items-center justify-center text-[10px] font-bold text-muted-foreground shadow-lg">
                              +{tenant.activeModules.length - 3}
                            </div>
                          )}
                        </>
                      ) : (
                        <span className="text-[10px] text-muted-foreground/50 font-medium uppercase italic">Sin módulos</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground/60 text-sm font-medium">
                    {new Date(tenant.createdAt).toLocaleDateString('es-ES')}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="hover:bg-primary/10 hover:text-primary rounded-xl">
                          <MoreVertical className="h-5 w-5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-56 bg-card border-border shadow-2xl p-2">
                        <DropdownMenuItem className="rounded-lg h-10 font-medium">Ver Detalles</DropdownMenuItem>
                        <DropdownMenuItem className="rounded-lg h-10 font-medium">Editar Configuración</DropdownMenuItem>
                        <DropdownMenuItem className="rounded-lg h-10 font-medium">Gestionar Suscripciones</DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-border/50" />
                        {tenant.status === 'active' ? (
                          <DropdownMenuItem className="text-red-500 rounded-lg h-10 font-bold">Suspender Tenante</DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem className="text-primary rounded-lg h-10 font-bold">Reactivar Tenante</DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  );
}
