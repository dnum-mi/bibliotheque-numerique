import bnApiClient, { hubApiClient } from '@/api/api-client'
import useToaster from '@/composables/use-toaster'
import type { IFile, organismeCategoryKey } from '@biblio-num/shared'
import type { AxiosResponse } from 'axios'
import { normalizeFileResponse } from './file.utils'

export interface IDownloadFileParams {
  organismeType: organismeCategoryKey
  organismeId: string
  file: IFile
}

export interface IDownloadMultipeFilesParams {
  organismeType: organismeCategoryKey
  organismeId: string
  fileIds: string[]
}

const toaster = useToaster()

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
    const { blob, filename } = normalizeFileResponse(response, fallbackName, mimeType)
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

export const downloadFicheOrganisme = async ({ organismeType, organismeId }: Omit<IDownloadFileParams, 'file'>) => {
  try {
    const response = await hubApiClient.hubExportOrganisme(organismeType, organismeId)
    return _commonDownloadFile(response, `${organismeType}_${organismeId}`, '.pdf')
  } catch (error) {
    console.error(error)
    toaster.addMessage({
      description: 'Le fichier n\'est pas téléchargeable',
      type: 'error',
    })
  }
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

export const downloadHubMultipleFiles = async ({ organismeType, organismeId, fileIds }: IDownloadMultipeFilesParams) => {
  try {
    const response = await hubApiClient.hubGetMultipleFiles(organismeType, organismeId, fileIds)
    return _commonDownloadFile(response, organismeId, '.zip')
  } catch (error) {
    console.error(error)
    toaster.addMessage({
      description: 'Impossible de télécharger les fichiers',
      type: 'error',
    })
  }
}

export const fetchHubFileBlobForPreview = async ({ organismeType, organismeId, file }: IDownloadFileParams) => {
  try {
    const response = await hubApiClient.hubGetFile(organismeType, organismeId, file.id)

    const { blob, filename, mimeType: contentType } = normalizeFileResponse(response, file.name, file.mimeType)

    return { blob, filename, contentType }
  } catch (error) {
    console.error(error)
    toaster.addMessage({
      description: 'Impossible de charger le fichier',
      type: 'error',
    })
    throw error
  }
}
