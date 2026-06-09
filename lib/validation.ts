import { z } from "zod";

const numberFromForm = z.preprocess((value) => {
  if (typeof value === "string") {
    const normalized = value.trim().replace(",", ".");
    return normalized === "" ? Number.NaN : Number(normalized);
  }

  return value;
}, z.number({ invalid_type_error: "Ange ett giltigt tal." }).finite());

const optionalMoneyFromForm = z.preprocess((value) => {
  if (typeof value === "string") {
    const normalized = value.trim().replace(",", ".");
    return normalized === "" ? undefined : Number(normalized);
  }

  return value ?? undefined;
}, z.number({ invalid_type_error: "Ange ett giltigt tal." }).finite().optional());

const optionalUuid = z.preprocess((value) => {
  if (typeof value !== "string") {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed === "" ? undefined : trimmed;
}, z.string().uuid("Välj en giltig match.").optional());

const trimmedOptionalText = z.preprocess((value) => {
  if (typeof value !== "string") {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed === "" ? undefined : trimmed;
}, z.string().optional());

export const betInputSchema = z
  .object({
    match_id: optionalUuid,
    match_label: trimmedOptionalText,
    description: z.string().trim().min(1, "Beskrivning krävs."),
    odds: numberFromForm.refine((value) => value > 1, "Odds måste vara över 1."),
    stake: numberFromForm.refine((value) => value > 0, "Insatsen måste vara över 0.")
  })
  .superRefine((data, ctx) => {
    if (!data.match_id && !data.match_label) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Välj en match eller ange en fritextmatch.",
        path: ["match_label"]
      });
    }
  });

export const matchInputSchema = z.object({
  match_no: numberFromForm
    .refine((value) => Number.isInteger(value), "Matchnummer måste vara ett heltal.")
    .refine((value) => value > 0, "Matchnummer måste vara över 0."),
  starts_at: trimmedOptionalText,
  home_team: z.string().trim().min(1, "Hemmalag krävs."),
  away_team: z.string().trim().min(1, "Bortalag krävs."),
  phase: trimmedOptionalText
});

export const settleInputSchema = z.object({
  id: z.string().uuid("Ogiltigt bet-id."),
  status: z.enum(["won", "lost", "void"]),
  payout: optionalMoneyFromForm
});

export function formError(error: z.ZodError) {
  return error.issues.map((issue) => issue.message).join(" ");
}
