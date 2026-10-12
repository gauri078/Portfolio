import {defineCliConfig} from 'sanity/cli'

// Command line settings. Project ID and dataset are public identifiers (like a
// street address), not secrets. No token belongs in this file.
export default defineCliConfig({
  api: {
    projectId: '1ht9hdq0',
    dataset: 'production',
  },
  deployment: {
    appId: 'dwizx4eqmfhzv2t5xz0mcrkk',
  },
})
