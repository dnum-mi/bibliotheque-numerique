import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { In, Repository } from 'typeorm'

import { Dossier as TDossier, DossierState } from '@dnum-mi/ds-api-client/dist/@types/types'

import dayjs, { type Dayjs } from '@/shared/utils/dayjs'

import { LoggerService } from '@/shared/modules/logger/logger.service'

import { EInstructionTimeState, EInstructionTimeStateKey, instructionTimeValueDictionary } from '@biblio-num/shared'

import { InstructionTime } from './instruction_time.entity'
import { BaseEntityService } from '@/shared/base-entity/base-entity.service'
import { InjectRepository } from '@nestjs/typeorm'
import { DossierService } from '@/modules/dossiers/providers/dossier.service'
import { FieldService } from '@/modules/dossiers/providers/field.service'
import {
  fixFieldInstructionTimeDelay,
  fixFieldInstructionTimeStatus,
} from './constante/fix-field-instrucation-times.dictionnary'
import { startOfDay } from 'date-fns'
import {
  eInstructionTimeCode,
  InstructionTimeCodeKey,
  instructionTimeCodes,
} from '../dossiers/objects/constante/field-code.enum'

type TIntructionTime = Partial<Record<InstructionTimeCodeKey, Date | null>>

type TDelay = {
  endAt: Dayjs;
  startAt: Dayjs;
  stopAt: Dayjs;
  state: EInstructionTimeStateKey;
  isStop: boolean;
};

type toCheckDate = { date: Date | undefined | null; message: string };

@Injectable()
export class InstructionTimesService extends BaseEntityService<InstructionTime> {
  nbDaysAfterInstruction: number
  nbDaysAfterExtension: number
  nbDaysAfterIntentOpposition: number

  constructor (
    private configService: ConfigService,
    protected readonly logger: LoggerService,
    private readonly dossierService: DossierService,
    @InjectRepository(InstructionTime)
    protected readonly repo: Repository<InstructionTime>,
    protected fieldService: FieldService,
  ) {
    super(repo, logger)
    this.logger.setContext(this.constructor.name)
    this.nbDaysAfterInstruction = this.configService.get('instructionTime').NB_DAYS_AFTER_INSTRUCTION
    this.nbDaysAfterExtension = this.configService.get('instructionTime').NB_DAYS_AFTER_EXTENSION
    this.nbDaysAfterIntentOpposition = this.configService.get('instructionTime').NB_DAYS_AFTER_INTENT_OPPOSITION
  }

  async findByDossierId (id: number): Promise<InstructionTime> {
    return this.repo.findOne({
      where: { dossier: { id } },
      relations: { dossier: true },
    })
  }

  findOne (id: number): Promise<InstructionTime> {
    return this.findOneById(id)
  }

  findOneByDossier (idDossier: number): Promise<InstructionTime> {
    return this.findByDossierId(idDossier)
  }

  async getMappingInstructionTimeByDossierId(idDossier: number): Promise<TIntructionTime> {
    const fieldsFound = await this.fieldService.findWithFilter({
      dossierId: idDossier,
      code: In(instructionTimeCodes),
    })

    return Object.fromEntries(instructionTimeCodes.map(
      (instructionTimeCode) => {
        const f = fieldsFound.find(f => f.code === instructionTimeCode)
        return [instructionTimeCode, (f?.dateValue && startOfDay(f?.dateValue)) || null]
      },
    ))
  }

  async instructionTimeCalculation (idDossiers: number[]): Promise<void> {
    const instructionTimes = await this.repo.find({
      where: {
        dossier: {
          id: In(idDossiers),
        },
      },
      relations: { dossier: true },
    })

    await this.updateInstructionTimeToFields(instructionTimes)
  }

  async instructionTimeCalculationForAllDossier (): Promise<void> {
    this.logger.verbose('instructionTimeCalculationForAllDossier')
    const instructionTimes = await this.repo.find({ relations: { dossier: true } })
    await this.updateInstructionTimeToFields(instructionTimes)
  }

