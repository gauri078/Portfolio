import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'

import {schemaTypes} from './schemaTypes'
import {structure} from './structure'

// Studio settings. Project ID and dataset are public identifiers, not secrets.
// You sign in to the Studio with your own Sanity account, so no token is needed.
export default defineConfig({
  name: 'default',
  title: 'Gauri Portfolio',

  projectId: '1ht9hdq0',
  dataset: 'production',

  plugins: [
    structureTool({structure}),
    // Query tester, handy in Phase C for checking what the website will receive.
    visionTool({defaultApiVersion: '2025-02-19'}),
  ],

  schema: {
    types: schemaTypes,
  },
})
