import useToaster from '@/composables/use-toaster'

const toaster = useToaster()

const UNABLE_TO_WRITE_IN_CLIPBOARD = 'Impossible d’écrire dans le presse-papier'
const UNABLE_TO_COPY_IN_CLIPBOARD = 'Le lien n’a pas pu être copié dans le presse-papier'
const COPIED_IN_CLIPBOARD = 'Le lien a été copié dans le presse-papier'

export const copyCurrentUrlInClipboard = async () => {
  if (!window?.navigator?.clipboard) {
    toaster.addErrorMessage({ description: UNABLE_TO_WRITE_IN_CLIPBOARD })
    return
  }
  try {
    await navigator.clipboard.writeText(window?.location.href)
    toaster.addSuccessMessage({ description: COPIED_IN_CLIPBOARD })
  } catch {
    toaster.addErrorMessage({ description: UNABLE_TO_COPY_IN_CLIPBOARD })
  }
}