  private async updateInstructionTimeToFields(instructionTimes: InstructionTime[]): Promise<void> {
    await Promise.all(instructionTimes.map(async (instructionTime): Promise<void> => {
      const { dossier } = instructionTime
      let remainingTime = null
      let delayStatus = instructionTime.state
      if ([
        EInstructionTimeState.IN_EXTENSION,
        EInstructionTimeState.IN_PROGRESS,
        EInstructionTimeState.SECOND_RECEIPT as EInstructionTimeStateKey,
      ].includes(instructionTime.state)) {
        remainingTime = dayjs(instructionTime.endAt).startOf('day').diff(dayjs().startOf('day'), 'days')

        delayStatus = remainingTime > 0 ? instructionTime.state : EInstructionTimeState.OUT_OF_DATE
      } else if ([EInstructionTimeState.SECOND_REQUEST as EInstructionTimeStateKey].includes(instructionTime.state)) {
        const stopAt = dayjs(instructionTime.stopAt).startOf('day')
        remainingTime = dayjs(instructionTime.endAt).startOf('day').diff(stopAt, 'days')
        delayStatus = remainingTime > 0 ? instructionTime.state : EInstructionTimeState.OUT_OF_DATE
      } else if (instructionTime.state === EInstructionTimeState.INTENT_OPPO) {
        remainingTime = Math.max(0, dayjs(instructionTime.endAt).startOf('day').diff(dayjs().startOf('day'), 'days'))
      }

      let value = 0
      if (remainingTime != null && remainingTime >= 0) {
        value = Math.round(remainingTime)
      }
      let stringValue = ''
      if (delayStatus) {
        stringValue = instructionTimeValueDictionary[delayStatus]
      }

      await Promise.all([
        this.fieldService.upsert({
          sourceId: fixFieldInstructionTimeDelay.id,
          dossierId: dossier.id,
          numberValue: value,
          label: fixFieldInstructionTimeDelay.originalLabel,
          type: fixFieldInstructionTimeDelay.type,
          fieldSource: fixFieldInstructionTimeDelay.source,
          stringValue: `${value}`,
        }),
        this.fieldService.upsert({
          sourceId: fixFieldInstructionTimeStatus.id,
          dossierId: dossier.id,
          stringValue,
          label: fixFieldInstructionTimeStatus.originalLabel,
          type: fixFieldInstructionTimeStatus.type,
          fieldSource: fixFieldInstructionTimeStatus.source,
        }),
      ])
    }))
  }

  checkAndGetLastDates (date1: toCheckDate, date2: toCheckDate, messageError: string): toCheckDate {
    const dateBefore = date1?.date
    const dateAfter = date2?.date
    if (dateAfter && !dateBefore) {
      throw new Error(`${messageError} ${date1?.message || 'La premiére date'} est manaquante`)
    }

    if (!dateBefore) return undefined

    if (!dateAfter) return date1

    if (dayjs(dateBefore).isSameOrBefore(dateAfter, 'days')) {
      return date1
    }

    throw new Error(
      `${messageError} ${date2?.message || 'la seconde date'} est plus ancienne que ${
        date1?.message || 'le première date'
      }`,
    )
  }

