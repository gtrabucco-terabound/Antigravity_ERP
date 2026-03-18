import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MOCK_AUDIT_LOGS } from "@/app/lib/mock-data";
import { ClipboardList, Sparkles, AlertTriangle, Info, Clock, User } from "lucide-react";
import { analyzeAuditLogs } from "@/ai/flows/analyze-audit-logs";

export default async function AuditLogPage() {
  // In a real app, this would be a client component using a Server Action trigger, 
  // but for the static design demo, we'll simulate the AI input structure.
  
  const getActionBadge = (action: string) => {
    if (action.includes('CREATE')) return <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20">CREATE</Badge>;
    if (action.includes('UPDATE')) return <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20">UPDATE</Badge>;
    if (action.includes('DELETE') || action.includes('SUSPEND')) return <Badge className="bg-red-500/10 text-red-500 border-red-500/20">DANGER</Badge>;
    return <Badge variant="secondary">{action}</Badge>;
  };

  return (
    <div className="p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Audit Logs</h1>
          <p className="text-muted-foreground">Global record of administrative actions for platform compliance.</p>
        </div>
        <Button variant="outline" className="gap-2 border-primary/20 bg-primary/5 hover:bg-primary/10 text-primary">
          <Sparkles className="h-4 w-4" />
          AI Security Analysis
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <Card className="lg:col-span-3 border-border/50 bg-card/50">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead>Timestamp</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Administrator</TableHead>
                <TableHead>Target Entity</TableHead>
                <TableHead>Entity ID</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {MOCK_AUDIT_LOGS.map((log) => (
                <TableRow key={log.id} className="hover:bg-muted/30">
                  <TableCell className="text-xs text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Clock className="h-3 w-3" />
                      {new Date(log.timestamp).toLocaleString()}
                    </div>
                  </TableCell>
                  <TableCell>
                    {getActionBadge(log.action)}
                  </TableCell>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center">
                        <User className="h-3 w-3 text-primary" />
                      </div>
                      {log.adminId}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">{log.entity}</span>
                  </TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {log.entityId}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>

        <div className="space-y-6">
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold flex items-center gap-2 text-primary">
                <Sparkles className="h-4 w-4" />
                AI Insight Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-xs text-muted-foreground leading-relaxed">
                Platform governance activity is consistent with standard operating procedures. No critical escalation patterns detected in the last 24 hours.
              </p>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  Anomalies Detected
                </div>
                <div className="flex items-center gap-2 text-xs text-amber-500">
                  <AlertTriangle className="h-3 w-3" />
                  Multiple plan updates (3) for Global Ltd
                </div>
                <div className="flex items-center gap-2 text-xs text-blue-500">
                  <Info className="h-3 w-3" />
                  New tenant provisioning peaked at 10:00 AM
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold">Log Retention</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Storage Used</span>
                  <span className="font-medium">1.2 GB</span>
                </div>
                <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-primary w-[30%]" />
                </div>
                <p className="text-[10px] text-muted-foreground">
                  Logs are retained for 365 days per compliance policy P-102.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}