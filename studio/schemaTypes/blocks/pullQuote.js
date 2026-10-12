import {defineField, defineType} from 'sanity'
import {BlockquoteIcon} from '@sanity/icons/Blockquote'

// Block 8: a highlighted line of text, e.g. a user quote or key insight.
export const pullQuote = defineType({
  name: 'pullQuote',
  title: 'Pull quote',
  type: 'object',
  icon: BlockquoteIcon,
  fields: [
    defineField({
      name: 'quote',
      title: 'Quote or highlighted text',
      type: 'text',
      rows: 3,
      validation: (Rule) => Rule.required().max(300),
    }),
    defineField({
      name: 'attribution',
      title: 'Attribution (optional)',
      type: 'string',
      description: 'Who said it, e.g. "Hostel resident, interview 3".',
      validation: (Rule) => Rule.max(100),
    }),
  ],
  preview: {
    select: {quote: 'quote', attribution: 'attribution'},
    prepare: ({quote, attribution}) => ({
      title: quote || 'Empty quote',
      subtitle: attribution ? `Pull quote, ${attribution}` : 'Pull quote',
    }),
  },
})
