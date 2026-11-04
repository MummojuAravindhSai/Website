import type { Access, CollectionConfig } from 'payload'

const isAdmin: Access = ({ req }) => req.user?.collection === 'admins'

export const Testimonials: CollectionConfig = {
  slug: 'testimonials',
  admin: {
    group: 'Website',
    useAsTitle: 'clientLabel',
    defaultColumns: ['clientLabel', 'projectLabel', '_status'],
  },
  access: {
    create: isAdmin,
    delete: isAdmin,
    read: ({ req }) =>
      req.user?.collection === 'admins' ? true : { _status: { equals: 'published' } },
    update: isAdmin,
  },
  versions: { drafts: true, maxPerDoc: 10 },
  fields: [
    { name: 'quote', type: 'textarea', required: true },
    {
      name: 'clientLabel',
      type: 'text',
      required: true,
      admin: { description: 'Use a privacy-safe verified label, not an invented client name.' },
    },
    { name: 'projectLabel', type: 'text' },
    { name: 'isSample', type: 'checkbox', defaultValue: true },
  ],
}
