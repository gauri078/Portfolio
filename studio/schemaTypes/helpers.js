import {defineArrayMember, defineField} from 'sanity'

/**
 * Validation for an image field: the editor must actually upload a picture.
 * (A plain "required" would pass as soon as only the alt text was filled in.)
 */
export const requireImage = (Rule) =>
  Rule.custom((value) => (value?.asset ? true : 'Upload an image.'))

/** First line of a rich text field, used for block previews in the Studio list. */
export function plainText(blocks = []) {
  const block = blocks.find((b) => b._type === 'block')
  return block?.children?.map((child) => child.text).join('') || ''
}

const STYLE_OPTIONS = {
  normal: {title: 'Paragraph', value: 'normal'},
  h2: {title: 'Heading (large)', value: 'h2'},
  h3: {title: 'Heading (small)', value: 'h3'},
}

/**
 * One kind of rich text: paragraphs and headings, bold, italic and links.
 * No lists or other styles, to match the design. Links may be full web
 * addresses, email or phone links, or on-site paths such as /driverben.
 */
export function textMember(styles = ['normal', 'h2', 'h3']) {
  return defineArrayMember({
    type: 'block',
    styles: styles.map((style) => STYLE_OPTIONS[style]),
    lists: [],
    marks: {
      decorators: [
        {title: 'Bold', value: 'strong'},
        {title: 'Italic', value: 'em'},
      ],
      annotations: [
        {
          name: 'link',
          type: 'object',
          title: 'Link',
          fields: [
            defineField({
              name: 'href',
              title: 'URL',
              type: 'url',
              validation: (Rule) =>
                Rule.required().uri({
                  scheme: ['http', 'https', 'mailto', 'tel'],
                  allowRelative: true,
                }),
            }),
          ],
        },
      ],
    },
  })
}

/** A ready-made rich text field. */
export function textField({name = 'body', title = 'Text', styles}) {
  return defineField({
    name,
    title,
    type: 'array',
    of: [textMember(styles)],
    validation: (Rule) => Rule.required().min(1).error('Add some text.'),
  })
}
