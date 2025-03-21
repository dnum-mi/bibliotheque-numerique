import bnApiClient from '@/api/api-client'
import useToaster from '@/composables/use-toaster'

const toaster = useToaster()

export const downloadFile = async (fileUuid: string) => {
  try {
    const response = await bnApiClient.getAttachmentFile(fileUuid)

    const blob = response.data
    const disposition = response.headers['content-disposition']
    const fileNameMatch = disposition?.match(/filename="(.+)"/)
    const fileName = fileNameMatch ? fileNameMatch[1] : `${fileUuid}.pdf`

    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = fileName
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  } catch (error) {
    console.error(error)
    toaster.addMessage({
      description: 'Le fichier n\'est pas téléchargable',
      type: 'error',
    })
  }
}
