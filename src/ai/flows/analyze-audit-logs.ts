'use server';
/**
 * @fileOverview Este archivo contiene el flujo Genkit para analizar registros de auditoría globales.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AuditLogEntrySchema = z.object({
  action: z.string().describe('La acción realizada.'),
  adminId: z.string().describe('El ID del administrador que realizó la acción.'),
  entity: z.string().describe('El tipo de entidad afectada (ej., Tenante, Módulo, Plan).'),
  entityId: z.string().describe('El ID de la entidad afectada.'),
  timestamp: z.string().datetime().describe('La marca de tiempo de la acción en formato ISO 8601.'),
});

const AnalyzeAuditLogsInputSchema = z.object({
  auditLogs: z.array(AuditLogEntrySchema).describe('Un array de entradas de log de auditoría global para analizar.'),
});
export type AnalyzeAuditLogsInput = z.infer<typeof AnalyzeAuditLogsInputSchema>;

const AnalyzeAuditLogsOutputSchema = z.object({
  summary: z.string().describe('Un resumen conciso de acciones críticas y actividad de gobernanza de la plataforma.'),
  unusualPatterns: z.array(z.string()).describe('Una lista de cualquier patrón inusual o sospechoso identificado.'),
});
export type AnalyzeAuditLogsOutput = z.infer<typeof AnalyzeAuditLogsOutputSchema>;

export async function analyzeAuditLogs(input: AnalyzeAuditLogsInput): Promise<AnalyzeAuditLogsOutput> {
  return analyzeAuditLogsFlow(input);
}

const analyzeAuditLogsPrompt = ai.definePrompt({
  name: 'analyzeAuditLogsPrompt',
  input: {schema: AnalyzeAuditLogsInputSchema},
  output: {schema: AnalyzeAuditLogsOutputSchema},
  prompt: `Eres un asistente de IA que actúa como analista de seguridad y experto en gobernanza de la plataforma ERP "Terabound".
Tu tarea es analizar las entradas de log de auditoría proporcionadas y ofrecer un resumen conciso en español de las acciones críticas y resaltar cualquier patrón inusual o preocupación de seguridad.

Considera lo siguiente al analizar:
- Busca acciones administrativas comunes como creación de tenantes, suspensiones, activación de módulos, cambios de plan, etc.
- Identifica cualquier acción repetida por el mismo admin en un corto periodo.
- Busca acciones que puedan indicar acceso no autorizado o comportamiento administrativo inusual.

Registros de Auditoría:
{{#each auditLogs}}
  - Acción: {{{this.action}}}, Admin: {{{this.adminId}}}, Entidad: {{{this.entity}}}:{{{this.entityId}}}, Fecha: {{{this.timestamp}}}
{{/each}}`,
});

const analyzeAuditLogsFlow = ai.defineFlow(
  {
    name: 'analyzeAuditLogsFlow',
    inputSchema: AnalyzeAuditLogsInputSchema,
    outputSchema: AnalyzeAuditLogsOutputSchema,
  },
  async input => {
    const {output} = await analyzeAuditLogsPrompt(input);
    return output!;
  }
);
