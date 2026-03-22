'use client';

import { useState, useEffect, useMemo } from 'react';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useFirestore, useCollection } from '@/firebase';
import { collection, addDoc, doc, updateDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { Loader2, Building, Globe2, Plus, Settings2, Mail, User } from "lucide-react";

interface Plan {
  id: string;
  name: string;
  price: number;
}

interface Tenant {
  id: string;
  name: string;
  country: string;
  planId: string;
  status: 'active' | 'suspended';
}

interface TenantDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  tenant?: Tenant | null;
  onSuccess?: () => void;
}

export function TenantDialog({ isOpen, onOpenChange, tenant, onSuccess }: TenantDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [name, setName] = useState('');
  const [country, setCountry] = useState('');
  const [planId, setPlanId] = useState('plan_starter');
  const [adminName, setAdminName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  
  const firestore = useFirestore();
  const plansQuery = useMemo(() => collection(firestore, '_gl_plans'), [firestore]);
  const { data: plans } = useCollection<Plan>(plansQuery as any);

  useEffect(() => {
    if (tenant) {
      setName(tenant.name || '');
      setCountry(tenant.country || '');
      setPlanId(tenant.planId || 'plan_starter');
    } else {
      setName('');
      setCountry('');
      setPlanId('plan_starter');
    }
  }, [tenant, isOpen]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isSubmitting || !firestore) return;

    setIsSubmitting(true);

    const tenantData = {
      name,
      country,
      planId,
      status: tenant ? tenant.status : 'active',
      updatedAt: new Date().toISOString(),
    };

    const tenantsRef = collection(firestore, '_gl_tenants');
    const logsRef = collection(firestore, '_gl_audit_logs');

    try {
      if (tenant) {
        const tenantRef = doc(firestore, '_gl_tenants', tenant.id);
        await updateDoc(tenantRef, tenantData);
        
        // Registro de auditoría para actualización
        await addDoc(logsRef, {
          action: 'update',
          type: 'info',
          message: `Empresa actualizada: ${name}`,
          timestamp: serverTimestamp(),
          targetId: tenant.id,
          targetCollection: '_gl_tenants',
          userId: 'system'
        });
      } else {
        const docRef = await addDoc(tenantsRef, {
          ...tenantData,
          activeModules: [],
          createdAt: new Date().toISOString(),
        });

        // Registro de auditoría para creación
        await addDoc(logsRef, {
          action: 'create',
          type: 'info',
          message: `Nueva empresa registrada: ${name}`,
          timestamp: serverTimestamp(),
          targetId: docRef.id,
          targetCollection: '_gl_tenants',
          userId: 'system'
        });

        // CREACIÓN DE USUARIO ADMINISTRADOR Y AUTHENTICATION
        const tempPass = `Tera${Math.floor(1000 + Math.random() * 9000)}!`;
        
        const apiResponse = await fetch('/api/users/provision', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: adminEmail,
            password: tempPass,
            name: adminName,
            role: 'ADMIN_OWNER',
            tenantId: docRef.id
          })
        });

        if (!apiResponse.ok) {
           const errData = await apiResponse.json();
           throw new Error(errData.error || 'Error al provisionar identidad en Auth');
        }

        const { uid } = await apiResponse.json();

        await setDoc(doc(firestore, '_gl_users', uid), {
          email: adminEmail,
          name: adminName,
          status: 'pending_activation',
          createdAt: serverTimestamp(),
          mustChangePassword: true,
          tempPassword: tempPass,
          role: 'admin'
        });

        await setDoc(doc(firestore, '_gl_tenants', docRef.id, 'members', uid), {
          userId: uid,
          email: adminEmail,
          name: adminName,
          role: 'ADMIN_OWNER',
          status: 'active',
          joinedAt: serverTimestamp()
        });

        console.log(`Usuario admin creado: ${adminEmail} con clave ${tempPass}`);
        alert(`Empresa provisionada con éxito.\nAcceso Admin: ${adminEmail}\nClave Temporal: ${tempPass}`);
      }

      if (onSuccess) onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error("Error saving tenant:", error);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-card border-border shadow-2xl overflow-hidden">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="text-primary text-xl flex items-center gap-2">
              {tenant ? <Settings2 className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
              {tenant ? 'Editar Empresa' : 'Provisionar Nueva Empresa'}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground text-sm">
              {tenant 
                ? `Actualice la información básica para ${tenant.name}.`
                : 'Complete la información para registrar una nueva organización en la plataforma.'
              }
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-5 py-6">
            <div className="grid gap-2">
              <Label htmlFor="name" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">Nombre de la Empresa</Label>
              <div className="relative group">
                <Building className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50 group-focus-within:text-primary transition-colors" />
                <Input 
                  id="name" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  placeholder="Ej. Acme Corp" 
                  className="pl-10 bg-muted/20 border-border h-11 focus-visible:ring-primary/20" 
                  required 
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="country" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">Región / País</Label>
              <div className="relative group">
                <Globe2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50 group-focus-within:text-primary transition-colors" />
                <Input 
                  id="country" 
                  value={country} 
                  onChange={(e) => setCountry(e.target.value)} 
                  placeholder="Ej. México" 
                  className="pl-10 bg-muted/20 border-border h-11 focus-visible:ring-primary/20" 
                  required 
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="planId" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">Plan de Servicio</Label>
              <Select value={planId} onValueChange={setPlanId} required>
                <SelectTrigger className="bg-muted/20 border-border h-11">
                  <SelectValue placeholder="Seleccione un plan" />
                </SelectTrigger>
                <SelectContent>
                  {plans && plans.length > 0 ? (
                    plans.map((p) => (
                      <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                    ))
                  ) : (
                    <>
                      <SelectItem value="plan_starter">Inicial ($49/mes)</SelectItem>
                      <SelectItem value="plan_business">Negocios ($199/mes)</SelectItem>
                      <SelectItem value="plan_enterprise">Corporativo ($999/mes)</SelectItem>
                    </>
                  )}
                </SelectContent>
              </Select>
            </div>

            {!tenant && (
              <div className="mt-4 pt-4 border-t border-border/50 space-y-4">
                <p className="text-[10px] font-bold uppercase tracking-widest text-primary/70">Administrador Inicial</p>
                <div className="grid gap-2">
                  <Label htmlFor="adminName" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">Nombre Completo</Label>
                  <div className="relative group">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50 group-focus-within:text-primary transition-colors" />
                    <Input 
                      id="adminName" 
                      value={adminName} 
                      onChange={(e) => setAdminName(e.target.value)} 
                      placeholder="Ej. Juan Pérez" 
                      className="pl-10 bg-muted/20 border-border h-11 focus-visible:ring-primary/20" 
                      required={!tenant}
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="adminEmail" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">Email Corporativo</Label>
                  <div className="relative group">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50 group-focus-within:text-primary transition-colors" />
                    <Input 
                      id="adminEmail" 
                      type="email"
                      value={adminEmail} 
                      onChange={(e) => setAdminEmail(e.target.value)} 
                      placeholder="admin@empresa.com" 
                      className="pl-10 bg-muted/20 border-border h-11 focus-visible:ring-primary/20" 
                      required={!tenant}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
          <DialogFooter className="bg-muted/5 p-6 border-t border-border/30 rounded-b-lg">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} disabled={isSubmitting} className="text-muted-foreground hover:text-foreground">
              Cancelar
            </Button>
            <Button type="submit" className="bg-primary text-primary-foreground font-bold shadow-lg shadow-primary/20 px-6" disabled={isSubmitting}>
              {isSubmitting ? (
                 <div className="flex items-center gap-2">
                   <Loader2 className="h-4 w-4 animate-spin" />
                   {tenant ? 'Actualizando...' : 'Provisionando...'}
                 </div>
              ) : (tenant ? "Guardar Cambios" : "Crear Empresa")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
