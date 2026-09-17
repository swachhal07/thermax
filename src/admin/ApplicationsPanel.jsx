import { useState } from 'react'
import { api } from '@/lib/api'
import { cn } from '@/lib/utils'
import { services } from '@/data/services'
import { useCollection, movedOrder } from './useCollection'
import { Button, Field, Input, Note, Select, Textarea, Toggle, Eyebrow } from './fields'
import { LABEL } from './styles'
import { PanelHeader, RowActions, ImageField, EditorPanel, EmptyRow } from './parts'

const SECTORS = services.map((service) => ({ value: service.slug, label: service.title }))
const SECTOR_LABEL = Object.fromEntries(SECTORS.map((s) => [s.value, s.label]))

const BLANK = { name: '', body: '', imageAlt: '', uses: [], published: true }

const toForm = (application) => ({
  name: application.name,
  body: application.body,
  imageAlt: application.imageAlt ?? '',
  uses: (application.uses ?? []).map((use) => ({ sector: use.sector, detail: use.detail })),
  published: application.published !== false,
})

const toPayload = (form) => ({
  name: form.name.trim(),
  body: form.body.trim(),
  imageAlt: form.imageAlt.trim(),
  // A half-filled row someone added and did not finish should not block a save.
  uses: form.uses.filter((use) => use.detail.trim()).map((use) => ({ ...use, detail: use.detail.trim() })),
  published: form.published,
})

export default function ApplicationsPanel() {
  const [search, setSearch] = useState('')
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(BLANK)
  const [uploading, setUploading] = useState(null)

  const { rows, loading, busy, note, fieldErrors, run } = useCollection(api.applications, {
    params: { published: 'all', search: search || undefined },
  })

  const slugs = rows.map((row) => row.slug)
  const set = (field) => (value) => setForm((current) => ({ ...current, [field]: value }))

  const openNew = () => {
    setForm(BLANK)
    setEditing('new')
  }

  const openEdit = (application) => {
    if (editing === application.slug) return setEditing(null)
    setForm(toForm(application))
    setEditing(application.slug)
  }

  const save = async () => {
    const body = toPayload(form)
    const saved =
      editing === 'new'
        ? await run(() => api.applications.create(body), `Added ${body.name}.`)
        : await run(() => api.applications.update(editing, body), 'Saved.')

    if (saved) setEditing(null)
  }

  const move = (slug, direction) => {
    const next = movedOrder(slugs, slug, direction)
    if (next) run(() => api.applications.reorder(next))
  }

  const upload = async (slug, file) => {
    setUploading(slug)
    await run(() => api.applications.uploadImage(slug, file), 'Image uploaded.')
    setUploading(null)
  }

  const editorFor = (slug) =>
    editing === slug ? (
      <EditorPanel>
        <ApplicationForm
          form={form}
          set={set}
          errors={fieldErrors}
          busy={busy}
          slug={slug === 'new' ? null : slug}
          asset={rows.find((row) => row.slug === slug)?.image}
          uploading={uploading === slug}
          onUpload={(file) => upload(slug, file)}
          onRemoveImage={() => run(() => api.applications.removeImage(slug), 'Image removed.')}
          onSave={save}
          onCancel={() => setEditing(null)}
        />
      </EditorPanel>
    ) : null

  return (
    <>
      <PanelHeader title="Applications" count={rows.length} countLabel="ranges held">
        <Note tone={note?.tone}>{note?.text}</Note>
        <Button tone="primary" disabled={busy} onClick={openNew}>
          Add a range
        </Button>
      </PanelHeader>

      <div className="mt-6 flex flex-wrap items-end justify-between gap-x-8 gap-y-4">
        <Field id="filter-search" label="Search" className="w-64">
          <Input
            id="filter-search"
            type="search"
            placeholder="Name, body or a use"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </Field>

        <Eyebrow className="pb-2.5">Order here is the order on the site</Eyebrow>
      </div>

      {editing === 'new' && <div className="mt-8">{editorFor('new')}</div>}

      <div className="mt-8">
        {loading ? (
          <EmptyRow>Loading…</EmptyRow>
        ) : rows.length === 0 ? (
          <EmptyRow>{search ? 'Nothing matches that search' : 'No ranges yet'}</EmptyRow>
        ) : (
          rows.map((application, index) => (
            <div key={application.slug}>
              <div
                className={cn(
                  'grid grid-cols-[auto_1fr_auto] items-start gap-x-5 border-b border-ink/8 py-4 transition-colors duration-300 hover:bg-ink/[0.02] motion-reduce:transition-none',
                  !application.published && 'opacity-45',
                )}
              >
                <span className="pt-0.5 font-mono text-[0.6875rem] tabular-nums text-brand-600">
                  {String(index + 1).padStart(2, '0')}
                </span>

                <div className="min-w-0">
                  <div className="flex items-baseline gap-3">
                    <h2 className="truncate font-sans text-[0.9375rem] font-semibold tracking-[-0.01em] text-ink">
                      {application.name}
                    </h2>
                    {!application.published && (
                      <span className="font-mono text-[0.5rem] uppercase tracking-[0.2em] text-ink/40">
                        Draft
                      </span>
                    )}
                    {!application.image && (
                      <span className="font-mono text-[0.5rem] uppercase tracking-[0.2em] text-ink/30">
                        No image
                      </span>
                    )}
                  </div>

                  <p className="mt-1 line-clamp-2 max-w-[70ch] text-[0.8125rem] leading-relaxed text-ink/50">
                    {application.body}
                  </p>

                  {application.uses?.length > 0 && (
                    <p className="mt-2 font-mono text-[0.5625rem] uppercase tracking-[0.18em] text-muted">
                      {application.uses.map((use) => SECTOR_LABEL[use.sector] ?? use.sector).join(' · ')}
                    </p>
                  )}
                </div>

                <RowActions
                  disabled={busy}
                  editing={editing === application.slug}
                  onUp={index > 0 ? () => move(application.slug, -1) : null}
                  onDown={index < rows.length - 1 ? () => move(application.slug, 1) : null}
                  onEdit={() => openEdit(application)}
                  onDelete={() =>
                    run(
                      () => api.applications.remove(application.slug),
                      `Removed ${application.name}.`,
                    )
                  }
                />
              </div>

              {editorFor(application.slug)}
            </div>
          ))
        )}
      </div>
    </>
  )
}

