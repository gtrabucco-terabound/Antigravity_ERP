import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MOCK_MODULES } from "@/app/lib/mock-data";
import { Box, Code2, Link2, ExternalLink, PlusCircle, Power, RefreshCcw } from "lucide-react";

export default function ModulesPage() {
  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Module Catalog</h1>
          <p className="text-muted-foreground">Global micro-frontend registry for tenant deployment.</p>
        </div>
        <Button className="gap-2">
          <PlusCircle className="h-4 w-4" />
          Register New Module
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {MOCK_MODULES.map((module) => (
          <Card key={module.id} className="border-border/50 bg-card/50 group overflow-hidden flex flex-col">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
                  <Box className="h-5 w-5 text-primary" />
                </div>
                <Badge variant={module.status === 'active' ? 'default' : 'secondary'}>
                  {module.status.toUpperCase()}
                </Badge>
              </div>
              <CardTitle className="text-xl">{module.name}</CardTitle>
              <CardDescription className="font-mono text-xs">{module.id}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 flex-1">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Version</span>
                <Badge variant="outline" className="font-mono">{module.version}</Badge>
              </div>
              
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase text-muted-foreground tracking-wider">Source Remote</span>
                <div className="flex items-center gap-2 p-2 rounded bg-background/50 border border-border text-xs font-mono truncate">
                  <Link2 className="h-3 w-3 shrink-0" />
                  {module.remoteUrl}
                </div>
              </div>

              {module.dependencies.length > 0 && (
                <div className="space-y-2">
                  <span className="text-xs font-bold uppercase text-muted-foreground tracking-wider">Dependencies</span>
                  <div className="flex flex-wrap gap-1">
                    {module.dependencies.map(dep => (
                      <Badge key={dep} variant="secondary" className="text-[10px] h-5">{dep}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter className="pt-0 border-t border-border/20 bg-muted/20 flex gap-2 p-4">
              <Button variant="outline" size="sm" className="flex-1 gap-2">
                <Code2 className="h-3.5 w-3.5" />
                Inspect
              </Button>
              <Button variant="secondary" size="sm" className="flex-1 gap-2">
                <RefreshCcw className="h-3.5 w-3.5" />
                Update
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}