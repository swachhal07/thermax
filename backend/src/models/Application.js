import mongoose from 'mongoose'
import { SECTORS, IMAGE_SCHEMA_FIELDS } from './constants.js'
import { slugify } from '../utils/slugify.js'

/* One `use` is "what this range does on this kind of job" — the paired sector
   and detail the Application page prints under the hero. `_id: false` keeps
   them as plain sub-objects: they are never addressed on their own, they are
   replaced wholesale with the parent. */
const useSchema = new mongoose.Schema(
  {
    sector: {
      type: String,
      required: [true, 'A use has to name the sector it applies to.'],
      enum: { values: SECTORS, message: `\`{VALUE}\` is not one of: ${SECTORS.join(', ')}` },
    },
    detail: {
      type: String,
      required: [true, 'A use needs a line describing what the range does there.'],
      trim: true,
      maxlength: 600,
    },
  },
  { _id: false },
)

const applicationSchema = new mongoose.Schema(
  {
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase words joined by hyphens.'],
    },
    name: {
      type: String,
      required: [true, 'A range needs a name.'],
      trim: true,
      maxlength: 120,
    },
    body: {
      type: String,
      required: [true, 'A range needs the paragraph that introduces it.'],
      trim: true,
      maxlength: 2000,
    },
    /* Alt text lives with the record, not with the file: it describes what the
       picture shows for this range and has to survive the image being
       replaced. */
    imageAlt: { type: String, trim: true, maxlength: 300, default: '' },
    image: { type: IMAGE_SCHEMA_FIELDS, default: null },
    uses: { type: [useSchema], default: [] },
    /* Editorial ordering. The site prints ranges in a deliberate sequence and
       numbers them ("03 / 06"), so it cannot be alphabetical. */
    order: { type: Number, default: 0 },
    published: { type: Boolean, default: true },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret) {
        ret.id = ret._id
        delete ret._id
        delete ret.__v
        return ret
      },
    },
  },
)

/* The two ways this collection is ever read: the ordered public list, and a
   single range by slug (covered by the unique index on `slug`). */
applicationSchema.index({ published: 1, order: 1 })

applicationSchema.pre('validate', function normaliseSlug() {
  if (!this.slug && this.name) this.slug = slugify(this.name)
  else if (this.slug) this.slug = slugify(this.slug)
})

export const Application = mongoose.model('Application', applicationSchema)
