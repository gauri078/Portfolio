import {project} from './project'
import {figure} from './figure'
import {richText} from './blocks/richText'
import {singleImage} from './blocks/singleImage'
import {fullWidthImage} from './blocks/fullWidthImage'
import {imagePair} from './blocks/imagePair'
import {imageGallery} from './blocks/imageGallery'
import {imageText, textImage} from './blocks/sideBySide'
import {pullQuote} from './blocks/pullQuote'
import {divider} from './blocks/divider'

// Every content type the Studio knows about. The content blocks are defined
// here in code; which blocks a project uses, and in what order, is chosen
// per project inside the Studio.
export const schemaTypes = [
  project,
  figure,
  richText,
  singleImage,
  fullWidthImage,
  imagePair,
  imageGallery,
  imageText,
  textImage,
  pullQuote,
  divider,
]
