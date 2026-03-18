'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Box, Code2, Link2, PlusCircle, RefreshCcw, Loader2, Info } from "lucide-react";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useFirestore, useCollection } from '@/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

export default function ModulesPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const firestore = useFirestore();

  // Consulta en tiempo real a la colección de módulos
  const modulesQuery = useMemo(() => collection(firestore, '_gl_modules'), [firestore]);
  const { data: modules, loading } = useCollection<{
    id: string;
    name: string;
    version: string;
    remoteUrl: string;
    status: 'active' | 'inactive';
    dependencies?: string[];
  }>(modulesQuery);

  async function handleCreateModule(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!firestore || isSubmitting) return;

    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    
    const moduleData = {
      name: formData.get('name') as string,
      version: formData.get('version') as string,
      remoteUrl: formData.get('remoteUrl') as string,
      status: formData.get('status') as 'active' | 'inactive',
      dependencies: [],
      createdAt: new Date().toISOString(),
    };

    const modulesRef = collection(firestore, '_gl_modules');
    
    addDoc(modulesRef, moduleData)
      .then(() => {
        setIsDialogOpen(false);
      })
      .catch(async (error: any) => {
        const permissionError = new FirestorePermissionError({
          path: modulesRef.path,
          operation: 'create',
          requestResourceData: moduleData,
        });
        errorEmitter.emit('permission-error', permissionError);
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  }

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-4xl font-bold tracking-tight">Catálogo de Módulos</h1>
          <p className="text-muted-foreground text-lg">Registro global de micro-frontends para despliegue de tenantes.</p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="h-11 px-6 bg-primary text-primary-foreground font-bold hover:bg-primary/90 shadow-lg shadow-primary/20 gap-2">
              <PlusCircle className="h-5 w-5" />
              Registrar Nuevo Módulo
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] bg-card border-border shadow-2xl">
            <form onSubmit={handleCreateModule}>
              <DialogHeader>
                <DialogTitle className="text-primary text-xl">Registrar Nuevo Módulo</DialogTitle>
                <DialogDescription className="text-muted-foreground">
                  Añada un nuevo micro-frontend al catálogo global de la plataforma.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-5 py-6">
                <div className="grid gap-2">
                  <Label htmlFor="name" className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Nombre del Módulo</Label>
                  <Input id="name" name="name" placeholder="Ej. Inventario Pro" className="bg-muted/20 border-border h-11" required />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="version" className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Versión Semántica</Label>
                  <Input id="version" name="version" placeholder="Ej. 1.0.0" className="bg-muted/20 border-border h-11" required />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="remoteUrl" className="text-sm font-bold uppercase tracking-wider text-muted-foreground">URL Remota (CDN/Entry)</Label>
                  <Input id="remoteUrl" name="remoteUrl" placeholder="https://cdn.terabound.com/modules/..." className="bg-muted/20 border-border h-11 font-mono text-xs" required />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="status" className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Estado Inicial</Label>
                  <Select name="status" defaultValue="active" required>
                    <SelectTrigger className="bg-muted/20 border-border h-11">
                      <SelectValue placeholder="Seleccione un estado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Activo</SelectItem>
                      <SelectItem value="inactive">Inactivo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter className="gap-2 sm:gap-0">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isSubmitting} className="border-border">
                  Cancelar
                </Button>
                <Button type="submit" className="bg-primary text-primary-foreground font-bold" disabled={isSubmitting}>
                  {isSubmitting ? "Registrando..." : "Registrar Módulo"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 space-y-4">
          <Loader2 className="h-10 w-10 text-primary animate-spin" />
          <p className="text-muted-foreground font-medium">Sincronizando catálogo con base de datos...</p>
        </div>
      ) : modules.length === 0 ? (
        <Card className="border-dashed border-2 border-border/50 bg-transparent flex flex-col items-center justify-center py-32 text-center">
          <Box className="h-12 w-12 text-muted-foreground/30 mb-4" />
          <h3 className="text-xl font-bold mb-1">No hay módulos registrados</h3>
          <p className="text-muted-foreground max-w-sm">Registra tu primer micro-frontend para que aparezca en el catálogo global.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {modules.map((module) => (
            <Card key={module.id} className="border-border/50 bg-card hover:border-primary/40 transition-all duration-300 shadow-2xl shadow-black/40 group overflow-hidden flex flex-col">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2.5 rounded-xl bg-primary/10 border border-primary/20">
                    <Box className="h-5 w-5 text-primary" />
                  </div>
                  <Badge 
                    className={module.status === 'active' 
                      ? 'bg-primary/20 text-primary border-primary/30 font-bold uppercase tracking-wider text-[10px] px-3' 
                      : 'bg-muted text-muted-foreground border-border/50 font-bold uppercase tracking-wider text-[10px] px-3'}
                  >
                    {module.status === 'active' ? 'ACTIVO' : 'INACTIVO'}
                  </Badge>
                </div>
                <CardTitle className="text-2xl font-bold tracking-tight">{module.name}</CardTitle>
                <CardDescription className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">{module.id}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 flex-1">
                <div className="flex items-center justify-between py-2 border-b border-border/30">
                  <span className="text-sm text-muted-foreground font-medium">Versión</span>
                  <Badge variant="outline" className="font-mono border-primary/20 text-primary bg-primary/5">{module.version}</Badge>
                </div>
                
                <div className="space-y-3">
                  <span className="text-[10px] font-bold uppercase text-muted-foreground tracking-[0.2em]">Origen Remoto</span>
                  <div className="flex items-center gap-2 p-3.5 rounded-xl bg-muted/30 border border-border/50 text-xs font-mono text-primary/80 truncate">
                    <Link2 className="h-3.5 w-3.5 shrink-0 text-primary" />
                    {module.remoteUrl}
                  </div>
                </div>

                {module.dependencies && module.dependencies.length > 0 ? (
                  <div className="space-y-3">
                    <span className="text-[10px] font-bold uppercase text-muted-foreground tracking-[0.2em]">Dependencias</span>
                    <div className="flex flex-wrap gap-2">
                      {module.dependencies.map(dep => (
                        <Badge key={dep} variant="secondary" className="text-[10px] h-6 bg-muted/50 border-border/50 font-medium px-2.5">
                          {dep}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="pt-2 flex items-center gap-2 text-xs text-muted-foreground/60 italic">
                    <Info className="h-3.5 w-3.5" />
                    Sin dependencias externas
                  </div>
                )}
              </CardContent>
              <CardFooter className="pt-0 border-t border-border/30 bg-muted/10 flex gap-3 p-6">
                <Button variant="outline" size="sm" className="flex-1 h-10 gap-2 border-border hover:bg-muted font-bold">
                  <Code2 className="h-4 w-4" />
                  Inspeccionar
                </Button>
                <Button variant="secondary" size="sm" className="flex-1 h-10 gap-2 hover:bg-muted font-bold">
                  <RefreshCcw className="h-4 w-4" />
                  Actualizar
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
