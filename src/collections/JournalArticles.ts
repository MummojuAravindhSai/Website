import type { Access, CollectionConfig } from 'payload'

const isAdmin: Access = ({ req }) => req.user?.collection === 'admins'

export const JournalArticles: CollectionConfig = {
  slug: 'journal-articles',
  labels: { singular: 'Journal article', plural: 'Journal' },
  admin: {
    group: 'Website',
    useAsTitle: 'title',
    defaultColumns: ['title', 'category', '_status', 'publishedOn'],
  },
  access: {
    create: isAdmin,
    delete: isAdmin,
    read: ({ req }) =>
      req.user?.collection === 'admins' ? true : { _status: { equals: 'published' } },
    update: isAdmin,
  },
  versions: {
    drafts: { autosave: true, schedulePublish: true },
    maxPerDoc: 20,
  },
  fields: [
    { name: 'title', type: 'text', required: true },
    { name: 'slug', type: 'text', required: true, unique: true, index: true },
    { name: 'category', type: 'text' },
    { name: 'excerpt', type: 'textarea', required: true },
    { name: 'body', type: 'textarea', required: true },
    { name: 'coverImage', type: 'upload', relationTo: 'media' },
    { name: 'publishedOn', type: 'date' },
    { name: 'isSample', type: 'checkbox', defaultValue: true },
  ],
}
