'use server';
/**
 * @fileOverview This file implements a Genkit flow to generate an initial tenant profile
 * based on a business overview.
 *
 * - generateTenantProfile - A function that handles the tenant profile generation process.
 * - GenerateTenantProfileInput - The input type for the generateTenantProfile function.
 * - GenerateTenantProfileOutput - The return type for the generateTenantProfile function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateTenantProfileInputSchema = z.object({
  businessOverview: z
    .string()
    .describe("A brief overview of the tenant's business, its industry, and core operations."),
});
export type GenerateTenantProfileInput = z.infer<typeof GenerateTenantProfileInputSchema>;

const GenerateTenantProfileOutputSchema = z.object({
  suggestedTenantName: z.string().describe('A suggested name for the tenant.'),
  suggestedTenantDescription: z
    .string()
    .describe("A brief description of the tenant's business."),
  initialPlanRecommendation: z
    .string()
    .describe('A recommendation for an initial subscription plan based on the business overview.'),
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
  prompt: `You are an AI assistant designed to help platform administrators provision new tenants for the "Terabound" ERP platform.
Based on the provided business overview, generate an initial tenant profile.
Your output must be a JSON object matching the following schema. Use the descriptions in the schema to guide your output.

Business Overview:
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
