import {defineField, defineType} from 'sanity'
import {ImageIcon} from '@sanity/icons/Image'

/**
 * The one image type used everywhere in a case study. Uploads go through
 * Sanity's asset system. "Hotspot" lets you pick the focal point so crops
 * (banner, gallery tiles) keep the important part of the picture.
 */
export const figure = defineType({
  name: 'figure',
  title: 'Image',
  type: 'image',
  icon: ImageIcon,
  options: {hotspot: true},
  fields: [
    defineField({
      name: 'alt',
      title: 'Alt text',
      type: 'string',
      description:
        'Describe the image for people using screen readers. Short and factual, e.g. "Hostel laundry room with overflowing baskets".',
      validation: (Rule) =>
        Rule.max(200).custom((alt, context) => {
          const hasImage = Boolean(context.parent?.asset)
          return hasImage && !alt ? 'Add alt text so the image is accessible.' : true
        }),
    }),
    defineField({
      name: 'caption',
      title: 'Caption (optional)',
      type: 'string',
      validation: (Rule) => Rule.max(240),
    }),
  ],
  preview: {
    select: {media: 'asset', title: 'caption', subtitle: 'alt'},
    prepare: ({media, title, subtitle}) => ({
      media,
      title: title || subtitle || 'Image',
      subtitle: title ? subtitle : undefined,
    }),
  },
})
