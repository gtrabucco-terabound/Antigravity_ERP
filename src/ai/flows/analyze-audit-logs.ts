'use server';
/**
 * @fileOverview This file contains the Genkit flow for analyzing global audit logs.
 *
 * - analyzeAuditLogs - A function that provides an AI-powered summary of audit logs.
 * - AnalyzeAuditLogsInput - The input type for the analyzeAuditLogs function.
 * - AnalyzeAuditLogsOutput - The return type for the analyzeAuditLogs function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AuditLogEntrySchema = z.object({
  action: z.string().describe('The action performed.'),
  adminId: z.string().describe('The ID of the administrator who performed the action.'),
  entity: z.string().describe('The type of entity affected (e.g., Tenant, Module, Plan).'),
  entityId: z.string().describe('The ID of the entity affected.'),
  timestamp: z.string().datetime().describe('The timestamp of the action in ISO 8601 format.'),
});

const AnalyzeAuditLogsInputSchema = z.object({
  auditLogs: z.array(AuditLogEntrySchema).describe('An array of global audit log entries to analyze.'),
});
export type AnalyzeAuditLogsInput = z.infer<typeof AnalyzeAuditLogsInputSchema>;

const AnalyzeAuditLogsOutputSchema = z.object({
  summary: z.string().describe('A concise summary of critical actions and platform governance activity.'),
  unusualPatterns: z.array(z.string()).describe('A list of any unusual or suspicious patterns identified in the audit logs.'),
});
export type AnalyzeAuditLogsOutput = z.infer<typeof AnalyzeAuditLogsOutputSchema>;

export async function analyzeAuditLogs(input: AnalyzeAuditLogsInput): Promise<AnalyzeAuditLogsOutput> {
  return analyzeAuditLogsFlow(input);
}

const analyzeAuditLogsPrompt = ai.definePrompt({
  name: 'analyzeAuditLogsPrompt',
  input: {schema: AnalyzeAuditLogsInputSchema},
  output: {schema: AnalyzeAuditLogsOutputSchema},
  prompt: `You are an AI assistant acting as a security analyst and platform governance expert for the Terabound ERP platform.
Your task is to analyze the provided global audit log entries and provide a concise summary of critical actions and highlight any unusual patterns or security concerns.

Consider the following when analyzing:
- Look for common administrative actions like tenant creation, suspension, module activation, plan changes, etc.
- Identify any repeated actions by the same admin within a short period.
- Look for actions that might indicate unauthorized access or unusual administrative behavior.
- Pay attention to changes in critical entities like _gl_tenants, _gl_module_catalog, _gl_plans, and _gl_subscriptions.

Audit Logs:
{{#each auditLogs}}
  - Action: {{{this.action}}}, Admin: {{{this.adminId}}}, Entity: {{{this.entity}}}:{{{this.entityId}}}, Timestamp: {{{this.timestamp}}}
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
