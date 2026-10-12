import {defineType} from 'sanity'
import {BlockContentIcon} from '@sanity/icons/BlockContent'
import {plainText, textField} from '../helpers'

// Block 1: headings, paragraphs, bold/italic text and links.
export const richText = defineType({
  name: 'richText',
  title: 'Rich text',
  type: 'object',
  icon: BlockContentIcon,
  fields: [textField({name: 'body', title: 'Text', styles: ['normal', 'h2', 'h3']})],
  preview: {
    select: {body: 'body'},
    prepare: ({body}) => ({title: plainText(body) || 'Empty text', subtitle: 'Rich text'}),
  },
})
