'use client';

import { useState, useMemo } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ClipboardList, Sparkles, AlertTriangle, Info, Clock, User, Loader2 } from "lucide-react";
import { useFirestore, useCollection } from '@/firebase';
import { collection, query, orderBy, limit } from 'firebase/firestore';
import { analyzeAuditLogs, AnalyzeAuditLogsOutput } from "@/ai/flows/analyze-audit-logs";
import { useToast } from "@/hooks/use-toast";

interface AuditLog {
  id: string;
  action: string;
  userId: string;
  message: string;
  type: 'info' | 'warning' | 'error';
  targetId?: string;
  targetCollection?: string;
  timestamp: any; // Firestore Timestamp
}

export default function AuditLogPage() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiResult, setAiResult] = useState<AnalyzeAuditLogsOutput | null>(null);
  const { toast } = useToast();
  
  const firestore = useFirestore();
  const logsQuery = useMemo(() => 
    firestore ? query(collection(firestore, '_gl_audit_logs'), orderBy('timestamp', 'desc'), limit(50)) : null
  , [firestore]);
  
  const { data: logs, loading } = useCollection<AuditLog>(logsQuery as any);

  const handleIAAnalysis = async () => {
    if (logs.length === 0) return;
    
    setIsAnalyzing(true);
    try {
      // Mapear logs al formato que espera el flujo de IA
      const auditLogsForAI = logs.map(log => ({
        action: log.action.toUpperCase(),
        adminId: log.userId,
        entity: log.targetCollection || 'Unknown',
        entityId: log.targetId || 'N/A',
        timestamp: log.timestamp?.toDate?.()?.toISOString() || new Date().toISOString()
      }));

      const result = await analyzeAuditLogs({ auditLogs: auditLogsForAI });
      setAiResult(result);
      
      toast({
        title: "Análisis Completado",
        description: "La IA ha procesado los registros de auditoría recientes.",
      });
    } catch (error) {
      console.error("Error en análisis IA:", error);
      toast({
        title: "Error de Análisis",
        description: "No se pudo completar el análisis de seguridad.",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getActionBadge = (action: string) => {
    const act = action.toLowerCase();
    if (act.includes('create') || act.includes('provision')) 
      return <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20 font-bold uppercase text-[10px]">CREAR</Badge>;
    if (act.includes('update') || act.includes('edit')) 
      return <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20 font-bold uppercase text-[10px]">ACTUALIZAR</Badge>;
    if (act.includes('delete') || act.includes('suspend') || act.includes('error')) 
      return <Badge className="bg-red-500/10 text-red-500 border-red-500/20 font-bold uppercase text-[10px]">PELIGRO</Badge>;
    return <Badge variant="secondary" className="font-bold uppercase text-[10px]">{action}</Badge>;
  };

  const formatTimestamp = (ts: any) => {
    if (!ts) return '---';
    const date = ts.toDate ? ts.toDate() : new Date(ts);
    return date.toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-700">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-4xl font-black tracking-tight">Logs de Auditoría</h1>
          <p className="text-muted-foreground text-lg font-medium">Registro global de acciones administrativas para cumplimiento normativo.</p>
        </div>
        <Button 
          onClick={handleIAAnalysis}
          disabled={isAnalyzing || logs.length === 0}
          className="h-12 px-6 gap-2 bg-primary text-primary-foreground font-black hover:bg-primary/90 shadow-lg shadow-primary/20 rounded-xl"
        >
          {isAnalyzing ? <Loader2 className="h-5 w-5 animate-spin" /> : <Sparkles className="h-5 w-5" />}
          {isAnalyzing ? "Analizando Patrones..." : "Análisis de Seguridad IA"}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <Card className="lg:col-span-3 border-border/50 bg-card/30 backdrop-blur-xl shadow-2xl rounded-3xl overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow className="border-border/50">
                  <TableHead className="py-5 font-bold uppercase tracking-widest text-[10px]">Marca de Tiempo</TableHead>
                  <TableHead className="py-5 font-bold uppercase tracking-widest text-[10px]">Acción</TableHead>
                  <TableHead className="py-5 font-bold uppercase tracking-widest text-[10px]">Usuario</TableHead>
                  <TableHead className="py-5 font-bold uppercase tracking-widest text-[10px]">Descripción / Mensaje</TableHead>
                  <TableHead className="py-5 font-bold uppercase tracking-widest text-[10px]">ID Objetivo</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-64 text-center">
                      <div className="flex flex-col items-center justify-center gap-3">
                        <Loader2 className="h-8 w-8 text-primary animate-spin" />
                        <p className="text-muted-foreground font-bold uppercase tracking-widest text-[10px]">Sincronizando logs...</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : logs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-64 text-center">
                      <p className="text-muted-foreground italic">No se encontraron registros de auditoría.</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  logs.map((log) => (
                    <TableRow key={log.id} className="hover:bg-primary/5 transition-colors border-border/20 border-b">
                      <TableCell className="text-[11px] text-muted-foreground font-medium">
                        <div className="flex items-center gap-2">
                          <Clock className="h-3.5 w-3.5 text-primary/50" />
                          {formatTimestamp(log.timestamp)}
                        </div>
                      </TableCell>
                      <TableCell>
                        {getActionBadge(log.action)}
                      </TableCell>
                      <TableCell className="font-bold text-sm">
                        <div className="flex items-center gap-2">
                          <div className="h-7 w-7 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                            <User className="h-4 w-4 text-primary" />
                          </div>
                          {log.userId === 'system' ? 'Sistema' : log.userId}
                        </div>
                      </TableCell>
                      <TableCell className="max-w-[300px]">
                        <span className="text-sm font-medium leading-relaxed">{log.message}</span>
                      </TableCell>
                      <TableCell className="font-mono text-[10px] text-muted-foreground">
                        {log.targetId || '---'}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </Card>

        <div className="space-y-6">
          <Card className={`border-primary/20 bg-primary/5 backdrop-blur-md rounded-3xl transition-all duration-500 ${isAnalyzing ? 'pulse' : ''}`}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-black flex items-center gap-2 text-primary uppercase tracking-[0.2em]">
                <Sparkles className="h-4 w-4" />
                Resumen de Seguridad IA
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              {aiResult ? (
                <>
                  <p className="text-xs text-muted-foreground leading-relaxed font-medium">
                    {aiResult.summary}
                  </p>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">
                      Hallazgos Críticos
                    </div>
                    {aiResult.unusualPatterns.length > 0 ? (
                      aiResult.unusualPatterns.map((pattern, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-xs text-amber-500 bg-amber-500/10 p-2.5 rounded-xl border border-amber-500/20">
                          <AlertTriangle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                          <span className="font-bold">{pattern}</span>
                        </div>
                      ))
                    ) : (
                      <div className="flex items-center gap-2 text-xs text-blue-500 bg-blue-500/10 p-2.5 rounded-xl border border-blue-500/20">
                        <Info className="h-3.5 w-3.5" />
                        <span className="font-bold">No se detectaron anomalías</span>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="py-8 text-center space-y-4">
                  <div className="h-12 w-12 rounded-full bg-muted/20 flex items-center justify-center mx-auto border border-border/50">
                    <ClipboardList className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <p className="text-[11px] text-muted-foreground font-medium italic px-4">
                    Haga clic en el botón de análisis para procesar los patrones de seguridad recientes con Gemini.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/20 backdrop-blur-md rounded-3xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold uppercase tracking-widest">Estado del Almacén</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  <span>Volumen de Logs</span>
                  <span className="text-primary">ACTIVO</span>
                </div>
                <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-primary animate-pulse w-[45%]" />
                </div>
                <div className="flex items-center gap-2 p-3 rounded-xl bg-muted/20 border border-border/30">
                  <Clock className="h-4 w-4 text-primary" />
                  <span className="text-[10px] font-bold text-muted-foreground leading-tight uppercase tracking-wider">
                    Retención: 365 Días (Compliance P-102)
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
