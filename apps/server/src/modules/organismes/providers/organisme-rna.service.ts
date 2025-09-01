import { Repository } from 'typeorm'
import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'

import { LoggerService } from '@/shared/modules/logger/logger.service'
import { HubService } from '@/modules/hub/providers/hub.service'
import { IGetUpdateAssociationInputDto } from '../objects/dto/get-updated-association-input.dto'
import { BaseEntityService } from '@/shared/base-entity/base-entity.service'
import { Organisme } from '../objects/organisme.entity'
import { OrganismeFieldTypeHash } from '../objects/const/organisme-field-type-hash.const'
import { FileService } from '@/modules/files/providers/file.service'
import { FileStorageInKey } from '@/modules/files/objects/const/file-storage-in.enum'

// TODO: Factorisation à faire: Déplacer tous les fonctions des associations ou rna de organismeService ici
@Injectable()
export class OrganismeRnaService extends BaseEntityService<Organisme> {
  constructor(
    protected logger: LoggerService,
    protected readonly hubService: HubService,
    @InjectRepository(Organisme) repo: Repository<Organisme>,
    protected readonly fileService: FileService,
  ) {
    super(repo, logger, OrganismeFieldTypeHash)
    this.logger.setContext(this.constructor.name)
  }

  async getLastUpdated(
    args: IGetUpdateAssociationInputDto,
  ): Promise<string[]> {
    this.logger.log('getLastUpdated')
    let ids: string[] = []
    let scrollId: string | undefined
    let max
    let count = 0
    do {
      const results = await this.hubService.getLastImportedAssociations(
        args.lastUpdatedAt,
        scrollId,
      )
      scrollId = results?.scroll_id
      if (results?.associations) {
        ids = ids.concat(
          results.associations
            ?.map((f) => f.id)
            .filter((id) => args.ids.includes(id)),
        )
        max = results.total_records
        count += results.associations.length
      }
      if (count >= max) {
        break
      }
    } while (scrollId)

    return ids
  }

  async deleteFiles(idRna: string, storageIn: FileStorageInKey): Promise<void> {
    const organisme = await this.repo.findOneBy({ idRna })
    if (!organisme) return

    await this.fileService.deleteFiles({ organismeId: organisme.id, dossierId: null, storageIn })
  }
}
