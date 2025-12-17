'use server';

/**
 * @fileOverview An AI agent that reviews fund deadlines for wording that may cause unintentional stress to students.
 *
 * - reviewFundDeadline - A function that handles the fund deadline review process.
 * - FundDeadlineReviewInput - The input type for the reviewFundDeadline function.
 * - FundDeadlineReviewOutput - The return type for the reviewFundDeadline function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const FundDeadlineReviewInputSchema = z.object({
  deadlineText: z
    .string()
    .describe('The text of the fund deadline to be reviewed.'),
});
export type FundDeadlineReviewInput = z.infer<typeof FundDeadlineReviewInputSchema>;

const FundDeadlineReviewOutputSchema = z.object({
  reviewedText: z
    .string()
    .describe(
      'The reviewed text of the fund deadline, with suggestions to avoid unintentional stress for students.'
    ),
});
export type FundDeadlineReviewOutput = z.infer<typeof FundDeadlineReviewOutputSchema>;

export async function reviewFundDeadline(
  input: FundDeadlineReviewInput
): Promise<FundDeadlineReviewOutput> {
  return reviewFundDeadlineFlow(input);
}

const prompt = ai.definePrompt({
  name: 'fundDeadlineReviewPrompt',
  input: {schema: FundDeadlineReviewInputSchema},
  output: {schema: FundDeadlineReviewOutputSchema},
  prompt: `You are an expert at writing fund deadlines that are clear and concise, but also avoid causing unintentional stress for students.

  Please review the following fund deadline text and provide a revised version that is less likely to cause stress.

  Original Text: {{{deadlineText}}}

  Revised Text:`,
});

const reviewFundDeadlineFlow = ai.defineFlow(
  {
    name: 'reviewFundDeadlineFlow',
    inputSchema: FundDeadlineReviewInputSchema,
    outputSchema: FundDeadlineReviewOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
