import {defineField, defineType} from 'sanity'
import {SplitHorizontalIcon} from '@sanity/icons/SplitHorizontal'
import {requireImage} from '../helpers'

// Block 4: two images side by side (stacked on phones). Each has its own alt text and caption.
export const imagePair = defineType({
  name: 'imagePair',
  title: 'Two images side by side',
  type: 'object',
  icon: SplitHorizontalIcon,
  fields: [
    defineField({name: 'left', title: 'Left image', type: 'figure', validation: requireImage}),
    defineField({name: 'right', title: 'Right image', type: 'figure', validation: requireImage}),
  ],
  preview: {
    select: {media: 'left', left: 'left.alt', right: 'right.alt'},
    prepare: ({media, left, right}) => ({
      title: [left, right].filter(Boolean).join('  |  ') || 'Two images',
      subtitle: 'Two images side by side',
      media,
    }),
  },
})
