import { Injectable, NotFoundException } from '@nestjs/common'
import { LoggerService } from '@/shared/modules/logger/logger.service'
import { ConfigService } from '@nestjs/config'
import {
  IAssociationOutput,
  IFoundationOutput,
  ISiafSearchOrganismeOneOutput,
  fromAssociationToBasicOrganisme,
  fromFoundationToBasicOrganisme,
  organismeCategoryKey,
  EOrganismeCategory,
} from '@biblio-num/shared'
import axios, { AxiosInstance, CreateAxiosDefaults, HttpStatusCode, RawAxiosResponseHeaders } from 'axios'
import { Stream } from 'node:stream'
import { IRafEvent } from '@biblio-num/shared/types/hub/raf-event.interface'
import { InjectRepository } from '@nestjs/typeorm'
import { Dossier } from '../../dossiers/objects/entities/dossier.entity'
import { Repository } from 'typeorm'
import { Demarche } from '../../demarches/objects/entities/demarche.entity'
import { PdfExportService } from '@/shared/modules/pdf-export/pdf-export.service'
import { OrganismeFicheGenerator } from '@/shared/modules/pdf-export/generators/fiche-organisme.generator'
import { HttpHeaders } from '@/shared/constants/http-headers.constants'

const ePathCompletedOrganismeByType = {
  association: '/associations',
  foundation: '/fondations',
} as const

export interface IHubFileResponse {
  data: Stream;
  headers: RawAxiosResponseHeaders;
}

@Injectable()
export class HubService {
  axios: AxiosInstance
  axiosFiles: AxiosInstance
  axiosConfig: CreateAxiosDefaults

  constructor(
    protected logger: LoggerService,
    private readonly config: ConfigService,
    @InjectRepository(Dossier) protected readonly repoDossier: Repository<Dossier>,
    @InjectRepository(Demarche) protected readonly repoDemarche: Repository<Demarche>,
    private readonly pdfExportService: PdfExportService,
  ) {
    this.logger.setContext(this.constructor.name)

    this.axiosConfig = {
      baseURL: this.config.get('siafHub.url'),
      headers: {
        'X-API-KEY': `${this.config.get('siafHub.key')}`,
        'Content-Type': 'application/json',
      },
    }
    this.axios = axios.create(this.axiosConfig)
    this.axiosFiles = axios.create(this.axiosConfig)
    this.axios.interceptors.response.use(response => response, e => {
      const code = e.response?.status
      if (code === 404) {
        this.logger.warn(e.response?.data?.detail)
        throw new NotFoundException(e.response?.data?.detail)
      }
      throw e
    })
  }