  checkValidity (data: Partial<TDossier>, instructionTime: TIntructionTime): boolean {
    const messageError = `Erreur dans les déclarations de dates pour le dossier ${data.id}`
    const dateReceipt1stDemand = instructionTime[eInstructionTimeCode['first-demand-recieved-at']]
    const dateRequest1stDemand = instructionTime[eInstructionTimeCode['first-demand-at']]

    if (data.state === DossierState.EnConstruction) {
      if (dateReceipt1stDemand) {
        throw Error(
          `${messageError}: Ce dossier est en construction et posséde une date de récéption de 1er demande de piéce.`,
        )
      }
      return true
    }

    const forCheckDateReception1stDemand = {
      date: dateReceipt1stDemand,
      message: 'La date de réception de pièces',
    }

    this.checkAndGetLastDates(
      {
        date: dateRequest1stDemand,
        message: 'La date de demande de pièces',
      },
      forCheckDateReception1stDemand,
      `${messageError} pour la première demande:`,
    )

    if (this.isDossierClosed(data.state)) {
      return true
    }

    if (!data.datePassageEnInstruction) {
      throw Error(`${messageError}: La date d'instruction est manquante`)
    }

    if (dateRequest1stDemand && !dateReceipt1stDemand) {
      throw Error(`${messageError}: La date de reception de la 1ere demande est manquante`)
    }

    const dateInstruction = new Date(data.datePassageEnInstruction)
    const forCheckDateInstruction = {
      date: dateInstruction,
      message: "La date d'instruction",
    }

    if (dateReceipt1stDemand) {
      this.checkAndGetLastDates(forCheckDateReception1stDemand, forCheckDateInstruction, `${messageError}:`)
    }

    const isOk2ndDemand = this.checkAndGetLastDates(
      {
        date: instructionTime[eInstructionTimeCode['second-demand-at']],
        message: 'La date de demande de pièces',
      },
      {
        date: instructionTime[eInstructionTimeCode['second-demand-recieved-at']],
        message: 'La date de reception de pièces',
      },
      // eslint-disable-next-line no-irregular-whitespace
      `${messageError} pour la deuxième demande :`,
    )

    const forDateStart = dateReceipt1stDemand ? forCheckDateReception1stDemand : forCheckDateInstruction

    const forDateProrogation = {
      date: instructionTime[eInstructionTimeCode['extention-began-at']],
      message: 'La date de prorogation',
    }

    this.checkAndGetLastDates(forDateStart, forDateProrogation, `${messageError}`)

    if (
      forDateProrogation.date &&
      dayjs(forDateProrogation.date).diff(forDateStart.date, 'days') > this.nbDaysAfterInstruction
    ) {
      throw new Error(`${messageError} pour la date prorogation: Elle est aprés ${
        this.nbDaysAfterInstruction
      } jours par rapport à ${forDateStart.message.toLowerCase()}`)
    }

    this.checkAndGetLastDates(
      forDateProrogation,
      isOk2ndDemand || undefined,
      `${messageError} pour la date prorogation:`,
    )

    const nbDaysExtensionTotal = this.nbDaysAfterInstruction + this.nbDaysAfterExtension
    if (isOk2ndDemand?.date && dayjs(isOk2ndDemand.date).diff(forDateStart.date, 'days') > nbDaysExtensionTotal) {
      throw new Error(`${messageError} pour la date 2eme demande de piece: Elle est aprés ${nbDaysExtensionTotal} ` +
      `jours par rapport à ${forDateStart.message.toLowerCase()}`)
    }

    const forDateIntentionOppo = {
      date: instructionTime[eInstructionTimeCode['intent-to-oppose-at']],
      message: "La date d'intention opposition",
    }

    if (instructionTime[eInstructionTimeCode['extention-began-at']]) {
      this.checkAndGetLastDates(forDateProrogation, forDateIntentionOppo, `${messageError}: `)
    }

    this.checkAndGetLastDates(forDateStart, forDateIntentionOppo, `${messageError}`)

    return true
  }

  async proccessByDossierId (id: number): Promise<boolean> {
    this.logger.verbose(`proccessByDossierId: ${id}`)
    const dossier = await this.dossierService.findOneById(id)
    if (!dossier) {
      // TODO: à revoir
      return false
    }

    let instructionTime = await this.findByDossierId(id)

    if (!instructionTime) {
      instructionTime = new InstructionTime()
      instructionTime.state = EInstructionTimeState.DEFAULT
    }

    instructionTime.dossier = dossier
    await this.proccess(instructionTime)
    return true
  }

  async proccess (instructionTime: InstructionTime): Promise<InstructionTime> {
    const { dossier } = instructionTime
    const { state, datePassageEnInstruction } = dossier.dsDataJson

    if (this.isDossierClosed(state)) {
      return await this.saveIsClose(instructionTime)
    }

    const datesForInstructionTimes = await this.getMappingInstructionTimeByDossierId(dossier.id)

    try {
      this.checkValidity(dossier.dsDataJson, datesForInstructionTimes)
    } catch (error) {
      this.logger.error({
        short_message: `Erreur pendant la check Validity instruction time: ${dossier.id}`,
        full_message: error.stack,
      })
      instructionTime.state = EInstructionTimeState.IN_ERROR
      return this.repo.save(instructionTime)
    }

    if (state === DossierState.EnConstruction) {
      return await this.saveInConstruction(instructionTime, datesForInstructionTimes)
    }

    const delay = {} as TDelay

    if (datesForInstructionTimes['intent-to-oppose-at']) {
      this.delayOpposition(datesForInstructionTimes, delay)
    } else {
      this.dalayInstruction(dayjs(datesForInstructionTimes['first-demand-recieved-at'] ||
      datePassageEnInstruction), delay)

      if (datesForInstructionTimes['extention-began-at']) {
        this.delayProrogation(datesForInstructionTimes, delay)
      }

      if (datesForInstructionTimes['second-demand-at']) {
        this.delayDateRequest2(datesForInstructionTimes, delay)
      }

      if (datesForInstructionTimes['second-demand-recieved-at']) {
        this.delayDateReceipt2(datesForInstructionTimes, delay)
      }
    }
    return await this.saveInInstruction(instructionTime, delay)
  }

