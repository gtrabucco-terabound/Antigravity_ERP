'use server';
/**
 * @fileOverview Implementa un flujo Genkit para generar un perfil inicial de tenante
 * basado en una descripción del negocio.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateTenantProfileInputSchema = z.object({
  businessOverview: z
    .string()
    .describe("Un breve resumen del negocio del tenante, su industria y operaciones principales."),
});
export type GenerateTenantProfileInput = z.infer<typeof GenerateTenantProfileInputSchema>;

const GenerateTenantProfileOutputSchema = z.object({
  suggestedTenantName: z.string().describe('Un nombre sugerido para el tenante.'),
  suggestedTenantDescription: z
    .string()
    .describe("Una breve descripción del negocio del tenante."),
  initialPlanRecommendation: z
    .string()
    .describe('Una recomendación de plan de suscripción inicial basada en el resumen del negocio.'),
});
export type GenerateTenantProfileOutput = z.infer<typeof GenerateTenantProfileOutputSchema>;

export async function generateTenantProfile(
  input: GenerateTenantProfileInput
): Promise<GenerateTenantProfileOutput> {
  return generateTenantProfileFlow(input);
}

const generateTenantProfilePrompt = ai.definePrompt({
  name: 'generateTenantProfilePrompt',
  input: {schema: GenerateTenantProfileInputSchema},
  output: {schema: GenerateTenantProfileOutputSchema},
  prompt: `Eres un asistente de IA diseñado para ayudar a los administradores de la plataforma a provisionar nuevos tenantes para el ERP "Terabound".
Basado en el resumen del negocio proporcionado, genera un perfil inicial del tenante en ESPAÑOL.

Resumen del Negocio:
{{{businessOverview}}}`,
});

const generateTenantProfileFlow = ai.defineFlow(
  {
    name: 'generateTenantProfileFlow',
    inputSchema: GenerateTenantProfileInputSchema,
    outputSchema: GenerateTenantProfileOutputSchema,
  },
  async input => {
    const {output} = await generateTenantProfilePrompt(input);
    return output!;
  }
);
