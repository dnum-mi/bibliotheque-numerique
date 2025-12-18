import bnApiClient, { hubApiClient } from '@/api/api-client'
import useToaster from '@/composables/use-toaster'
import type { organismeCategoryKey } from '@biblio-num/shared'

const toaster = useToaster()

const _commonDownloadFile = async (response: any, fileId: string) => {
  try {
    const blob = response.data
    const disposition = response.headers['content-disposition']
    const fileNameMatch = disposition?.match(/filename="(.+)"/)
    const fileName = fileNameMatch ? fileNameMatch[1] : `${fileId}.pdf`

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

export const downloadFile = async (fileUuid: string) => {
  const response = await bnApiClient.getAttachmentFile(fileUuid)
  return _commonDownloadFile(response, fileUuid)
}

export const downloadHubFile = async (type: organismeCategoryKey, organismeId: string, fileId: string) => {
  const response = await hubApiClient.hubGetFile(type, organismeId, fileId)
  return _commonDownloadFile(response, fileId)
}
