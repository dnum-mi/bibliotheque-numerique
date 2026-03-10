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
  ISearchHubInput,
  IOrganismeDossier,
  OrganismeKind,
  eOrganismeKind,
  eDossierSource,
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
import { SearchInputDto } from '../objects/dto/input/search-input.dto'
import {
  normalizeSource, normalizeStatut,
  sortByDateDepotDesc,
} from '../utils/organisme-dossier.utils'
import { DossierService } from '@/modules/dossiers/providers/dossier.service'

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
    private readonly dossierService: DossierService,
  ) {
    this.logger.setContext(this.constructor.name)

    this.axiosConfig = {
      baseURL: this.config.get('hub.url'),
      headers: {
        'X-API-KEY': `${this.config.get('hub.key')}`,
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

  async _getMultipleFilesToStream(id: string, uuids: string[], pathRoot: string): Promise<IHubFileResponse> {
    this.logger.verbose('HUB-getMultipleFilesToStream')
    const url = `${pathRoot}/${id}/attachments`

    try {
      const resp = await this.axiosFiles.post(
        url,
        [...uuids],
        { responseType: 'stream' },
      )

      return {
        data: resp.data,
        headers: resp.headers,
      }
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === HttpStatusCode.NotFound) {
        this.logger.warn('HUB-getMultipleFilesToStream: Fichiers introuvables')
        throw new NotFoundException('Les fichiers demandés sont introuvables.')
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

  async getAssociationMultipleFiles(id: string, uuids: string[]): Promise<IHubFileResponse> {
    this.logger.verbose('HUB-getAssociationMultipleFiles')
    return this._getMultipleFilesToStream(id, uuids, ePathCompletedOrganismeByType.association)
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

  async getFoundationMultipleFiles(id: string, uuids: string[]): Promise<IHubFileResponse> {
    this.logger.verbose('HUB-getFoundationMultipleFiles')
    return this._getMultipleFilesToStream(id, uuids, ePathCompletedOrganismeByType.foundation)
  }
  //#endregion FOUNDATIONS

  // #region SEARCH
  async searchOrganisme(searchInput: SearchInputDto): Promise<ISiafSearchOrganismeOneOutput[]> {
    const cleanedSentence = searchInput.sentence?.trim()
    this.logger.verbose(`HUB-search: ${cleanedSentence}`)
    const path = '/generic/full_text_search'

    return await this.axios.post(path, {
      sentence: cleanedSentence,
      size: searchInput.size,
      entity_type: searchInput.entityType,
    } as ISearchHubInput)
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

  // #endregion SEARCH
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

  async getAssociationDossiers(idRna: string): Promise<IOrganismeDossier[]> {
    return this._mergeDossiers(idRna, eOrganismeKind.Association)
  }

  async getFoundationDossiers(idRnf: string): Promise<IOrganismeDossier[]> {
    return this._mergeDossiers(idRnf, eOrganismeKind.Foundation)
  }

  private async _mergeDossiers(idRef: string, type: OrganismeKind): Promise<IOrganismeDossier[]> {
    const [eventsRows, bnRows] = await Promise.all([
      this._fetchAndMapEvents(idRef, type),
      this._fetchAndMapDsDossiers(idRef),
    ])

    const bnDossierById = new Map(
      bnRows
        .filter(d => d.id != null)
        .map(d => [d.id!, d]),
    )

    const merged: IOrganismeDossier[] = []

    const eventsByDossierId = new Map<number, IOrganismeDossier[]>()

    for (const event of eventsRows) {
      if (event.id == null) {
        merged.push(event)
        continue
      }
      if (!eventsByDossierId.has(event.id)) {
        eventsByDossierId.set(event.id, [])
      }
      eventsByDossierId.get(event.id)!.push(event)
    }

    for (const [dossierId, eventsGroup] of eventsByDossierId.entries()) {
      const bnDossier = bnDossierById.get(dossierId)

      if (!bnDossier) {
        this.logger.warn(`Dossier BN introuvable pour les events liés au dossier: ${dossierId}.`)

        eventsGroup.forEach(evt => {
          evt.statut = null
          evt.datePublication = null
          evt.dateDepot = null
          evt.dateDecision = null
          merged.push(evt)
        })
        continue
      }

      eventsGroup.forEach((evt, index) => {
        const isLastLine = index === eventsGroup.length - 1

        if (isLastLine) {
          evt.statut = bnDossier.statut
          evt.dateDecision = bnDossier.dateDecision
        } else {
          evt.isCorrection = true
          evt.statut = null
          evt.dateDecision = null
        }

        merged.push(evt)
      })

      bnDossierById.delete(dossierId)
    }

    merged.push(...bnDossierById.values())

    return sortByDateDepotDesc(merged)
  }

  private async _fetchAndMapEvents(idRef: string, type: OrganismeKind): Promise<IOrganismeDossier[]> {
    const rawEvents = type === eOrganismeKind.Association
      ? await this.getEventsAssociation(idRef)
      : await this.getEventsFoundation(idRef)

    const enrichedEvents = await this.setLinkDemarcheAndDossier(rawEvents)

    return enrichedEvents.map(evt => ({
      id: evt.dossierLocalNumber ?? null,
      dossierNumber: evt.dossierNumber ?? null,
      isCorrection: evt.isCorrection ?? false,
      demarche: evt.demarcheLocalName ?? evt.demarcheName,
      statut: normalizeStatut(evt.dsTraitementEvent),
      source: normalizeSource(evt.type),
      repere: null,
      dateDepot: null,
      dateDecision: null,
      datePublication: null,
    }))
  }

  private async _fetchAndMapDsDossiers(idRef: string): Promise<IOrganismeDossier[]> {
    const dossiers = await this.dossierService.findDossiersByOrganismeNumber(idRef)

    return dossiers.map(d => ({
      id: d.id,
      demarche: d.demarcheTitle,
      dossierNumber: d.sourceId ? Number(d.sourceId) : null,
      isCorrection: null,
      statut: d.state,
      dateDepot: d.dateDepot ?? null,
      source: eDossierSource.ds,
      repere: null,
      dateDecision: d.dateTraitement,
      datePublication: null,
    }))
  }
}