  private isDossierClosed (state): boolean {
    return ![DossierState.EnConstruction, DossierState.EnInstruction].includes(state)
  }

  private async saveInInstruction (instructionTime: InstructionTime, delay: TDelay): Promise<InstructionTime> {
    instructionTime.startAt = delay.startAt && delay.startAt.toDate()
    instructionTime.endAt = delay.endAt && delay.endAt.toDate()
    instructionTime.stopAt = delay.stopAt && delay.stopAt.toDate()
    instructionTime.state =
      [
        EInstructionTimeState.SECOND_REQUEST as EInstructionTimeStateKey,
        EInstructionTimeState.INTENT_OPPO as EInstructionTimeStateKey,
      ].includes(delay.state) || dayjs().isSameOrBefore(delay.endAt)
        ? delay.state
        : EInstructionTimeState.OUT_OF_DATE

    return this.repo.save(instructionTime)
  }

  private async saveInConstruction (
    instructionTime: InstructionTime,
    datesForInstructionTimes: TIntructionTime) : Promise<InstructionTime> {
    if (datesForInstructionTimes[eInstructionTimeCode['first-demand-at']]) {
      instructionTime.state = EInstructionTimeState.FIRST_REQUEST
    }
    if (instructionTime.state === undefined) instructionTime.state = EInstructionTimeState.DEFAULT
    return await this.repo.save(instructionTime)
  }

  private async saveIsClose (instructionTime: InstructionTime): Promise<InstructionTime> {
    instructionTime.state = EInstructionTimeState.DEFAULT
    return await this.repo.save(instructionTime)
  }

  private delayDateReceipt2 (datesForInstructionTimes: TIntructionTime, delay: TDelay) :void {
    delay.endAt = dayjs(datesForInstructionTimes['second-demand-at'])
      .startOf('day')
      .add(delay.endAt.diff(delay.stopAt, 'day'), 'day')

    delay.state = EInstructionTimeState.SECOND_RECEIPT
  }

  private delayDateRequest2 (datesForInstructionTimes: TIntructionTime, delay: TDelay) :void {
    delay.stopAt = dayjs(datesForInstructionTimes['second-demand-at'])
    delay.state = EInstructionTimeState.SECOND_REQUEST
  }

  private delayProrogation (datesForInstructionTimes: TIntructionTime, delay: TDelay) :void {
    const timeProrogation = datesForInstructionTimes['extention-began-at']
    const remainingtime = delay.endAt.diff(timeProrogation, 'day')
    delay.endAt = dayjs(timeProrogation).add(this.nbDaysAfterExtension, 'day').add(remainingtime, 'day')

    delay.state = EInstructionTimeState.IN_EXTENSION
  }

  private dalayInstruction (dateStart: Dayjs, delay: TDelay) :void {
    delay.startAt = dateStart
    delay.endAt = dayjs(dateStart).add(this.nbDaysAfterInstruction, 'day')
    delay.state = EInstructionTimeState.IN_PROGRESS
  }

  private delayOpposition (datesForInstructionTimes: TIntructionTime, delay: TDelay) :void {
    delay.startAt = dayjs(datesForInstructionTimes['intent-to-oppose-at'])
    delay.endAt = delay.startAt.add(this.nbDaysAfterIntentOpposition, 'day')

    delay.state = EInstructionTimeState.INTENT_OPPO
  }
}
