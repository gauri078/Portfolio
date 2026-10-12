import {defineField, defineType} from 'sanity'
import {RemoveIcon} from '@sanity/icons/Remove'

// Block 9: a break between sections. "Thread line" is the loose-thread rule
// already used on the case study pages; "Space" is just empty room.
export const divider = defineType({
  name: 'divider',
  title: 'Divider',
  type: 'object',
  icon: RemoveIcon,
  fields: [
    defineField({
      name: 'style',
      title: 'Style',
      type: 'string',
      options: {
        list: [
          {title: 'Thread line', value: 'thread'},
          {title: 'Space only', value: 'space'},
        ],
        layout: 'radio',
      },
      initialValue: 'thread',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'size',
      title: 'Amount of space',
      type: 'string',
      options: {
        list: [
          {title: 'Small', value: 'small'},
          {title: 'Medium', value: 'medium'},
          {title: 'Large', value: 'large'},
        ],
        layout: 'radio',
      },
      initialValue: 'medium',
      hidden: ({parent}) => parent?.style !== 'space',
    }),
  ],
  preview: {
    select: {style: 'style', size: 'size'},
    prepare: ({style, size}) => ({
      title: style === 'space' ? `Space (${size || 'medium'})` : 'Thread line',
      subtitle: 'Divider',
    }),
  },
})
