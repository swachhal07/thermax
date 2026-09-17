import { useMemo, useState } from 'react'
import { api } from '@/lib/api'
import { cn } from '@/lib/utils'
import { services } from '@/data/services'
import { useCollection, movedOrder } from './useCollection'
import { Button, Field, Input, Note, Select, Toggle, Eyebrow } from './fields'
import { PanelHeader, RowActions, ImageField, EditorPanel, EmptyRow } from './parts'

const SECTORS = services.map((service) => ({ value: service.slug, label: service.title }))
const SECTOR_LABEL = Object.fromEntries(SECTORS.map((s) => [s.value, s.label]))

const BLANK = {
  name: '',
  sector: 'dams',
  project: '',
  year: '',
  capacityMw: '',
  featured: false,
  published: true,
}

/* The form holds strings, because that is what inputs hold. `year` and
   `capacityMw` are sent as numbers or as null — the API reads an empty string
   as "no figure", but converting here keeps the two blank states from ever
   being confused with a zero. */
const toPayload = (form) => ({
  name: form.name.trim(),
  sector: form.sector,
  project: form.project.trim(),
  year: form.year === '' ? null : Number(form.year),
  capacityMw: form.capacityMw === '' ? null : Number(form.capacityMw),
  featured: form.featured,
  published: form.published,
})

const toForm = (client) => ({
  name: client.name,
  sector: client.sector,
  project: client.project ?? '',
  year: client.year ?? '',
  capacityMw: client.capacityMw ?? '',
  featured: Boolean(client.featured),
  published: client.published !== false,
})

