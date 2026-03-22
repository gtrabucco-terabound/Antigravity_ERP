'use client';

import { useState, useMemo, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useFirestore, useCollection } from '@/firebase';
import { collection, addDoc, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { Loader2, Box, Settings2, Plus } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Module {
  id: string;
  name: string;
}

interface Plan {
  id: string;
  name: string;
  price: number;
  modulesIncluded: string[];
  limits: {
    users: number | string;
    storage: string;
  };
}

interface PlanDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  plan?: Plan | null;
  onSuccess?: () => void;
}

export function PlanDialog({ isOpen, onOpenChange, plan, onSuccess }: PlanDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [selectedModules, setSelectedModules] = useState<string[]>([]);
  const [usersLimit, setUsersLimit] = useState('');
  const [storageLimit, setStorageLimit] = useState('');
  
  const firestore = useFirestore();
  const modulesQuery = useMemo(() => collection(firestore, '_gl_modules'), [firestore]);
  const { data: availableModules } = useCollection<Module>(modulesQuery as any);

  useEffect(() => {
    if (plan) {
      setName(plan.name);
      setPrice(plan.price.toString());
      setSelectedModules(plan.modulesIncluded || []);
      setUsersLimit(plan.limits?.users?.toString() || '');
      setStorageLimit(plan.limits?.storage || '');
    } else {
      setName('');
      setPrice('');
      setSelectedModules([]);
      setUsersLimit('');
      setStorageLimit('');
    }
  }, [plan, isOpen]);

  const toggleModule = (moduleId: string) => {
    setSelectedModules(current => 
      current.includes(moduleId) 
        ? current.filter(id => id !== moduleId) 
        : [...current, moduleId]
    );
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);

    const planData = {
      name,
      price: parseFloat(price),
      modulesIncluded: selectedModules,
      limits: {
        users: usersLimit === 'Ilimitado' ? 'Ilimitado' : parseInt(usersLimit) || 0,
        storage: storageLimit
      },
      updatedAt: new Date().toISOString(),
      serverTimestamp: serverTimestamp()
    };

    try {
      if (plan) {
        const planRef = doc(firestore, '_gl_plans', plan.id);
        await updateDoc(planRef, planData);
        
        // Log de auditoría
        await addDoc(collection(firestore, '_gl_audit_logs'), {
          action: 'update',
          type: 'info',
          message: `Plan global actualizado: ${name}`,
          timestamp: serverTimestamp(),
          targetId: plan.id,
          targetCollection: '_gl_plans',
          userId: 'system'
        });
      } else {
        const plansRef = collection(firestore, '_gl_plans');
        const docRef = await addDoc(plansRef, {
          ...planData,
          createdAt: new Date().toISOString(),
          id: `plan_${name.toLowerCase().replace(/\s+/g, '_')}` // Suggested ID
        });

        // Log de auditoría
        await addDoc(collection(firestore, '_gl_audit_logs'), {
          action: 'create',
          type: 'info',
          message: `Nuevo plan global creado: ${name}`,
          timestamp: serverTimestamp(),
          targetId: docRef.id,
          targetCollection: '_gl_plans',
          userId: 'system'
        });
      }

      if (onSuccess) onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error("Error saving plan:", error);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-card border-border shadow-2xl overflow-hidden">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="text-primary text-xl flex items-center gap-2">
              {plan ? <Settings2 className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
              {plan ? `Configurar Nivel: ${plan.name}` : 'Crear Nuevo Plan Global'}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Defina las capacidades, límites y precio para este nivel de servicio.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-6 py-6 border-b border-border/30">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="name" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Nombre del Plan</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ej. Corporativo" className="bg-muted/20 border-border h-11" required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="price" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Precio Mensual ($)</Label>
                <Input id="price" type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="999" className="bg-muted/20 border-border h-11 font-mono font-bold text-primary" required />
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Módulos Incluidos</Label>
              <ScrollArea className="h-[120px] rounded-md border border-border/50 bg-muted/10 p-4">
                <div className="grid grid-cols-2 gap-3">
                  {availableModules.map((module) => (
                    <div 
                      key={module.id} 
                      className="flex items-center space-x-2 p-2 rounded-lg hover:bg-muted/50 transition-colors group"
                    >
                      <Checkbox 
                        id={`mod-${module.id}`}
                        checked={selectedModules.includes(module.id)} 
                        onCheckedChange={() => toggleModule(module.id)}
                        className="data-[state=checked]:bg-primary"
                      />
                      <label 
                        htmlFor={`mod-${module.id}`}
                        className="text-sm font-medium cursor-pointer flex-1 leading-none group-hover:text-primary transition-colors"
                      >
                        {module.name}
                      </label>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>

            <div className="space-y-4">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Límites de Uso</Label>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="users" className="text-[10px] uppercase text-muted-foreground/60">Usuarios</Label>
                  <Input id="users" value={usersLimit} onChange={(e) => setUsersLimit(e.target.value)} placeholder="Ej. 1000 o Ilimitado" className="bg-muted/20 border-border h-11 h-10 text-sm" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="storage" className="text-[10px] uppercase text-muted-foreground/60">Almacenamiento</Label>
                  <Input id="storage" value={storageLimit} onChange={(e) => setStorageLimit(e.target.value)} placeholder="Ej. 100GB o Ilimitado" className="bg-muted/20 border-border h-11 h-10 text-sm" />
                </div>
              </div>
            </div>
          </div>
          <DialogFooter className="p-6 bg-muted/5">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} disabled={isSubmitting} className="text-muted-foreground">
              Cancelar
            </Button>
            <Button type="submit" className="bg-primary text-primary-foreground font-bold shadow-lg shadow-primary/20 px-8" disabled={isSubmitting}>
              {isSubmitting ? (
                 <div className="flex items-center gap-2">
                   <Loader2 className="h-4 w-4 animate-spin" />
                   Guardando...
                 </div>
              ) : (plan ? "Actualizar Plan" : "Crear Plan Global")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
