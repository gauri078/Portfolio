import {orderableDocumentListDeskItem} from '@sanity/orderable-document-list'
import {ProjectsIcon} from '@sanity/icons/Projects'

// The left-hand menu of the Studio. Projects are shown as a drag-to-reorder list.
// The order you set here is stored on each project (hidden "orderRank" field),
// and the website sorts by it. Project is the only content type on purpose:
// homepage copy, nav and footer stay in code.
export const structure = (S, context) =>
  S.list()
    .title('Content')
    .items([
      orderableDocumentListDeskItem({
        type: 'project',
        title: 'Projects',
        icon: ProjectsIcon,
        S,
        context,
      }),
    ])
