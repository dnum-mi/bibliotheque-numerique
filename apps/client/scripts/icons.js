// @ts-check
// import { icons as mdiCollection } from '@iconify-json/mdi'
import { icons as riCollection } from '@iconify-json/ri'
import { icons as faCollection } from '@iconify-json/fa'
import { icons as vsCodeCollection } from '@iconify-json/vscode-icons'

const viCollection = {
  ...vsCodeCollection,
  prefix: 'vi',
}
/**
 * Liste de nom d’icônes **sans** le préfixe de la collection Remix Icons qui sont utilisées dans l’application
 * @type {string[]}
 */
const riIconNames = [
  'account-circle-line',
  'add-circle-line',
  'add-line',
  'arrow-go-back-fill',
  'arrow-go-back-line',
  'attachment-line',
  'bar-chart-box-line',
  'chat3-line',
  'checkbox-blank-circle-line',
  'checkbox-circle-fill',
  'checkbox-circle-line',
  'check-line',
  'close-circle-line',
  'close-fill',
  'close-line',
  'delete-bin-line',
  'edit-line',
  'external-link-fill',
  'eye-fill',
  'file-copy-line',
  'file-download-fill',
  'file-list2-fill',
  'file-list2-line',
  'file-pdf-fill',
  'file-pdf-line',
  'file-warning-fill',
  'filter-off-line',
  'flag-line',
  'focus3-line',
  'home2-line',
  'home4-line',
  'indeterminate-circle-line',
  'links-line',
  'lock-line',
  'logout-box-r-line',
  'pencil-line',
  'refresh-line',
  'save-line',
  'search-line',
  'shield-star-line',
  'sort-desc',
  'subtract-line',
  'tools-fill',
  'user-line',
  'user-settings-line',
]

const faIconNames = [
  'hourglass-half',
  'regular-check-circle',
  'regular-circle',
  'regular-file-excel',
  'regular-file-image',
  'regular-file-pdf',
  'regular-file-word',
]

const viIconNames = [
  'file-type-excel2',
  'file-type-image',
  'file-type-pdf2',
  'file-type-powerpoint2',
  'file-type-word2',
]

/**
 * Liste de tuples [collectionDIcônes, tableauDeNomsDIcônesUtiliséesDansLApplication]
 * @type {[import('@iconify/vue').IconifyJSON, string[]][]}
 */
export const collectionsToFilter = [
  [riCollection, riIconNames],
  [faCollection, faIconNames],
  [viCollection, viIconNames],
]
