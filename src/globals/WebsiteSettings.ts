import type { GlobalConfig } from 'payload'

export const WebsiteSettings: GlobalConfig = {
  slug: 'website-settings',
  label: 'Website & contact settings',
  admin: { group: 'Settings' },
  access: {
    read: () => true,
    update: ({ req }) => req.user?.collection === 'admins',
  },
  fields: [
    {
      name: 'studioName',
      type: 'text',
      admin: { description: 'Use a placeholder until the legal/trading name is verified.' },
    },
    { name: 'studioDescriptor', type: 'text' },
    { name: 'primaryCity', type: 'text', defaultValue: 'Hyderabad, Telangana' },
    { name: 'email', type: 'email' },
    { name: 'mobile', type: 'text' },
    { name: 'whatsapp', type: 'text' },
    { name: 'address', type: 'textarea' },
    { name: 'instagramURL', type: 'text' },
    { name: 'consultationNote', type: 'textarea' },
  ],
}