  async _getFileToStream(id: string, uuid: string, pathRoot: string): Promise<IHubFileResponse> {
    this.logger.verbose('HUB-getFile')
    const url = `${pathRoot}/${id}/attachment/${uuid}`

    try {
      const resp = await this.axiosFiles.get(url, {
        responseType: 'stream',
      })

      return {
        data: resp.data,
        headers: resp.headers,
      }
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === HttpStatusCode.NotFound) {
        this.logger.warn(`HUB-getFile: Fichier introuvable pour l'UUID ${uuid}`)
        throw new NotFoundException('Le fichier demandé est introuvable.')
      }
      throw error
    }
  }

  //#region ASSOCIATIONS
  async getAssociation(idRna: string): Promise<IAssociationOutput | null> {
    this.logger.verbose('HUB-getAssociation')
    const path = `${ePathCompletedOrganismeByType.association}/${idRna}`
    return this.axios.get<IAssociationOutput>(path).then(r => r.data)
  }

  async getEventsAssociation(idRna:string): Promise<IRafEvent[]> {
    const eventPath = `${ePathCompletedOrganismeByType.association}/${idRna}/events`
    return await this.axios.get<{events:IRafEvent[]}>(eventPath).then(r => {
      return r.data.events
    }).catch(error => {
      if (error.response?.statusCode === HttpStatusCode.NotFound) {
        this.logger.warn(`Aucun événement trouvé pour l'association ${idRna}`)
        return []
      }
      throw error
    })
  }

  async getAssociationFile(id: string, uuid: string): Promise<IHubFileResponse> {
    this.logger.verbose('HUB-getAssociationFile')
    return this._getFileToStream(id, uuid, ePathCompletedOrganismeByType.association)
  }
  //#endregion ASSOCIATIONS

  //#region FOUNDATIONS
  async getFoundation(idRnf: string): Promise<IFoundationOutput | null> {
    this.logger.verbose('HUB-getFondation')
    const path = `${ePathCompletedOrganismeByType.foundation}/${idRnf}`
    return this.axios.get<IFoundationOutput>(path).then(response => {
      return {
        ...response.data,
      }
    })
  }

  async getEventsFoundation(idRnf:string): Promise<IRafEvent[]> {
    const eventPath = `${ePathCompletedOrganismeByType.foundation}/${idRnf}/events`
    return await this.axios.get<{events:IRafEvent[]}>(eventPath).then(r => {
      return r.data.events
    }).catch(error => {
      if (error.response?.statusCode === HttpStatusCode.NotFound) {
        this.logger.warn(`Aucun événement trouvé pour la fondation ${idRnf}`)
        return []
      }
      throw error
    })
  }

  async getFoundationFile(id: string, uuid: string): Promise<IHubFileResponse> {
    this.logger.verbose('HUB-getFoundationFile')
    return this._getFileToStream(id, uuid, ePathCompletedOrganismeByType.foundation)
  }
  //#endregion FOUNDATIONS

  async searchOrganisme(sentence: string): Promise<ISiafSearchOrganismeOneOutput[]> {
    const cleanedSentence = sentence.trim()
    this.logger.verbose(`HUB-search: ${cleanedSentence}`)
    const path = `/generic/full_text_search/${encodeURIComponent(cleanedSentence)}`
    return this.axios.get(path)
      // @ts-ignore TODO: separate type from HUB to Bibli
      .then((r) => r?.data?.search_response
        .map((r2: {entity: IAssociationOutput | IFoundationOutput, entity_type: organismeCategoryKey}) => {
          if (r2.entity_type === EOrganismeCategory.association) {
            return fromAssociationToBasicOrganisme(r2.entity as IAssociationOutput)
          } else {
            return fromFoundationToBasicOrganisme(r2.entity as IFoundationOutput)
          }
        }),
      )
  }

  async setLinkDemarcheAndDossier(events: IRafEvent[]): Promise<IRafEvent[]> {
    this.logger.verbose('setLinkDemarcheAndDossier')
    const demarcheNumbers = events.map(evt => evt.demarcheNumber)
    const demarches = demarcheNumbers?.length
      ? await this.repoDemarche.createQueryBuilder('demarche')
        .select([
          'demarche.id',
          'demarche.title',
          'demarche.dsId',
        ])
        .where('demarche.dsId IN (:...ids)', {
          ids: [...new Set(demarcheNumbers)],
        })
        .getMany()
      : []
    const dossierNumbers = events.map(evt => evt.dossierNumber)
    const dossiers = dossierNumbers?.length
      ? await this.repoDossier
        .createQueryBuilder('dossier')
        .select([
          'dossier.id',
          'dossier.sourceId',
        ])
        .where('dossier.sourceId IN (:...ids)', {
          ids: [...new Set(dossierNumbers)],
        })
        .getMany()
      : []

    return events.map(evt => {
      if (evt.demarcheNumber) {
        const demarche = demarches.find(dm => dm.dsId === evt.demarcheNumber)
        if (demarche) {
          evt.demarcheLocalId = demarche.id
          evt.demarcheLocalName = demarche.title
        }
      }
      if (evt.dossierNumber) {
        const dossier = dossiers.find(d => +d.sourceId === evt.dossierNumber)
        if (dossier) {
          evt.dossierLocalNumber = dossier.id
        }
      }
      return evt
    })
  }

  async exportOrganisme(organisme: IFoundationOutput | IAssociationOutput): Promise<IHubFileResponse> {
    this.logger.verbose('HUB-exportFoundation')

    const stream = await this.pdfExportService.createPdf(
      OrganismeFicheGenerator,
      organisme,
    )

    const filename = `Organisme_${organisme.id}.pdf`
    const headers = {
      [HttpHeaders.CONTENT_TYPE]: 'application/pdf',
      [HttpHeaders.CONTENT_DISPOSITION]: `attachment; filename="${filename}"`,
      [HttpHeaders.TRANSFER_ENCODING]: 'chunked',
      [HttpHeaders.CACHE_CONTROL]: 'no-cache, no-store, must-revalidate',
    }

    return {
      data: stream,
      headers,
    }
  }
}