export default function ClientsPanel() {
  const [sector, setSector] = useState('')
  const [search, setSearch] = useState('')
  const [editing, setEditing] = useState(null) // a slug, or 'new'
  const [form, setForm] = useState(BLANK)
  const [uploading, setUploading] = useState(null)

  const { rows, loading, busy, note, fieldErrors, run } = useCollection(api.clients, {
    params: { published: 'all', sector: sector || undefined, search: search || undefined },
  })

  /* The sector total, the same arithmetic the public ledger does — it is the
     number someone editing this table is most likely to be checking against. */
  const capacity = useMemo(
    () => rows.reduce((total, row) => total + (row.capacityMw ?? 0), 0),
    [rows],
  )

  const slugs = rows.map((row) => row.slug)
  const set = (field) => (value) => setForm((current) => ({ ...current, [field]: value }))

  const openNew = () => {
    setForm({ ...BLANK, sector: sector || BLANK.sector })
    setEditing('new')
  }

  const openEdit = (client) => {
    if (editing === client.slug) return setEditing(null)
    setForm(toForm(client))
    setEditing(client.slug)
  }

  const save = async () => {
    const body = toPayload(form)
    const saved =
      editing === 'new'
        ? await run(() => api.clients.create(body), `Added ${body.name}.`)
        : await run(() => api.clients.update(editing, body), 'Saved.')

    if (saved) setEditing(null)
  }

  const move = (slug, direction) => {
    const next = movedOrder(slugs, slug, direction)
    if (next) run(() => api.clients.reorder(next))
  }

  const upload = async (slug, file) => {
    setUploading(slug)
    await run(() => api.clients.uploadImage(slug, file), 'Logo uploaded.')
    setUploading(null)
  }

  const editorFor = (slug) =>
    editing === slug ? (
      <EditorPanel>
        <ClientForm
          form={form}
          set={set}
          errors={fieldErrors}
          busy={busy}
          slug={slug === 'new' ? null : slug}
          asset={rows.find((row) => row.slug === slug)?.logo}
          uploading={uploading === slug}
          onUpload={(file) => upload(slug, file)}
          onRemoveImage={() => run(() => api.clients.removeImage(slug), 'Logo removed.')}
          onSave={save}
          onCancel={() => setEditing(null)}
        />
      </EditorPanel>
    ) : null

  return (
    <>
      <PanelHeader
        title="Clients"
        count={rows.length}
        countLabel={sector ? `rows in ${SECTOR_LABEL[sector]}` : 'rows in the ledger'}
      >
        <Note tone={note?.tone}>{note?.text}</Note>
        <Button tone="primary" disabled={busy} onClick={openNew}>
          Add a client
        </Button>
      </PanelHeader>

      <div className="mt-6 flex flex-wrap items-end justify-between gap-x-8 gap-y-5">
        <div className="flex flex-wrap items-end gap-x-6 gap-y-4">
          <Field id="filter-sector" label="Sector" className="w-44">
            <Select
              id="filter-sector"
              value={sector}
              onChange={(event) => setSector(event.target.value)}
            >
              <option value="">All sectors</option>
              {SECTORS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </Field>

          <Field id="filter-search" label="Search" className="w-56">
            <Input
              id="filter-search"
              type="search"
              placeholder="Name or project"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </Field>
        </div>

        <Eyebrow className="pb-2.5">
          <span className="tabular-nums text-ink">{capacity.toFixed(2)}</span> MW listed
        </Eyebrow>
      </div>

      {editing === 'new' && <div className="mt-8">{editorFor('new')}</div>}

      <div className="mt-8">
        <div className="grid grid-cols-[1fr_auto] items-end gap-4 border-b border-ink/15 pb-2.5">
          <Eyebrow>Client · project</Eyebrow>
          <Eyebrow>Capacity · state</Eyebrow>
        </div>

        {loading ? (
          <EmptyRow>Loading…</EmptyRow>
        ) : rows.length === 0 ? (
          <EmptyRow>{search || sector ? 'Nothing matches that filter' : 'No clients yet'}</EmptyRow>
        ) : (
          rows.map((client) => (
            <div key={client.slug}>
              <div
                className={cn(
                  'group grid grid-cols-[1fr_auto] items-center gap-x-6 gap-y-2 border-b border-ink/8 py-3.5 transition-colors duration-300 hover:bg-ink/[0.02] motion-reduce:transition-none',
                  !client.published && 'opacity-45',
                )}
              >
                <div className="min-w-0">
                  <div className="flex items-baseline gap-3">
                    <h2 className="truncate font-sans text-[0.9375rem] font-semibold tracking-[-0.01em] text-ink">
                      {client.name}
                    </h2>
                    {client.featured && (
                      <span className="font-mono text-[0.5rem] uppercase tracking-[0.2em] text-brand-600">
                        Featured
                      </span>
                    )}
                    {!client.published && (
                      <span className="font-mono text-[0.5rem] uppercase tracking-[0.2em] text-ink/40">
                        Draft
                      </span>
                    )}
                  </div>
                  <p className="mt-1 truncate font-mono text-[0.625rem] uppercase tracking-[0.16em] text-muted">
                    {SECTOR_LABEL[client.sector]}
                    {client.project && ` · ${client.project}`}
                    {client.year && ` · ${client.year}`}
                  </p>
                </div>

                <div className="flex items-center gap-5">
                  <span className="font-mono text-[0.6875rem] tabular-nums text-ink/60">
                    {client.capacityMw === null || client.capacityMw === undefined
                      ? '—'
                      : `${client.capacityMw} MW`}
                  </span>

                  <RowActions
                    disabled={busy}
                    editing={editing === client.slug}
                    onUp={slugs.indexOf(client.slug) > 0 ? () => move(client.slug, -1) : null}
                    onDown={
                      slugs.indexOf(client.slug) < slugs.length - 1
                        ? () => move(client.slug, 1)
                        : null
                    }
                    onEdit={() => openEdit(client)}
                    onDelete={() =>
                      run(() => api.clients.remove(client.slug), `Removed ${client.name}.`)
                    }
                  />
                </div>
              </div>

              {editorFor(client.slug)}
            </div>
          ))
        )}
      </div>
    </>
  )
}

function ClientForm({
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
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        onSave()
      }}
      className="flex flex-col gap-7"
    >
      <div className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
        <Field id="name" label="Client · project" error={errors.name} className="sm:col-span-2">
          <Input
            id="name"
            required
            value={form.name}
            onChange={(event) => set('name')(event.target.value)}
            error={errors.name}
            placeholder="Nasa Hydropower Pvt. Ltd."
          />
        </Field>

        <Field id="sector" label="Sector" error={errors.sector}>
          <Select
            id="sector"
            value={form.sector}
            onChange={(event) => set('sector')(event.target.value)}
            error={errors.sector}
          >
            {SECTORS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </Field>

        <Field
          id="capacityMw"
          label="Capacity (MW)"
          optional
          error={errors.capacityMw}
          hint="Leave blank where the job has no capacity figure — the row then renders without a bar."
        >
          <Input
            id="capacityMw"
            type="number"
            step="0.01"
            min="0"
            value={form.capacityMw}
            onChange={(event) => set('capacityMw')(event.target.value)}
            error={errors.capacityMw}
          />
        </Field>

        <Field
          id="project"
          label="Project line"
          optional
          error={errors.project}
          hint="Only where the name is not the job itself."
          className="sm:col-span-2"
        >
          <Input
            id="project"
            value={form.project}
            onChange={(event) => set('project')(event.target.value)}
            error={errors.project}
          />
        </Field>

        <Field id="year" label="Year" optional error={errors.year}>
          <Input
            id="year"
            type="number"
            min="1950"
            max={new Date().getFullYear() + 1}
            value={form.year}
            onChange={(event) => set('year')(event.target.value)}
            error={errors.year}
          />
        </Field>
      </div>

      <ImageField
        label="Logo"
        asset={asset}
        alt={form.name}
        disabled={!slug || busy}
        pending={uploading}
        onUpload={onUpload}
        onRemove={onRemoveImage}
      />

      <div className="flex flex-wrap items-center justify-between gap-x-8 gap-y-4 border-t border-ink/10 pt-5">
        <div className="flex flex-wrap items-center gap-6">
          <Toggle
            checked={form.published}
            onChange={set('published')}
            label="Published"
            disabled={busy}
          />
          <Toggle
            checked={form.featured}
            onChange={set('featured')}
            label="Featured"
            disabled={busy}
          />
        </div>

        <div className="flex items-center gap-3">
          <Button tone="ghost" onClick={onCancel} disabled={busy}>
            Cancel
          </Button>
          <Button type="submit" tone="primary" disabled={busy || !form.name.trim()}>
            {busy ? 'Saving…' : slug ? 'Save' : 'Create'}
          </Button>
        </div>
      </div>
    </form>
  )
}
