'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MOCK_MODULES } from "@/app/lib/mock-data";
import { Box, Code2, Link2, PlusCircle, RefreshCcw } from "lucide-react";
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
import { useFirestore } from '@/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

export default function ModulesPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const firestore = useFirestore();

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
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Catálogo de Módulos</h1>
          <p className="text-muted-foreground">Registro global de micro-frontends para despliegue de tenantes.</p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 bg-primary text-primary-foreground font-bold hover:bg-primary/90 shadow-lg shadow-primary/20">
              <PlusCircle className="h-4 w-4" />
              Registrar Nuevo Módulo
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] bg-card border-border shadow-2xl">
            <form onSubmit={handleCreateModule}>
              <DialogHeader>
                <DialogTitle className="text-primary">Registrar Nuevo Módulo</DialogTitle>
                <DialogDescription>
                  Añada un nuevo micro-frontend al catálogo global de la plataforma.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Nombre del Módulo</Label>
                  <Input id="name" name="name" placeholder="Ej. Inventario Pro" className="bg-muted/30 border-border" required />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="version">Versión Semántica</Label>
                  <Input id="version" name="version" placeholder="Ej. 1.0.0" className="bg-muted/30 border-border" required />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="remoteUrl">URL Remota (CDN/Entry)</Label>
                  <Input id="remoteUrl" name="remoteUrl" placeholder="https://cdn.terabound.com/modules/..." className="bg-muted/30 border-border" required />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="status">Estado Inicial</Label>
                  <Select name="status" defaultValue="active" required>
                    <SelectTrigger className="bg-muted/30 border-border">
                      <SelectValue placeholder="Seleccione un estado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Activo</SelectItem>
                      <SelectItem value="inactive">Inactivo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isSubmitting}>
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {MOCK_MODULES.map((module) => (
          <Card key={module.id} className="border-border/50 bg-card hover:border-primary/30 transition-all duration-300 shadow-xl shadow-black/20 group overflow-hidden flex flex-col">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
                  <Box className="h-5 w-5 text-primary" />
                </div>
                <Badge variant={module.status === 'active' ? 'default' : 'secondary'} className={module.status === 'active' ? 'bg-primary text-primary-foreground' : ''}>
                  {module.status === 'active' ? 'ACTIVO' : 'INACTIVO'}
                </Badge>
              </div>
              <CardTitle className="text-xl font-bold">{module.name}</CardTitle>
              <CardDescription className="font-mono text-xs text-muted-foreground">{module.id}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 flex-1">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground font-medium">Versión</span>
                <Badge variant="outline" className="font-mono border-primary/20 text-primary">{module.version}</Badge>
              </div>
              
              <div className="space-y-2">
                <span className="text-[10px] font-bold uppercase text-muted-foreground tracking-[0.2em]">Origen Remoto</span>
                <div className="flex items-center gap-2 p-3 rounded-xl bg-muted/30 border border-border/50 text-xs font-mono truncate">
                  <Link2 className="h-3 w-3 shrink-0 text-primary" />
                  {module.remoteUrl}
                </div>
              </div>

              {module.dependencies.length > 0 && (
                <div className="space-y-2">
                  <span className="text-[10px] font-bold uppercase text-muted-foreground tracking-[0.2em]">Dependencias</span>
                  <div className="flex flex-wrap gap-1">
                    {module.dependencies.map(dep => (
                      <Badge key={dep} variant="secondary" className="text-[10px] h-5 bg-muted/50 border-border/50">{dep}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter className="pt-0 border-t border-border/20 bg-muted/10 flex gap-2 p-4">
              <Button variant="outline" size="sm" className="flex-1 gap-2 border-border hover:bg-muted">
                <Code2 className="h-3.5 w-3.5" />
                Inspeccionar
              </Button>
              <Button variant="secondary" size="sm" className="flex-1 gap-2 hover:bg-muted">
                <RefreshCcw className="h-3.5 w-3.5" />
                Actualizar
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
