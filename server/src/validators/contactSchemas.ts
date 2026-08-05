import { z } from "zod";

const emptyToNull = (v: unknown) =>
  v === "" || v === undefined ? null : v;

export const optionalEmail = z.preprocess(
  emptyToNull,
  z.string().email("Invalid email").nullable().optional(),
);

export const optionalUrl = z.preprocess(
  emptyToNull,
  z.string().url("Invalid photo URL").nullable().optional(),
);

export const optionalDate = z.preprocess(emptyToNull, z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Birthday must be YYYY-MM-DD")
  .nullable()
  .optional());

export const optionalText = z.preprocess(
  emptyToNull,
  z.string().nullable().optional(),
);

const nameField = z
  .string()
  .trim()
  .min(1, "Name is required");

const phoneField = z
  .string()
  .trim()
  .min(1, "Phone is required");

export const contactCreateSchema = z.object({
  name: nameField,
  phone: phoneField,
  email: optionalEmail,
  address: optionalText,
  birthday: optionalDate,
  notes: optionalText,
  photoUrl: optionalUrl,
  isFavorite: z.boolean().optional().default(false),
});

export const contactPutSchema = z.object({
  name: nameField,
  phone: phoneField,
  email: optionalEmail,
  address: optionalText,
  birthday: optionalDate,
  notes: optionalText,
  photoUrl: optionalUrl,
  isFavorite: z.boolean().optional(),
});

export const contactPatchSchema = z
  .object({
    name: nameField.optional(),
    phone: phoneField.optional(),
    email: optionalEmail,
    address: optionalText,
    birthday: optionalDate,
    notes: optionalText,
    photoUrl: optionalUrl,
    isFavorite: z.boolean().optional(),
  })
  .refine((d) => Object.keys(d).length > 0, {
    message: "At least one field is required",
  });

export const listQuerySchema = z.object({
  q: z.string().optional(),
  favorite: z.enum(["true", "false"]).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type ContactCreateInput = z.infer<typeof contactCreateSchema>;
export type ContactPutInput = z.infer<typeof contactPutSchema>;
export type ContactPatchInput = z.infer<typeof contactPatchSchema>;
