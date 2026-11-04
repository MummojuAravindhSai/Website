'use client'

import { useActionState } from 'react'
import { submitEnquiry, type EnquiryState } from '../actions'

const initialState: EnquiryState = { status: 'idle' }

const services = [
  'Full-home interiors',
  'Apartment interiors',
  'Villa interiors',
  'Modular kitchen',
  'Bedrooms and wardrobes',
  'Living and dining',
  'Renovation',
  'Commercial interiors',
  'Turnkey design and execution',
]

export function ConsultationForm() {
  const [state, action, pending] = useActionState(submitEnquiry, initialState)

  if (state.status === 'success') {
    return (
      <div className="border border-[#c8b7a8] bg-[#eee6dc] p-8" role="status">
        <p className="eyebrow">Request received</p>
        <h2 className="mt-4 font-serif text-4xl">Thank you for sharing your project.</h2>
        <p className="mt-4 max-w-xl leading-7 text-[#62564d]">{state.message}</p>
      </div>
    )
  }

  const error = (field: string) =>
    state.errors?.[field] ? (
      <span className="text-xs normal-case tracking-normal text-[#a13e2d]">
        {state.errors[field]}
      </span>
    ) : null

  return (
    <form action={action} className="grid gap-5 md:grid-cols-2" noValidate>
      <label className="form-field">
        <span>Name *</span>
        <input name="name" autoComplete="name" required placeholder="Your name" />
        {error('name')}
      </label>
      <label className="form-field">
        <span>Indian mobile number *</span>
        <input name="mobile" autoComplete="tel" required defaultValue="+91 " />
        {error('mobile')}
      </label>
      <label className="form-field">
        <span>Email *</span>
        <input
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="you@example.com"
        />
        {error('email')}
      </label>
      <label className="form-field">
        <span>City *</span>
        <input name="city" required defaultValue="Hyderabad" />
        {error('city')}
      </label>
      <label className="form-field">
        <span>Property type *</span>
        <select name="propertyType" required defaultValue="">
          <option value="" disabled>
            Select property type
          </option>
          <option>Apartment</option>
          <option>Villa</option>
          <option>Independent home</option>
          <option>Commercial space</option>
          <option>Other</option>
        </select>
        {error('propertyType')}
      </label>
      <label className="form-field">
        <span>Approximate property size</span>
        <input name="propertySize" placeholder="Example: 2,000 sq ft" />
      </label>
      <fieldset className="md:col-span-2">
        <legend className="mb-3 text-[9px] font-semibold uppercase tracking-[0.12em] text-[#6b584b]">
          Required services *
        </legend>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <label
              key={service}
              className="flex min-h-11 items-center gap-3 border border-[#d8cbbd] px-3 text-xs"
            >
              <input type="checkbox" name="requiredServices" value={service} />
              {service}
            </label>
          ))}
        </div>
        {error('requiredServices')}
      </fieldset>
      <label className="form-field">
        <span>Preferred project start</span>
        <input name="preferredStartDate" type="date" />
      </label>
      <label className="form-field">
        <span>Approximate budget</span>
        <select name="budgetRange" defaultValue="">
          <option value="">Select a range</option>
          <option>Under ₹10 lakh</option>
          <option>₹10–20 lakh</option>
          <option>₹20–40 lakh</option>
          <option>₹40–75 lakh</option>
          <option>₹75 lakh+</option>
        </select>
        {error('budgetRange')}
      </label>
      <label className="form-field md:col-span-2">
        <span>Tell us about the project</span>
        <textarea
          name="description"
          rows={4}
          placeholder="What would you like to create or change?"
        />
      </label>
      <fieldset className="md:col-span-2">
        <legend className="mb-3 text-[9px] font-semibold uppercase tracking-[0.12em] text-[#6b584b]">
          Preferred contact method *
        </legend>
        <div className="flex flex-wrap gap-3">
          {['Phone', 'WhatsApp', 'Email'].map((method) => (
            <label
              key={method}
              className="flex min-h-11 items-center gap-3 border border-[#d8cbbd] px-4 text-xs"
            >
              <input type="radio" name="preferredContact" value={method} />
              {method}
            </label>
          ))}
        </div>
        {error('preferredContact')}
      </fieldset>
      {state.message && (
        <p className="md:col-span-2 text-sm text-[#a13e2d]" role="alert">
          {state.message}
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="md:col-span-2 min-h-12 justify-self-start bg-[#211b17] px-6 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#fbf8f1] disabled:opacity-60"
      >
        {pending ? 'Submitting…' : 'Request a consultation ↗'}
      </button>
    </form>
  )
}
