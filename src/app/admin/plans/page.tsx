'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useFirestore, useCollection } from '@/firebase';
import { collection } from 'firebase/firestore';
import { CreditCard, Check, Settings2, Plus, Loader2 } from "lucide-react";
import { PlanDialog } from '@/components/admin/PlanDialog';

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

interface Module {
  id: string;
  name: string;
}

export default function PlansPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  
  const firestore = useFirestore();
  const plansQuery = useMemo(() => collection(firestore, '_gl_plans'), [firestore]);
  const { data: plans, loading: loadingPlans } = useCollection<Plan>(plansQuery as any);

  const modulesQuery = useMemo(() => collection(firestore, '_gl_modules'), [firestore]);
  const { data: modules } = useCollection<Module>(modulesQuery as any);

  const handleCreatePlan = () => {
    setSelectedPlan(null);
    setIsDialogOpen(true);
  };

  const handleEditPlan = (plan: Plan) => {
    setSelectedPlan(plan);
    setIsDialogOpen(true);
  };

  const getModuleName = (modId: string) => {
    return modules.find(m => m.id === modId)?.name || modId;
  };

  return (
    <div className="p-8 space-y-10 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-4xl font-black tracking-tight">Planes de Suscripción</h1>
          <p className="text-muted-foreground text-lg">Definir estructuras de niveles y precios globales.</p>
        </div>
        <Button 
          onClick={handleCreatePlan}
          className="h-12 px-6 bg-primary text-primary-foreground font-bold hover:bg-primary/90 shadow-lg shadow-primary/20 gap-2 rounded-xl"
        >
          <Plus className="h-5 w-5" />
          Crear Plan Global
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {loadingPlans ? (
          <div className="col-span-full py-32 flex flex-col items-center justify-center space-y-4">
            <Loader2 className="h-10 w-10 text-primary animate-spin" />
            <p className="text-muted-foreground font-medium uppercase tracking-widest text-[10px]">Cargando matriz de niveles...</p>
          </div>
        ) : plans.length === 0 ? (
          <div className="col-span-full py-32 text-center border-2 border-dashed border-border/30 rounded-3xl">
             <CreditCard className="h-12 w-12 text-muted-foreground/20 mx-auto mb-4" />
             <h3 className="text-xl font-bold">No hay planes definidos</h3>
             <p className="text-muted-foreground mb-6">Comience creando un nuevo plan global para su ecosistema.</p>
             <Button onClick={handleCreatePlan} variant="outline" className="border-primary/50 text-primary">Añadir Primer Plan</Button>
          </div>
        ) : (
          [...plans].sort((a, b) => a.price - b.price).map((plan) => (
            <Card 
              key={plan.id} 
              className={`border-border/50 bg-card/20 backdrop-blur-md flex flex-col relative overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-primary/5 group rounded-3xl ${
                plan.id.includes('enterprise') || plan.id.includes('corporativo') ? 'border-primary shadow-2xl shadow-primary/10 ring-1 ring-primary/20' : ''
              }`}
            >
              {(plan.id.includes('enterprise') || plan.id.includes('corporativo')) && (
                <div className="absolute top-0 right-0 z-10">
                   <div className="bg-primary text-[10px] font-black text-primary-foreground px-4 py-1.5 rounded-bl-xl uppercase tracking-[0.2em] shadow-lg">Popular</div>
                </div>
              )}
              <CardHeader className="p-8">
                <CardTitle className="text-3xl font-black group-hover:text-primary transition-colors">{plan.name}</CardTitle>
                <CardDescription className="font-mono text-[10px] uppercase tracking-widest opacity-60">ID: {plan.id}</CardDescription>
                <div className="mt-8 flex items-baseline gap-1">
                  <span className="text-5xl font-black tracking-tighter">${plan.price}</span>
                  <span className="text-muted-foreground font-medium uppercase text-xs tracking-widest">/mes</span>
                </div>
              </CardHeader>
              <CardContent className="px-8 pb-8 space-y-8 flex-1">
                  <div className="space-y-4">
                  <div className="text-[10px] font-black uppercase text-muted-foreground/50 tracking-[0.2em]">Módulos Incluidos</div>
                  <div className="flex flex-wrap gap-2">
                    {plan.modulesIncluded?.map((modId) => (
                      <Badge 
                        key={modId} 
                        variant="secondary" 
                        className="bg-primary/10 hover:bg-primary/20 text-primary border-primary/20 text-[10px] font-bold px-3 py-1 rounded-lg transition-colors"
                      >
                        {getModuleName(modId)}
                      </Badge>
                    ))}
                    {(!plan.modulesIncluded || plan.modulesIncluded.length === 0) && (
                      <span className="text-xs italic text-muted-foreground/40">Sin módulos asignados</span>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="text-[10px] font-black uppercase text-muted-foreground/50 tracking-[0.2em]">Límites de Uso</div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm py-2 border-b border-border/20">
                      <span className="text-muted-foreground font-medium">Usuarios</span>
                      <span className="font-bold text-primary">{plan.limits?.users === 'Ilimitado' ? 'Ilimitado' : plan.limits?.users}</span>
                    </div>
                    <div className="flex justify-between text-sm py-2 border-b border-border/20">
                      <span className="text-muted-foreground font-medium">Almacenamiento</span>
                      <span className="font-bold text-primary">{plan.limits?.storage}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="p-8 pt-0">
                <Button 
                  onClick={() => handleEditPlan(plan)}
                  variant={(plan.id.includes('enterprise') || plan.id.includes('corporativo')) ? 'default' : 'outline'} 
                  className={`w-full h-12 gap-2 font-bold rounded-xl transition-all ${
                    (plan.id.includes('enterprise') || plan.id.includes('corporativo')) 
                    ? 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20' 
                    : 'border-border/50 hover:bg-primary hover:text-primary-foreground hover:border-primary'
                  }`}
                >
                  <Settings2 className="h-4 w-4" />
                  Configurar Nivel
                </Button>
              </CardFooter>
            </Card>
          ))
        )}
      </div>

      <PlanDialog 
        isOpen={isDialogOpen} 
        onOpenChange={setIsDialogOpen} 
        plan={selectedPlan}
      />
    </div>
  );
}
