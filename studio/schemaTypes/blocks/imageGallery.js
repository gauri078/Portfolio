import {defineField, defineType} from 'sanity'
import {ImagesIcon} from '@sanity/icons/Images'
import {requireImage} from '../helpers'

// Block 5: a set of images in a grid. Drag the images to reorder them.
export const imageGallery = defineType({
  name: 'imageGallery',
  title: 'Image gallery',
  type: 'object',
  icon: ImagesIcon,
  fields: [
    defineField({
      name: 'images',
      title: 'Images',
      type: 'array',
      of: [{type: 'figure', validation: requireImage}],
      options: {layout: 'grid'},
      validation: (Rule) =>
        Rule.required().min(2).max(12).error('A gallery needs between 2 and 12 images.'),
    }),
    defineField({
      name: 'columns',
      title: 'Columns',
      type: 'number',
      description: 'How many images sit side by side on a wide screen. Phones always use fewer.',
      options: {
        list: [
          {title: '2 columns', value: 2},
          {title: '3 columns', value: 3},
        ],
        layout: 'radio',
      },
      initialValue: 3,
      validation: (Rule) => Rule.required(),
    }),
  ],
  preview: {
    select: {images: 'images'},
    prepare: ({images}) => {
      const count = images?.length || 0
      return {
        title: `${count} image${count === 1 ? '' : 's'}`,
        subtitle: 'Image gallery',
        media: images?.[0],
      }
    },
  },
})
