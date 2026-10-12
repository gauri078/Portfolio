import {defineField, defineType} from 'sanity'
import {ImageIcon} from '@sanity/icons/Image'
import {requireImage} from '../helpers'

// Block 2: one image in the normal reading column, with alt text and optional caption.
export const singleImage = defineType({
  name: 'singleImage',
  title: 'Single image',
  type: 'object',
  icon: ImageIcon,
  fields: [
    defineField({name: 'image', title: 'Image', type: 'figure', validation: requireImage}),
  ],
  preview: {
    select: {media: 'image', caption: 'image.caption', alt: 'image.alt'},
    prepare: ({media, caption, alt}) => ({
      title: caption || alt || 'Single image',
      subtitle: 'Single image',
      media,
    }),
  },
})
