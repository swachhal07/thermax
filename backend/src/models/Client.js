import mongoose from 'mongoose'
import { SECTORS, IMAGE_SCHEMA_FIELDS } from './constants.js'
import { slugify } from '../utils/slugify.js'

const clientSchema = new mongoose.Schema(
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
      required: [true, 'A client row needs the name of the entity supplied.'],
      trim: true,
      maxlength: 200,
    },
    sector: {
      type: String,
      required: [true, 'Every client sits under one sector.'],
      enum: { values: SECTORS, message: `\`{VALUE}\` is not one of: ${SECTORS.join(', ')}` },
    },
    /* Optional by design. On hydropower rows the name *is* the job, so there is
       no separate project line; repair and framework contracts carry one. */
    project: { type: String, trim: true, maxlength: 400, default: '' },
    year: {
      type: Number,
      min: [1950, 'That year is earlier than the company existed.'],
      /* A record can legitimately name a job finishing next year; anything
         beyond that is a typo. */
      max: [new Date().getFullYear() + 1, 'That year is in the future.'],
      default: null,
    },
    /* Installed capacity of the project, kept as a number rather than baked
       into the name so the ledger can total a sector and scale each row's bar
       against the biggest job in it. Absent where a job has no capacity figure
       — those rows render without a bar rather than with a zero-width one. */
    capacityMw: {
      type: Number,
      min: [0, 'Capacity cannot be negative.'],
      default: null,
    },
    logo: { type: IMAGE_SCHEMA_FIELDS, default: null },
    order: { type: Number, default: 0 },
    featured: { type: Boolean, default: false },
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

/* The ledger reads by sector, biggest capacity first, with rows that carry no
   capacity figure falling to the foot of their sector. Mongo sorts null ahead
   of numbers, so the ledger sorts in the aggregation on a computed key rather
   than on capacityMw directly — see clientController. */
clientSchema.index({ published: 1, sector: 1, capacityMw: -1 })
clientSchema.index({ name: 1 })

clientSchema.pre('validate', function normaliseSlug() {
  if (!this.slug && this.name) this.slug = slugify(this.name)
  else if (this.slug) this.slug = slugify(this.slug)
})

export const Client = mongoose.model('Client', clientSchema)
