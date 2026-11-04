import * as migration_20261104_123151_initial from './20261104_123151_initial'
import * as migration_20261104_163042_add_media_storage_fields from './20261104_163042_add_media_storage_fields'

export const migrations = [
  {
    up: migration_20261104_123151_initial.up,
    down: migration_20261104_123151_initial.down,
    name: '20261104_123151_initial',
  },
  {
    up: migration_20261104_163042_add_media_storage_fields.up,
    down: migration_20261104_163042_add_media_storage_fields.down,
    name: '20261104_163042_add_media_storage_fields',
  },
]
