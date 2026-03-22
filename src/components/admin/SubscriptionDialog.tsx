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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useFirestore, useCollection } from '@/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { Loader2, CreditCard } from "lucide-react";

interface Tenant {
  id: string;
  name: string;
}

interface Plan {
  id: string;
  name: string;
  price: number;
}

interface SubscriptionDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  defaultTenantId?: string;
  onSuccess?: () => void;
}

export function SubscriptionDialog({ isOpen, onOpenChange, defaultTenantId, onSuccess }: SubscriptionDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tenantId, setTenantId] = useState(defaultTenantId || '');
  const [planId, setPlanId] = useState('plan_starter');
  const [amount, setAmount] = useState('49');
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  
  const firestore = useFirestore();
  const tenantsQuery = useMemo(() => collection(firestore, '_gl_tenants'), [firestore]);
  const { data: tenants } = useCollection<Tenant>(tenantsQuery as any);

  const plansQuery = useMemo(() => collection(firestore, '_gl_plans'), [firestore]);
  const { data: plans } = useCollection<Plan>(plansQuery as any);

  useEffect(() => {
    if (defaultTenantId) {
      setTenantId(defaultTenantId);
    }
  }, [defaultTenantId, isOpen]);

  // Ajustar monto automático al cambiar plan
  useEffect(() => {
    const selectedPlan = plans.find(p => p.id === planId);
    if (selectedPlan) {
      setAmount(selectedPlan.price.toString());
    }
  }, [planId, plans]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isSubmitting || !tenantId) return;

    setIsSubmitting(true);

    try {
      const nextBillingDate = new Date();
      if (billingCycle === 'monthly') {
        nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);
      } else {
        nextBillingDate.setFullYear(nextBillingDate.getFullYear() + 1);
      }

      const docRef = await addDoc(collection(firestore, '_gl_subscriptions'), {
        tenantId,
        planId,
        amount: parseFloat(amount),
        billingCycle,
        status: 'active',
        nextBilling: nextBillingDate.toISOString(),
        createdAt: new Date().toISOString(),
        serverTimestamp: serverTimestamp()
      });

      // Log de auditoría
      await addDoc(collection(firestore, '_gl_audit_logs'), {
        action: 'create',
        type: 'info',
        message: `Nueva suscripción activada para el tenante ID: ${tenantId}`,
        timestamp: serverTimestamp(),
        targetId: docRef.id,
        targetCollection: '_gl_subscriptions',
        userId: 'system'
      });

      if (onSuccess) onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error("Error creating subscription:", error);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-card border-border shadow-2xl">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="text-primary text-xl flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Nueva Suscripción
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Configure los parámetros de facturación para el tenante seleccionado.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-5 py-6">
            <div className="grid gap-2">
              <Label htmlFor="tenantId" className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Tenante</Label>
              <Select value={tenantId} onValueChange={setTenantId} disabled={!!defaultTenantId} required>
                <SelectTrigger className="bg-muted/20 border-border h-11">
                  <SelectValue placeholder="Seleccione un tenante" />
                </SelectTrigger>
                <SelectContent>
                  {tenants.map((t) => (
                    <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="planId" className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Plan</Label>
                <Select value={planId} onValueChange={setPlanId} required>
                  <SelectTrigger className="bg-muted/20 border-border h-11">
                    <SelectValue placeholder="Seleccione plan" />
                  </SelectTrigger>
                  <SelectContent>
                    {plans.map((p) => (
                      <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="billingCycle" className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Ciclo</Label>
                <Select value={billingCycle} onValueChange={(v: any) => setBillingCycle(v)} required>
                  <SelectTrigger className="bg-muted/20 border-border h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">Mensual</SelectItem>
                    <SelectItem value="yearly">Anual</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="amount" className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Monto (USD)</Label>
              <Input 
                id="amount" 
                type="number" 
                value={amount} 
                onChange={(e) => setAmount(e.target.value)}
                className="bg-muted/20 border-border h-11 font-mono font-bold text-primary" 
                required 
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting} className="border-border">
              Cancelar
            </Button>
            <Button type="submit" className="bg-primary text-primary-foreground font-bold shadow-lg shadow-primary/20" disabled={isSubmitting}>
              {isSubmitting ? (
                 <div className="flex items-center gap-2">
                   <Loader2 className="h-4 w-4 animate-spin" />
                   Procesando...
                 </div>
              ) : "Activar Suscripción"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
