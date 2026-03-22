'use client';

import { useState, useMemo } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { 
  Search, 
  UserPlus, 
  MoreVertical, 
  ShieldAlert, 
  CheckCircle2, 
  Globe2, 
  Loader2,
  Settings2,
  Save,
  Box
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
import { 
  Sheet, 
  SheetContent, 
  SheetDescription, 
  SheetHeader, 
  SheetTitle,
  SheetFooter
} from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useFirestore, useCollection } from '@/firebase';
import { collection, addDoc, doc, updateDoc } from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { SubscriptionDialog } from '@/components/admin/SubscriptionDialog';
import { TenantDialog } from '@/components/admin/TenantDialog';
import { TenantUsersDialog } from '@/components/admin/TenantUsersDialog';

interface Tenant {
  id: string;
  name: string;
  country: string;
  status: 'active' | 'suspended';
  planId: string;
  activeModules: string[];
  createdAt: string;
}

interface Module {
  id: string;
  name: string;
  version: string;
  status: string;
}

export default function TenantsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isEditSheetOpen, setIsEditSheetOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  const [tempModules, setTempModules] = useState<string[]>([]);
  const [isSubDialogOpen, setIsSubDialogOpen] = useState(false);
  const [targetTenantId, setTargetTenantId] = useState<string | undefined>(undefined);
  const [isTenantDialogOpen, setIsTenantDialogOpen] = useState(false);
  const [tenantToEdit, setTenantToEdit] = useState<Tenant | null>(null);
  const [isUsersDialogOpen, setIsUsersDialogOpen] = useState(false);
  
  const firestore = useFirestore();

  // Consulta de tenantes
  const tenantsQuery = useMemo(() => collection(firestore, '_gl_tenants'), [firestore]);
  const { data: tenants, loading: loadingTenants } = useCollection<Tenant>(tenantsQuery as any);

  // Consulta de módulos disponibles
  const modulesQuery = useMemo(() => collection(firestore, '_gl_modules'), [firestore]);
  const { data: availableModules } = useCollection<Module>(modulesQuery as any);

  // Filtrado
  const filteredTenants = useMemo(() => {
    if (!tenants) return [];
    return tenants.filter(t => 
      t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.country.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.id.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [tenants, searchTerm]);

  const stats = useMemo(() => {
    if (!tenants) return { total: 0, active: 0, suspended: 0 };
    return {
      total: tenants.length,
      active: tenants.filter(t => t.status === 'active').length,
      suspended: tenants.filter(t => t.status === 'suspended').length
    };
  }, [tenants]);

  function handleOpenCreateTenant() {
    setTenantToEdit(null);
    setIsTenantDialogOpen(true);
  }

  function handleOpenEditTenant(tenant: Tenant) {
    setTenantToEdit(tenant);
    setIsTenantDialogOpen(true);
  }

  function handleOpenEditModules(tenant: Tenant) {
    setSelectedTenant(tenant);
    setTempModules(tenant.activeModules || []);
    setIsEditSheetOpen(true);
  }

  async function handleSaveModules() {
    if (!firestore || !selectedTenant || isSubmitting) return;

    setIsSubmitting(true);
    const tenantRef = doc(firestore, '_gl_tenants', selectedTenant.id);

    updateDoc(tenantRef, {
      activeModules: tempModules
    })
    .then(() => {
      setIsEditSheetOpen(false);
      setSelectedTenant(null);
    })
    .catch(async (error: any) => {
      const permissionError = new FirestorePermissionError({
        path: tenantRef.path,
        operation: 'update',
        requestResourceData: { activeModules: tempModules },
      });
      errorEmitter.emit('permission-error', permissionError);
    })
    .finally(() => {
      setIsSubmitting(false);
    });
  }

  const toggleModule = (moduleId: string) => {
    setTempModules(current => 
      current.includes(moduleId) 
        ? current.filter(id => id !== moduleId) 
        : [...current, moduleId]
    );
  };

  const getPlanName = (planId: string) => {
    const plans: Record<string, string> = {
      'plan_starter': 'Inicial',
      'plan_business': 'Negocios',
      'plan_enterprise': 'Corporativo'
    };
    return plans[planId] || planId;
  };

  const handleOpenSubscription = (tenantId: string) => {
    setTargetTenantId(tenantId);
    setIsSubDialogOpen(true);
  };

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-4xl font-bold tracking-tight">Empresas</h1>
          <p className="text-muted-foreground text-lg">Gestionar aislamiento y ciclo de vida de las empresas registradas.</p>
        </div>

        <Button 
          className="h-11 px-6 bg-primary text-primary-foreground font-bold hover:bg-primary/90 shadow-lg shadow-primary/20 gap-2"
          onClick={handleOpenCreateTenant}
        >
          <UserPlus className="h-5 w-5" />
          Provisionar Empresa
        </Button>

        <TenantDialog 
          isOpen={isTenantDialogOpen} 
          onOpenChange={setIsTenantDialogOpen} 
          tenant={tenantToEdit}
        />
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
           <Badge variant="outline" className="px-4 py-1.5 bg-card/50 border-border/50 font-bold text-[10px] uppercase tracking-widest text-muted-foreground">Todos: {stats.total}</Badge>
           <Badge variant="outline" className="px-4 py-1.5 bg-primary/10 text-primary border-primary/20 font-bold text-[10px] uppercase tracking-widest">Activos: {stats.active}</Badge>
           <Badge variant="outline" className="px-4 py-1.5 bg-red-500/10 text-red-500 border-red-500/20 font-bold text-[10px] uppercase tracking-widest">Suspendidos: {stats.suspended}</Badge>
        </div>
      </div>

      <Card className="border-border/50 bg-card/30 backdrop-blur-md overflow-hidden shadow-2xl shadow-black/40 rounded-2xl">
        {loadingTenants ? (
          <div className="flex flex-col items-center justify-center py-32 space-y-4">
            <Loader2 className="h-10 w-10 text-primary animate-spin" />
            <p className="text-muted-foreground font-medium">Sincronizando empresas con la red global...</p>
          </div>
        ) : filteredTenants.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <Globe2 className="h-12 w-12 text-muted-foreground/30 mb-4" />
            <h3 className="text-xl font-bold mb-1">No se encontraron empresas</h3>
            <p className="text-muted-foreground max-w-sm">No hay registros que coincidan con tu búsqueda o aún no has provisionado ninguna.</p>
          </div>
        ) : (
          <Table>
            <TableHeader className="bg-muted/40 border-b border-border/50">
              <TableRow className="hover:bg-transparent border-none">
                <TableHead className="py-5 font-bold uppercase tracking-[0.2em] text-[10px] text-muted-foreground/70">Nombre de la Empresa</TableHead>
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
                <TableRow key={tenant.id} className="hover:bg-muted/10 transition-all border-b border-border/20 group border-none">
                  <TableCell className="py-6">
                    <div className="flex flex-col">
                      <span className="font-bold text-lg group-hover:text-primary transition-colors">{tenant.name}</span>
                      <span className="text-[10px] text-muted-foreground/60 font-mono tracking-widest uppercase">{tenant.id}</span>
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
                    <Badge variant="secondary" className="bg-muted/50 border-border/50 text-foreground/80 font-bold px-3 py-1 text-[10px] uppercase">
                      {getPlanName(tenant.planId)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex flex-wrap justify-center gap-1.5 max-w-[200px] mx-auto">
                      {tenant.activeModules && tenant.activeModules.length > 0 ? (
                        <>
                          {tenant.activeModules.slice(0, 2).map((modId) => (
                            <Badge 
                              key={modId} 
                              variant="outline" 
                              className="bg-primary/5 border-primary/20 text-primary text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter whitespace-nowrap"
                            >
                              {(availableModules || []).find(m => m.id === modId)?.name || modId}
                            </Badge>
                          ))}
                          {tenant.activeModules.length > 2 && (
                            <Badge variant="secondary" className="text-[9px] font-black px-2 py-0.5 rounded-full bg-muted/50 border-border/50 text-muted-foreground">
                              +{tenant.activeModules.length - 2}
                            </Badge>
                          )}
                        </>
                      ) : (
                        <span className="text-[10px] text-muted-foreground/30 font-medium uppercase italic">Sin módulos</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground/60 text-sm font-medium">
                    {new Date(tenant.createdAt).toLocaleDateString('es-ES')}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu modal={false}>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="hover:bg-primary/10 hover:text-primary rounded-xl">
                          <MoreVertical className="h-5 w-5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-56 bg-card border-border shadow-2xl p-2">
                        <DropdownMenuItem 
                          className="rounded-lg h-10 font-medium cursor-pointer"
                          onSelect={() => handleOpenEditTenant(tenant)}
                        >
                          <Settings2 className="mr-2 h-4 w-4" />
                          Editar Datos Básicos
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="rounded-lg h-10 font-medium cursor-pointer"
                          onSelect={() => {
                            setTargetTenantId(tenant.id);
                            setIsUsersDialogOpen(true);
                          }}
                        >
                          <UserPlus className="mr-2 h-4 w-4" />
                          Gestionar Usuarios
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="rounded-lg h-10 font-medium cursor-pointer"
                          onSelect={() => handleOpenEditModules(tenant)}
                        >
                          <Box className="mr-2 h-4 w-4" />
                          Gestionar Módulos
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="rounded-lg h-10 font-medium cursor-pointer"
                          onSelect={() => handleOpenSubscription(tenant.id)}
                        >
                          Gestionar Suscripciones
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-border/50" />
                        {tenant.status === 'active' ? (
                          <DropdownMenuItem className="text-red-500 rounded-lg h-10 font-bold cursor-pointer">Suspender Empresa</DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem className="text-primary rounded-lg h-10 font-bold cursor-pointer">Reactivar Empresa</DropdownMenuItem>
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

      {/* Panel lateral para editar módulos */}
      <Sheet open={isEditSheetOpen} onOpenChange={setIsEditSheetOpen}>
        <SheetContent className="w-full sm:max-w-md bg-card border-l border-border/50">
          <SheetHeader className="space-y-4 pb-6 border-b border-border/30">
            <SheetTitle className="text-2xl font-bold tracking-tight flex items-center gap-3">
              <div className="p-2 rounded-xl bg-primary/10 border border-primary/20">
                <Box className="h-5 w-5 text-primary" />
              </div>
              Gestionar Módulos
            </SheetTitle>
            <SheetDescription className="text-muted-foreground text-sm">
              Asigne o desactive micro-frontends para <span className="text-primary font-bold">{selectedTenant?.name}</span>.
            </SheetDescription>
          </SheetHeader>
          
          <div className="py-8 space-y-6">
            <div className="space-y-4">
              <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/70">Módulos del Catálogo Global</h4>
              <ScrollArea className="h-[50vh] pr-4">
                <div className="space-y-3">
                  {availableModules && availableModules.map((module) => (
                    <div 
                      key={module.id} 
                      className={`flex items-center justify-between p-4 rounded-xl border transition-all cursor-pointer group ${
                        tempModules.includes(module.id) 
                          ? 'bg-primary/5 border-primary/30' 
                          : 'bg-muted/20 border-border/50 hover:border-primary/20 hover:bg-muted/30'
                      }`}
                      onClick={() => toggleModule(module.id)}
                    >
                      <div className="flex items-center gap-3">
                        <Checkbox 
                          checked={tempModules.includes(module.id)} 
                          onCheckedChange={() => toggleModule(module.id)}
                          className="border-primary/50 data-[state=checked]:bg-primary"
                        />
                        <div className="flex flex-col">
                          <span className="text-sm font-bold group-hover:text-primary transition-colors">{module.name}</span>
                          <span className="text-[10px] font-mono text-muted-foreground uppercase">{module.version}</span>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-[9px] font-bold border-border/50">
                        {module.status}
                      </Badge>
                    </div>
                  ))}
                  {(!availableModules || availableModules.length === 0) && (
                    <p className="text-xs text-muted-foreground text-center py-8">No hay módulos registrados en el catálogo global.</p>
                  )}
                </div>
              </ScrollArea>
            </div>
          </div>

          <SheetFooter className="absolute bottom-0 left-0 right-0 p-6 bg-card border-t border-border/30 flex flex-col gap-3">
            <Button 
              className="w-full h-12 bg-primary text-primary-foreground font-bold hover:bg-primary/90 shadow-lg shadow-primary/20 gap-2"
              onClick={handleSaveModules}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Sincronizando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Guardar Configuración
                </>
              )}
            </Button>
            <Button 
              variant="outline" 
              className="w-full h-11 border-border/50 text-muted-foreground hover:bg-muted"
              onClick={() => setIsEditSheetOpen(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      <SubscriptionDialog 
        isOpen={isSubDialogOpen} 
        onOpenChange={setIsSubDialogOpen} 
        defaultTenantId={targetTenantId}
      />

      <TenantUsersDialog
        isOpen={isUsersDialogOpen}
        onOpenChange={setIsUsersDialogOpen}
        tenantId={targetTenantId}
      />
    </div>
  );
}

