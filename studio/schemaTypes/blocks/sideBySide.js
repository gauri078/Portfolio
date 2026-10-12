import {defineField, defineType} from 'sanity'
import {PanelLeftIcon} from '@sanity/icons/PanelLeft'
import {PanelRightIcon} from '@sanity/icons/PanelRight'
import {plainText, requireImage, textField} from '../helpers'

/**
 * Blocks 6 and 7: an image next to some text. They are two separate blocks so
 * you pick the layout when you add it. The fields appear in the same order as
 * the layout on the page (image first, or text first), which makes the editor
 * read like the result.
 */
function sideBySide({name, title, imageFirst, icon}) {
  const imageField = defineField({
    name: 'image',
    title: 'Image',
    type: 'figure',
    validation: requireImage,
  })
  const bodyField = textField({name: 'body', title: 'Text', styles: ['normal', 'h3']})

  return defineType({
    name,
    title,
    type: 'object',
    icon,
    fields: imageFirst ? [imageField, bodyField] : [bodyField, imageField],
    preview: {
      select: {media: 'image', body: 'body'},
      prepare: ({media, body}) => ({
        title: plainText(body) || 'Empty text',
        subtitle: title,
        media,
      }),
    },
  })
}

export const imageText = sideBySide({
  name: 'imageText',
  title: 'Image + Text',
  imageFirst: true,
  icon: PanelLeftIcon,
})

export const textImage = sideBySide({
  name: 'textImage',
  title: 'Text + Image',
  imageFirst: false,
  icon: PanelRightIcon,
})
