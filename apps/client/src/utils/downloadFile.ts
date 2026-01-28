import bnApiClient, { hubApiClient } from '@/api/api-client'
import useToaster from '@/composables/use-toaster'
import { getExtensionFromMimeType } from '@biblio-num/shared'
import type { IFile, organismeCategoryKey } from '@biblio-num/shared'
import type { AxiosResponse } from 'axios'

export interface IDownloadFileParams {
  organismeType: organismeCategoryKey
  organismeId: string
  file: IFile
}

const toaster = useToaster()

const _extractFilename = (contentDisposition: string | undefined, fallbackName: string): string => {
  if (!contentDisposition) {
    return fallbackName
  }

  const filenameMatch = contentDisposition?.match(/filename="(.+)"/)
  if (filenameMatch?.[1]) {
    return filenameMatch[1]
  }

  return fallbackName
}

const _ensureExtension = (filename: string, mimeType?: string): string => {
  if (/\.[a-z0-9]{2,5}$/i.test(filename) || !mimeType) {
    return filename
  }

  const extension = getExtensionFromMimeType(mimeType)

  return extension ? `${filename}.${extension}` : filename
}

const _triggerDownload = (blob: Blob, filename: string) => {
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  window.URL.revokeObjectURL(url)
}

const _commonDownloadFile = async (response: AxiosResponse, fallbackName: string, mimeType?: string) => {
  try {
    const data = response.data
    const headers = response.headers

    const contentType = headers['content-type'] || mimeType || 'pdf'
    const contentDisposition = headers['content-disposition']

    let filename = _extractFilename(contentDisposition, fallbackName)
    filename = _ensureExtension(filename, contentType)

    const blob = new Blob([data], { type: contentType })
    _triggerDownload(blob, filename)
  } catch (error) {
    console.error(error)
    toaster.addMessage({
      description: 'Le fichier n\'est pas téléchargeable',
      type: 'error',
    })
  }
}

export const downloadFile = async (fileUuid: string, fileLabel: string, fileMimeType: string) => {
  const response = await bnApiClient.getAttachmentFile(fileUuid)
  return _commonDownloadFile(response, fileLabel, fileMimeType)
}

export const downloadHubFile = async ({ organismeType, organismeId, file }: IDownloadFileParams) => {
  try {
    const response = await hubApiClient.hubGetFile(organismeType, organismeId, file.id)
    return _commonDownloadFile(response, file.name, file.mimeType)
  } catch (error) {
    console.error(error)
    toaster.addMessage({
      description: 'Le fichier n\'est pas téléchargeable',
      type: 'error',
    })
  }
}
