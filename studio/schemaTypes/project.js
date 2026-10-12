import {defineArrayMember, defineField, defineType} from 'sanity'
import {ProjectsIcon} from '@sanity/icons/Projects'
import {orderRankField, orderRankOrdering} from '@sanity/orderable-document-list'

/**
 * A portfolio project: one row on the home page "selected work" list, and
 * (for new projects) one case study page built from content blocks.
 *
 * Publishing uses Sanity's normal draft and publish workflow. A project only
 * appears on the website once you press Publish.
 */
export const project = defineType({
  name: 'project',
  title: 'Project',
  type: 'document',
  icon: ProjectsIcon,
  orderings: [orderRankOrdering],

  groups: [
    {name: 'details', title: 'Details', default: true},
    {name: 'caseStudy', title: 'Case study'},
  ],

  fields: [
    // Hidden field that stores the drag-and-drop position in the Projects list.
    orderRankField({type: 'project'}),

    defineField({
      name: 'title',
      title: 'Project title',
      type: 'string',
      group: 'details',
      validation: (Rule) => Rule.required().max(80),
    }),
    defineField({
      name: 'slug',
      title: 'URL slug',
      type: 'slug',
      group: 'details',
      description:
        'The web address of the case study: yourdomain/work/this-slug. Click Generate, then shorten it if you like. Avoid changing it after you share the link.',
      options: {source: 'title', maxLength: 60},
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'summary',
      title: 'Short summary',
      type: 'text',
      rows: 3,
      group: 'details',
      description: 'The one or two sentences shown under the title on the home page list.',
      validation: (Rule) => Rule.required().max(260),
    }),
    defineField({
      name: 'category',
      title: 'Project category',
      type: 'string',
      group: 'details',
      description: 'Shown on the right of the list row. Separate parts with a dot, e.g. "UI/UX · Product design".',
      validation: (Rule) => Rule.required().max(60),
    }),
    defineField({
      name: 'year',
      title: 'Year',
      type: 'number',
      group: 'details',
      validation: (Rule) => Rule.required().integer().min(2015).max(2100),
    }),
    defineField({
      name: 'statusLabel',
      title: 'Status label (optional)',
      type: 'string',
      group: 'details',
      description:
        'A small pill beside the title, e.g. "under nda". If the project has no case study and no link, the row is shown as not clickable.',
      validation: (Rule) => Rule.max(40),
    }),
    defineField({
      name: 'thumbnail',
      title: 'Cover / thumbnail image',
      type: 'figure',
      group: 'details',
      description:
        'Optional for now. The home page list is text only, so this is held for link previews and future layouts.',
    }),
    defineField({
      name: 'role',
      title: 'My role',
      type: 'string',
      group: 'details',
      description: 'Shown in the case study header, e.g. "Solo designer, end to end".',
      validation: (Rule) => Rule.max(80),
    }),
    defineField({
      name: 'tools',
      title: 'Tools or skills used',
      type: 'array',
      group: 'details',
      of: [defineArrayMember({type: 'string'})],
      options: {layout: 'tags'},
      description: 'Type a tool or skill and press Enter, e.g. Figma, research, prototyping.',
    }),
    defineField({
      name: 'externalLink',
      title: 'External project link (optional)',
      type: 'url',
      group: 'details',
      description:
        'A live product, prototype or write-up elsewhere. If the project has no case study blocks, the list row links here.',
      validation: (Rule) => Rule.uri({scheme: ['http', 'https']}),
    }),
    defineField({
      name: 'accentColor',
      title: 'Accent colour',
      type: 'string',
      group: 'details',
      description:
        'Colours the case study page accents (headings, thread line, pills). Limited to your site palette so new pages stay on brand.',
      options: {
        list: [
          {title: 'Rose (home page)', value: 'rose'},
          {title: 'Indigo (laundry)', value: 'indigo'},
          {title: 'Sage (tapin)', value: 'sage'},
        ],
        layout: 'radio',
      },
      initialValue: 'rose',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'featured',
      title: 'Featured',
      type: 'boolean',
      group: 'details',
      description: 'Not used by the site yet. Held in case you want to highlight some projects later.',
      initialValue: false,
    }),
    defineField({
      name: 'legacyPath',
      title: 'Existing coded page (advanced)',
      type: 'string',
      group: 'details',
      description:
        'Only for the three case studies that are built in code. Choose which page this row opens. Leave empty for every new project.',
      options: {
        list: [
          {title: 'driver ben (/driverben)', value: '/driverben'},
          {title: 'untangling the knots (/laundry)', value: '/laundry'},
          {title: 'tapin (/tapin)', value: '/tapin'},
        ],
      },
    }),

    defineField({
      name: 'content',
      title: 'Case study content',
      type: 'array',
      group: 'caseStudy',
      description:
        'Add, remove and drag blocks to build the page in any order. Leave empty for a project without a case study page.',
      hidden: ({document}) => Boolean(document?.legacyPath),
      of: [
        defineArrayMember({type: 'richText'}),
        defineArrayMember({type: 'singleImage'}),
        defineArrayMember({type: 'fullWidthImage'}),
        defineArrayMember({type: 'imagePair'}),
        defineArrayMember({type: 'imageGallery'}),
        defineArrayMember({type: 'imageText'}),
        defineArrayMember({type: 'textImage'}),
        defineArrayMember({type: 'pullQuote'}),
        defineArrayMember({type: 'divider'}),
      ],
    }),
  ],

  preview: {
    select: {
      title: 'title',
      year: 'year',
      category: 'category',
      status: 'statusLabel',
      media: 'thumbnail',
    },
    prepare: ({title, year, category, status, media}) => ({
      title,
      subtitle: [year, category, status].filter(Boolean).join(' · '),
      media,
    }),
  },
})
