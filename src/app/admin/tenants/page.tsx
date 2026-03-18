import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { MOCK_TENANTS, MOCK_PLANS } from "@/app/lib/mock-data";
import { Search, UserPlus, MoreVertical, ShieldAlert, CheckCircle2, Globe2 } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";

export default function TenantsPage() {
  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Tenants</h1>
          <p className="text-muted-foreground">Manage multi-tenant isolation and account lifecycle.</p>
        </div>
        <Button className="gap-2">
          <UserPlus className="h-4 w-4" />
          Provision New Tenant
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search tenants by name, ID or country..." className="pl-10 max-w-md bg-card" />
        </div>
        <div className="flex items-center gap-2">
           <Badge variant="outline" className="px-3 py-1 bg-card">All: {MOCK_TENANTS.length}</Badge>
           <Badge variant="outline" className="px-3 py-1 bg-green-500/10 text-green-500 border-green-500/20">Active: {MOCK_TENANTS.filter(t => t.status === 'active').length}</Badge>
           <Badge variant="outline" className="px-3 py-1 bg-red-500/10 text-red-500 border-red-500/20">Suspended: {MOCK_TENANTS.filter(t => t.status === 'suspended').length}</Badge>
        </div>
      </div>

      <Card className="border-border/50 bg-card/50 overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead className="w-[250px]">Tenant Name</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Region</TableHead>
              <TableHead>Plan</TableHead>
              <TableHead>Modules</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {MOCK_TENANTS.map((tenant) => (
              <TableRow key={tenant.id} className="hover:bg-muted/30 transition-colors">
                <TableCell className="font-medium">
                  <div className="flex flex-col">
                    <span>{tenant.name}</span>
                    <span className="text-xs text-muted-foreground font-mono">{tenant.id}</span>
                  </div>
                </TableCell>
                <TableCell>
                  {tenant.status === 'active' ? (
                    <div className="flex items-center gap-1.5 text-green-500">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span className="text-xs font-semibold uppercase">Active</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 text-red-500">
                      <ShieldAlert className="h-3.5 w-3.5" />
                      <span className="text-xs font-semibold uppercase">Suspended</span>
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Globe2 className="h-3.5 w-3.5 text-muted-foreground" />
                    {tenant.country}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary" className="font-medium">
                    {MOCK_PLANS.find(p => p.id === tenant.planId)?.name}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex -space-x-2">
                    {tenant.activeModules.slice(0, 3).map((modId) => (
                      <div key={modId} className="h-7 w-7 rounded-full border-2 border-background bg-primary/20 flex items-center justify-center text-[10px] font-bold" title={modId}>
                        {modId.split('_')[1].toUpperCase().slice(0, 2)}
                      </div>
                    ))}
                    {tenant.activeModules.length > 3 && (
                      <div className="h-7 w-7 rounded-full border-2 border-background bg-muted flex items-center justify-center text-[10px] font-bold">
                        +{tenant.activeModules.length - 3}
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground text-xs">
                  {new Date(tenant.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem>View Details</DropdownMenuItem>
                      <DropdownMenuItem>Edit Configuration</DropdownMenuItem>
                      <DropdownMenuItem>Manage Subscriptions</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      {tenant.status === 'active' ? (
                        <DropdownMenuItem className="text-destructive">Suspend Tenant</DropdownMenuItem>
                      ) : (
                        <DropdownMenuItem className="text-green-500">Reactivate Tenant</DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}