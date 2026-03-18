import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MOCK_PLANS } from "@/app/lib/mock-data";
import { CreditCard, Check, Settings2, Plus, ArrowRight } from "lucide-react";

export default function PlansPage() {
  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Planes de Suscripción</h1>
          <p className="text-muted-foreground">Definir estructuras de niveles y precios globales.</p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Crear Plan Global
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {MOCK_PLANS.map((plan) => (
          <Card key={plan.id} className={`border-border/50 bg-card/50 flex flex-col relative overflow-hidden ${plan.id === 'plan_enterprise' ? 'border-primary/50' : ''}`}>
            {plan.id === 'plan_enterprise' && (
              <div className="absolute top-0 right-0">
                 <div className="bg-primary text-[10px] font-bold text-white px-3 py-1 rounded-bl-lg uppercase tracking-widest shadow-lg">Popular</div>
              </div>
            )}
            <CardHeader>
              <CardTitle className="text-2xl">{plan.name}</CardTitle>
              <CardDescription>ID del Plan: {plan.id}</CardDescription>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-4xl font-bold">${plan.price}</span>
                <span className="text-muted-foreground">/mes</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-6 flex-1">
              <div className="space-y-3">
                <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider">Módulos Incluidos</div>
                <div className="grid gap-2">
                  {plan.modulesIncluded.map((modId) => (
                    <div key={modId} className="flex items-center gap-2 text-sm">
                      <div className="h-5 w-5 rounded-full bg-green-500/10 flex items-center justify-center text-green-500">
                        <Check className="h-3 w-3" />
                      </div>
                      {modId.split('_')[1].toUpperCase()} Núcleo
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider">Límites de Uso</div>
                <div className="grid gap-2">
                  {Object.entries(plan.limits).map(([key, value]) => (
                    <div key={key} className="flex justify-between text-sm py-1 border-b border-border/30">
                      <span className="text-muted-foreground capitalize">{key === 'users' ? 'usuarios' : key === 'storage' ? 'almacenamiento' : key}</span>
                      <span className="font-semibold">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
            <CardFooter className="p-6 pt-0">
              <Button variant={plan.id === 'plan_enterprise' ? 'default' : 'outline'} className="w-full gap-2">
                <Settings2 className="h-4 w-4" />
                Configurar Nivel
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
