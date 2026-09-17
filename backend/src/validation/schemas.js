import { z } from 'zod'
import { SECTORS } from '../models/constants.js'

/* Zod schemas describe what a caller may send; the Mongoose models describe
   what may be stored. They overlap deliberately — the schemas here also decide
   which fields are writable at all. Anything not listed (`image`, `logo`,
   `createdAt`, a user's `role` on their own account) is stripped before a
   handler sees the body, so images can only change through the upload routes. */

const trimmed = (max) => z.string().trim().max(max)
const slug = z
  .string()
  .trim()
  .toLowerCase()
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase words joined by hyphens.')
  .max(80)

const sector = z.enum(SECTORS)

/* An empty string clears an optional text field; `null` or an empty string does
   the same for the numbers. Both are accepted so an admin form can post its
   blank inputs as they come out of the DOM, where every value is a string and
   an untouched number field is ''. */
const optionalText = (max) => trimmed(max).default('')
const optionalNumber = (schema) =>
  z
    .union([schema, z.null(), z.literal('')])
    .optional()
    .transform((value) => (value === '' || value === undefined ? null : value))

const useEntry = z.object({
  sector,
  detail: trimmed(600).min(1, 'A use needs a line describing what the range does there.'),
})

export const applicationCreateSchema = z
  .object({
    slug: slug.optional(),
    name: trimmed(120).min(2, 'A range needs a name.'),
    body: trimmed(2000).min(10, 'A range needs the paragraph that introduces it.'),
    imageAlt: optionalText(300),
    uses: z.array(useEntry).max(12).default([]),
    order: z.number().int().min(0).max(999).optional(),
    published: z.boolean().default(true),
  })
  .strict()

/* Update is the create shape with everything optional, and at least one field
   required — a PATCH with an empty body is a mistake worth reporting. */
export const applicationUpdateSchema = applicationCreateSchema
  .partial()
  .strict()
  .refine((body) => Object.keys(body).length > 0, { message: 'Nothing to update.' })

export const clientCreateSchema = z
  .object({
    slug: slug.optional(),
    name: trimmed(200).min(2, 'A client row needs the name of the entity supplied.'),
    sector,
    project: optionalText(400),
    year: optionalNumber(z.number().int().min(1950).max(new Date().getFullYear() + 1)),
    capacityMw: optionalNumber(z.number().min(0).max(100_000)),
    order: z.number().int().min(0).max(9999).optional(),
    featured: z.boolean().default(false),
    published: z.boolean().default(true),
  })
  .strict()

export const clientUpdateSchema = clientCreateSchema
  .partial()
  .strict()
  .refine((body) => Object.keys(body).length > 0, { message: 'Nothing to update.' })

/* Reordering is its own endpoint rather than a field on each update: dragging a
   row in an admin table has to renumber several records atomically, and doing
   that as N separate PATCHes leaves the list in a half-sorted state if one
   fails. */
export const reorderSchema = z
  .object({
    slugs: z
      .array(slug)
      .min(1, 'Send the slugs in their new order.')
      .max(500),
  })
  .strict()

export const loginSchema = z
  .object({
    email: z.string().trim().toLowerCase().email('That address looks incomplete.'),
    password: z.string().min(1, 'Enter your password.'),
  })
  .strict()

export const registerSchema = z
  .object({
    email: z.string().trim().toLowerCase().email('That address looks incomplete.'),
    name: optionalText(120),
    password: z
      .string()
      .min(10, 'Use at least 10 characters.')
      .max(200),
    role: z.enum(['admin', 'editor']).default('editor'),
    // Required once the first account exists — see authController.register.
    setupKey: z.string().optional(),
  })
  .strict()

export const passwordChangeSchema = z
  .object({
    currentPassword: z.string().min(1, 'Enter your current password.'),
    newPassword: z.string().min(10, 'Use at least 10 characters.').max(200),
  })
  .strict()