function ApplicationForm({
  form,
  set,
  errors,
  busy,
  slug,
  asset,
  uploading,
  onUpload,
  onRemoveImage,
  onSave,
  onCancel,
}) {
  const setUse = (index, field, value) =>
    set('uses')(form.uses.map((use, i) => (i === index ? { ...use, [field]: value } : use)))

  const addUse = () => set('uses')([...form.uses, { sector: SECTORS[0].value, detail: '' }])
  const removeUse = (index) => set('uses')(form.uses.filter((_, i) => i !== index))

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        onSave()
      }}
      className="flex flex-col gap-7"
    >
      <Field id="name" label="Range" error={errors.name}>
        <Input
          id="name"
          required
          value={form.name}
          onChange={(event) => set('name')(event.target.value)}
          error={errors.name}
          placeholder="Waterproofing"
        />
      </Field>

      <Field
        id="body"
        label="Body"
        error={errors.body}
        hint="The paragraph under the heading on the range's own page."
      >
        <Textarea
          id="body"
          rows={4}
          required
          value={form.body}
          onChange={(event) => set('body')(event.target.value)}
          error={errors.body}
        />
      </Field>

      {/* One use is "what this range does on that kind of job" — the paired
          sector and line the range's page prints under the hero. */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-4">
          <span className={LABEL}>Uses</span>
          <Button size="sm" onClick={addUse} disabled={busy || form.uses.length >= 12}>
            Add a use
          </Button>
        </div>

        {form.uses.length === 0 ? (
          <p className="border-t border-ink/10 pt-3 font-sans text-[0.75rem] text-ink/35">
            None yet — a range without uses still renders, just without the sector list.
          </p>
        ) : (
          form.uses.map((use, index) => (
            <div
              key={index}
              className="grid gap-x-5 gap-y-3 border-t border-ink/10 pt-4 sm:grid-cols-[11rem_1fr_auto]"
            >
              <Field id={`use-sector-${index}`} label={`Sector ${String(index + 1).padStart(2, '0')}`}>
                <Select
                  id={`use-sector-${index}`}
                  value={use.sector}
                  onChange={(event) => setUse(index, 'sector', event.target.value)}
                >
                  {SECTORS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Select>
              </Field>

              <Field
                id={`use-detail-${index}`}
                label="Detail"
                error={errors[`uses.${index}.detail`]}
              >
                <Textarea
                  id={`use-detail-${index}`}
                  rows={2}
                  value={use.detail}
                  onChange={(event) => setUse(index, 'detail', event.target.value)}
                  error={errors[`uses.${index}.detail`]}
                />
              </Field>

              <div className="flex items-end pb-1.5">
                <Button size="sm" tone="ghost" onClick={() => removeUse(index)} disabled={busy}>
                  Remove
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="flex flex-col gap-6 border-t border-ink/10 pt-6">
        <ImageField
          label="Image"
          asset={asset}
          alt={form.imageAlt}
          disabled={!slug || busy}
          pending={uploading}
          onUpload={onUpload}
          onRemove={onRemoveImage}
        />

        <Field
          id="imageAlt"
          label="Image alt text"
          optional
          error={errors.imageAlt}
          hint="What the picture shows, for anyone who cannot see it."
        >
          <Input
            id="imageAlt"
            value={form.imageAlt}
            onChange={(event) => set('imageAlt')(event.target.value)}
            error={errors.imageAlt}
          />
        </Field>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-x-8 gap-y-4 border-t border-ink/10 pt-5">
        <Toggle
          checked={form.published}
          onChange={set('published')}
          label="Published"
          disabled={busy}
        />

        <div className="flex items-center gap-3">
          <Button tone="ghost" onClick={onCancel} disabled={busy}>
            Cancel
          </Button>
          <Button
            type="submit"
            tone="primary"
            disabled={busy || !form.name.trim() || form.body.trim().length < 10}
          >
            {busy ? 'Saving…' : slug ? 'Save' : 'Create'}
          </Button>
        </div>
      </div>
    </form>
  )
}
