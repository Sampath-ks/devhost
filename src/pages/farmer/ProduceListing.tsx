import { useState } from 'react'
import { Plus, Pencil, Ban, MapPin, CalendarDays, Sprout } from 'lucide-react'
import { useListings } from '@/hooks/useListings'
import type { ListingInput, ListingStatus, ProduceListing as Listing, QualityGrade } from '@/lib/produceTypes'
import type { ListingErrors } from '@/lib/validateListing'

interface FormState {
  cropName: string
  variety: string
  quantityKg: string
  askingPrice: string
  qualityGrade: '' | QualityGrade
  harvestDate: string
  location: string
}

const emptyForm: FormState = {
  cropName: '',
  variety: '',
  quantityKg: '',
  askingPrice: '',
  qualityGrade: '',
  harvestDate: '',
  location: '',
}

const statusStyles: Record<ListingStatus, string> = {
  Active: 'bg-green-100 text-green-800',
  Supplied: 'bg-blue-100 text-blue-800',
  'Sold Out': 'bg-amber-100 text-amber-800',
  Closed: 'bg-gray-200 text-gray-600',
}

function toInput(f: FormState): ListingInput {
  return {
    farmerId: '', // overwritten by the hook
    cropName: f.cropName,
    variety: f.variety,
    quantityKg: Number(f.quantityKg),
    askingPrice: Number(f.askingPrice),
    qualityGrade: f.qualityGrade as QualityGrade,
    harvestDate: f.harvestDate,
    location: f.location,
  }
}

function toForm(l: Listing): FormState {
  return {
    cropName: l.cropName,
    variety: l.variety,
    quantityKg: String(l.quantityKg),
    askingPrice: String(l.askingPrice),
    qualityGrade: l.qualityGrade,
    harvestDate: l.harvestDate,
    location: l.location,
  }
}

const inputClass =
  'w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-green-600 focus:ring-2 focus:ring-green-600/20'

function Field({
  label,
  error,
  children,
}: {
  label: string
  error?: string
  children: React.ReactNode
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-gray-700">{label}</span>
      {children}
      {error && <span className="mt-1 block text-xs text-red-600">{error}</span>}
    </label>
  )
}

export default function ProduceListing() {
  const { listings, createListing, updateListing, setStatus } = useListings()
  const [form, setForm] = useState<FormState>(emptyForm)
  const [errors, setErrors] = useState<ListingErrors>({})
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)

  const set = (key: keyof FormState) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((prev) => ({ ...prev, [key]: e.target.value }))

  function openCreate() {
    setForm(emptyForm)
    setErrors({})
    setEditingId(null)
    setShowForm(true)
  }

  function openEdit(l: Listing) {
    setForm(toForm(l))
    setErrors({})
    setEditingId(l.id)
    setShowForm(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function closeForm() {
    setShowForm(false)
    setEditingId(null)
    setErrors({})
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const input = toInput(form)
    const result = editingId ? updateListing(editingId, input) : createListing(input)
    if (!result.ok) {
      setErrors(result.errors)
      return
    }
    closeForm()
  }

  const today = new Date().toISOString().split('T')[0]

  return (
    <div className="mx-auto max-w-5xl p-4">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">My Produce Listings</h1>
          <p className="text-sm text-gray-600">Create and manage what you want to sell.</p>
        </div>
        {!showForm && (
          <button
            onClick={openCreate}
            className="flex items-center gap-2 rounded-lg bg-green-700 px-4 py-2 text-sm font-medium text-white hover:bg-green-800"
          >
            <Plus size={16} /> New listing
          </button>
        )}
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="mb-8 rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
        >
          <h2 className="mb-4 text-lg font-semibold">
            {editingId ? 'Edit listing' : 'New listing'}
          </h2>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Crop name" error={errors.cropName}>
              <input className={inputClass} value={form.cropName} onChange={set('cropName')} placeholder="Tomato" />
            </Field>
            <Field label="Variety" error={errors.variety}>
              <input className={inputClass} value={form.variety} onChange={set('variety')} placeholder="Hybrid" />
            </Field>
            <Field label="Quantity (kg)" error={errors.quantityKg}>
              <input type="number" min="0" className={inputClass} value={form.quantityKg} onChange={set('quantityKg')} placeholder="200" />
            </Field>
            <Field label="Asking price (₹/kg)" error={errors.askingPrice}>
              <input type="number" min="0" step="0.5" className={inputClass} value={form.askingPrice} onChange={set('askingPrice')} placeholder="24" />
            </Field>
            <Field label="Quality grade" error={errors.qualityGrade}>
              <select className={inputClass} value={form.qualityGrade} onChange={set('qualityGrade')}>
                <option value="">Select grade</option>
                <option value="A">A (best)</option>
                <option value="B">B</option>
                <option value="C">C</option>
              </select>
            </Field>
            <Field label="Harvest date" error={errors.harvestDate}>
              <input type="date" max={today} className={inputClass} value={form.harvestDate} onChange={set('harvestDate')} />
            </Field>
            <div className="sm:col-span-2">
              <Field label="Farm location" error={errors.location}>
                <input className={inputClass} value={form.location} onChange={set('location')} placeholder="Village, District, State" />
              </Field>
            </div>
          </div>

          <div className="mt-5 flex gap-3">
            <button type="submit" className="rounded-lg bg-green-700 px-4 py-2 text-sm font-medium text-white hover:bg-green-800">
              {editingId ? 'Save changes' : 'Create listing'}
            </button>
            <button type="button" onClick={closeForm} className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-50">
              Cancel
            </button>
          </div>
        </form>
      )}

      {listings.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 p-10 text-center text-gray-500">
          <Sprout className="mx-auto mb-2" />
          No listings yet. Create your first one.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {listings.map((l) => (
            <div key={l.id} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="mb-3 flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold">
                    {l.cropName} <span className="font-normal text-gray-500">({l.variety})</span>
                  </h3>
                  <p className="text-xs text-gray-400">ID: {l.id}</p>
                </div>
                <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusStyles[l.status]}`}>
                  {l.status}
                </span>
              </div>

              <dl className="grid grid-cols-3 gap-2 text-sm">
                <div>
                  <dt className="text-gray-500">Quantity</dt>
                  <dd className="font-medium">{l.quantityKg} kg</dd>
                </div>
                <div>
                  <dt className="text-gray-500">Price</dt>
                  <dd className="font-medium">₹{l.askingPrice}/kg</dd>
                </div>
                <div>
                  <dt className="text-gray-500">Grade</dt>
                  <dd className="font-medium">{l.qualityGrade}</dd>
                </div>
              </dl>

              <div className="mt-3 space-y-1 text-xs text-gray-600">
                <p className="flex items-center gap-1.5"><CalendarDays size={13} /> Harvested {l.harvestDate}</p>
                <p className="flex items-center gap-1.5"><MapPin size={13} /> {l.location}</p>
              </div>

              {l.status !== 'Closed' && (
                <div className="mt-4 flex gap-2">
                  <button onClick={() => openEdit(l)} className="flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium hover:bg-gray-50">
                    <Pencil size={13} /> Edit
                  </button>
                  <button onClick={() => setStatus(l.id, 'Closed')} className="flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-50">
                    <Ban size={13} /> Close
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}