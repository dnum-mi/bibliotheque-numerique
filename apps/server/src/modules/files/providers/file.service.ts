import { Injectable } from '@nestjs/common'
import { File } from '../objects/entities/file.entity'
import { LoggerService } from '@/shared/modules/logger/logger.service'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { BaseEntityService } from '@/shared/base-entity/base-entity.service'
import {
  SmallFileOutputDto,
  smallFileOutputKeys,
} from '@/modules/files/objects/dto/output/small-file-output.dto'
import { eFileMimeType, eState, FileTagKey, StateKey } from '@biblio-num/shared'
import { ChampDescriptor, File as TFile } from '@dnum-mi/ds-api-client'
import { doesTextContainBnCode } from '@/shared/utils/bn-code.utils'
import { allCodes } from '@/modules/files/objects/const/tag-dictionnary.const'
import { TagDefinition } from '@/modules/files/objects/types/tag-definition.type'
import { UpsertDsFileDto } from '@/modules/files/objects/dto/input/upsert-ds-file.dto'
import { v4 } from 'uuid'

@Injectable()
export class FileService extends BaseEntityService<File> {
  constructor(
    protected logger: LoggerService,
    @InjectRepository(File) protected repo: Repository<File>,
  ) {
    super(repo, logger)
    this.logger.setContext(this.constructor.name)
  }

  //#region STATIC
  static buildCompleteName(smallFile: SmallFileOutputDto): string {
    if (smallFile.mimeType === eFileMimeType.unknown) {
      return smallFile.label
    }
    return `${smallFile.label}.${smallFile.mimeType}`
  }

  static getTagFromChampsDescriptor(
    champDescriptor: ChampDescriptor,
  ): FileTagKey | undefined {
    if (champDescriptor.description?.length) {
      const code = doesTextContainBnCode(champDescriptor.description)
      if (code) {
        const tagDefinition: TagDefinition = allCodes[code]
        if (tagDefinition) {
          return tagDefinition.tag
        }
      }
    }
  }

  //#endregion

  //#region PRIVATE
  private async _findExistingFile(
    payload: UpsertDsFileDto,
  ): Promise<File | null> {
    return this.repo.findOne({
      where: {
        sourceIndex: payload.sourceIndex,
        sourceLabel: payload.sourceLabel,
        dossier: { id: payload.dossierId },
        sourceStringId: payload.sourceStringId ?? null,
      },
    })
  }

  //#endregion

  //#region public
  async findOneWithUuid(uuid: string): Promise<SmallFileOutputDto> {
    this.logger.verbose('findOneWithUuid')
    this.logger.debug(`UUID: ${uuid}`)
    return this.findOneOrThrow({
      where: { uuid },
      select: smallFileOutputKeys,
    })
  }

  async createIfNew(payload: UpsertDsFileDto): Promise<File> {
    const existingFile = await this._findExistingFile(payload)
    if (!existingFile) {
      return this.repo
        .insert({
          dossier: { id: payload.dossierId },
          sourceLabel: payload.sourceLabel,
          sourceIndex: payload.sourceIndex ?? null,
          sourceStringId: payload.sourceStringId ?? null,
          state: eState.queued,
          tag: payload.tag,
          mimeType: eFileMimeType.unknown,
          label: 'to-be-constructed',
          uuid: v4(),
        })
        .then((res) => res.raw[0])
    }
    await this.updateState(existingFile.id, eState.queued)
    return existingFile
  }

  async copyDsFileInformation(id: number, dsFile: TFile): Promise<void> {
    await this.repo.update(
      { id },
      {
        originalLabel: dsFile.filename,
        byteSize: dsFile.byteSize,
        checksum: dsFile.checksum,
      },
    )
  }

  async updateState(id: number, state: StateKey): Promise<void> {
    await this.repo.update({ id }, { state })
  }

  //#endregion
}
