import {defineField, defineType} from 'sanity'
import {ExpandIcon} from '@sanity/icons/Expand'
import {requireImage} from '../helpers'

// Block 3: an image that breaks out of the text column and spans the screen.
export const fullWidthImage = defineType({
  name: 'fullWidthImage',
  title: 'Full-width image',
  type: 'object',
  icon: ExpandIcon,
  fields: [
    defineField({name: 'image', title: 'Image', type: 'figure', validation: requireImage}),
    defineField({
      name: 'crop',
      title: 'Shape',
      type: 'string',
      description:
        'Banner crops the image to a wide strip around its focal point. Natural shows the whole image at its own proportions.',
      options: {
        list: [
          {title: 'Natural (whole image)', value: 'natural'},
          {title: 'Banner (wide crop)', value: 'banner'},
        ],
        layout: 'radio',
      },
      initialValue: 'natural',
      validation: (Rule) => Rule.required(),
    }),
  ],
  preview: {
    select: {media: 'image', caption: 'image.caption', alt: 'image.alt'},
    prepare: ({media, caption, alt}) => ({
      title: caption || alt || 'Full-width image',
      subtitle: 'Full-width image',
      media,
    }),
  },
})
