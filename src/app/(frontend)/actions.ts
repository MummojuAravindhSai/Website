'use server'

import { getPayloadClient } from '@/lib/payload'

export type EnquiryState = {
  status: 'idle' | 'success' | 'error'
  message?: string
  errors?: Record<string, string>
}

const propertyTypes = [
  'Apartment',
  'Villa',
  'Independent home',
  'Commercial space',
  'Other',
] as const
const serviceOptions = [
  'Full-home interiors',
  'Apartment interiors',
  'Villa interiors',
  'Modular kitchen',
  'Bedrooms and wardrobes',
  'Living and dining',
  'Renovation',
  'Commercial interiors',
  'Turnkey design and execution',
] as const
const budgetRanges = [
  'Under ₹10 lakh',
  '₹10–20 lakh',
  '₹20–40 lakh',
  '₹40–75 lakh',
  '₹75 lakh+',
] as const
const contactMethods = ['Phone', 'WhatsApp', 'Email'] as const

function text(formData: FormData, key: string, max = 500) {
  const value = formData.get(key)
  return typeof value === 'string' ? value.trim().slice(0, max) : ''
}

export async function submitEnquiry(
  _previousState: EnquiryState,
  formData: FormData,
): Promise<EnquiryState> {
  const name = text(formData, 'name', 100)
  const mobile = text(formData, 'mobile', 20)
  const email = text(formData, 'email', 200)
  const city = text(formData, 'city', 100)
  const propertyType = text(formData, 'propertyType', 50)
  const propertySize = text(formData, 'propertySize', 60)
  const requiredServices = formData
    .getAll('requiredServices')
    .filter((value): value is string => typeof value === 'string')
    .filter((value) => serviceOptions.includes(value as (typeof serviceOptions)[number]))
  const preferredStartDate = text(formData, 'preferredStartDate', 40)
  const budgetRange = text(formData, 'budgetRange', 40)
  const description = text(formData, 'description', 2000)
  const preferredContact = text(formData, 'preferredContact', 20)

  const errors: Record<string, string> = {}
  if (name.length < 2) errors.name = 'Please enter your name.'
  if (!/^\+91[6-9]\d{9}$/.test(mobile.replace(/\s/g, ''))) {
    errors.mobile = 'Use an Indian mobile number in the format +91 98765 43210.'
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = 'Enter a valid email.'
  if (city.length < 2) errors.city = 'Enter your city.'
  if (!propertyTypes.includes(propertyType as (typeof propertyTypes)[number])) {
    errors.propertyType = 'Choose a property type.'
  }
  if (requiredServices.length === 0) errors.requiredServices = 'Choose at least one service.'
  if (budgetRange && !budgetRanges.includes(budgetRange as (typeof budgetRanges)[number])) {
    errors.budgetRange = 'Choose a valid budget range.'
  }
  if (!contactMethods.includes(preferredContact as (typeof contactMethods)[number])) {
    errors.preferredContact = 'Choose a contact method.'
  }
  if (Object.keys(errors).length > 0) {
    return { status: 'error', message: 'Please review the highlighted fields.', errors }
  }

  try {
    const payload = await getPayloadClient()
    await payload.create({
      collection: 'enquiries',
      overrideAccess: false,
      data: {
        name,
        mobile: mobile.replace(/\s/g, ''),
        email,
        city,
        propertyType: propertyType as (typeof propertyTypes)[number],
        propertySize: propertySize || undefined,
        requiredServices: requiredServices as (typeof serviceOptions)[number][],
        preferredStartDate: preferredStartDate || undefined,
        budgetRange: (budgetRange as (typeof budgetRanges)[number]) || undefined,
        description: description || undefined,
        preferredContact: preferredContact as (typeof contactMethods)[number],
      },
    })
    return {
      status: 'success',
      message: 'Thank you. Your consultation request has been received.',
    }
  } catch {
    return {
      status: 'error',
      message: 'We could not submit your request. Please check the details and try again.',
    }
  }
}
