import { Repository } from 'typeorm'
import { Express } from 'express'
import stream, { PassThrough } from 'node:stream'
import { Injectable, NotFoundException, UnprocessableEntityException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { ConfigService } from '@nestjs/config'
import * as AWS from 'aws-sdk'
import { HttpService } from '@nestjs/axios'
import { AxiosResponse } from 'axios'
import { randomStringGenerator } from '@nestjs/common/utils/random-string-generator.util'
import { S3 } from 'aws-sdk/clients/browser_default'

import { LoggerService } from '@/shared/modules/logger/logger.service'
import { FileStorage } from '../objects/entities/file-storage.entity'
import { FileStorageOutputDto } from '@/modules/files/objects/dto/outputs/file-storage-output.dto'

@Injectable()
export class FileService {
  private s3: S3
  private bucketName: string
  private authorizedExtensions: string
  private maxFileSize: number

  constructor (
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
    private logger: LoggerService,
    @InjectRepository(FileStorage) private repo: Repository<FileStorage>,
  ) {
    this.logger.setContext(this.constructor.name)
    this.s3 = new AWS.S3({
      accessKeyId: this.configService.get('file.accessKeyId'),
      secretAccessKey: this.configService.get('file.secretAccessKey'),
      endpoint: this.configService.get('file.awsDefaultS3Url'),
      region: this.configService.get('file.awsS3Region'),
      s3ForcePathStyle: true,
    })
    this.bucketName = this.configService.get('file.awsDefaultS3Bucket')!
    this.authorizedExtensions = this.configService.get('file.authorizedExtensions')!
    this.maxFileSize = this.configService.get('file.maxFileSize')!
  }

  async uploadFile (file: Express.Multer.File, checksum: string = ''): Promise<FileStorage> {
    this.logger.verbose('uploadFile')
    if (!file) {
      throw new UnprocessableEntityException('File is not valid')
    }

    const originalName: string = file.originalname
    const fileExtension: string = this.fileExtension(originalName)
    const fileKey: string = this.fileNameGenerator(fileExtension)

    this.fileFilter(fileExtension)

    const uploadResult: S3.ManagedUpload.SendData = await this.s3Upload(file, fileKey)

    const fileStorage = await this.repo.save<Partial<FileStorage>>({
      name: fileKey,
      path: uploadResult.Location,
      originalName,
      checksum,
      byteSize: file.size,
      mimeType: file.mimetype,
    })
    delete fileStorage.path
    delete fileStorage.name
    return fileStorage
  }

  public async findFileStorage (fileStorageId: string): Promise<FileStorage> {
    this.logger.verbose('findFileStorage')
    return await this.repo.findOneBy({ id: fileStorageId })
  }

  public async getFile (fileStorageId: string): Promise<{ stream: stream.Readable; info: FileStorage }> {
    this.logger.verbose('getFile')
    const fileStorage: FileStorage = await this.findFileStorage(fileStorageId)

    if (fileStorage) {
      const stream: stream.Readable = this.s3GetObject(fileStorage.name)
      return { stream, info: fileStorage }
    }
    throw new NotFoundException("File doesn't exist")
  }

  async copyRemoteFile (fileUrl, checksum, byteSize, mimeType, fileName = null): Promise<FileStorageOutputDto> {
    this.logger.verbose('copyRemoteFile')

    fileName = fileName.isNull ? fileUrl.split('/').pop() : fileName
    const fileExtension: string = this.fileExtension(fileName)
    this.fileFilter(fileExtension)

    const stream: AxiosResponse<{
      pipe: (pt: PassThrough) => void
    }> = await this.downloadFile(fileUrl)

    const { passThrough, promise } = this.uploadFromStream(stream, this.fileNameGenerator(fileName))

    stream.data.pipe(passThrough)

    const { Key, Location } = await promise
    const fileStorage = await this.repo.save<Partial<FileStorage>>({
      name: Key,
      path: Location,
      originalName: fileName,
      checksum,
      byteSize,
      mimeType,
    })
    delete fileStorage.path
    delete fileStorage.name
    return fileStorage
  }

  async s3Upload (file: Express.Multer.File, fileKey: string): Promise<S3.ManagedUpload.SendData> {
    return await this.s3.upload({
      Bucket: this.bucketName,
      Key: fileKey,
      Body: file.buffer,
    }, { partSize: this.maxFileSize }).promise()
  }

  s3GetObject (Key: string): stream.Readable {
    return this.s3.getObject({
      Bucket: this.bucketName,
      Key,
    }).createReadStream()
  }

  uploadFromStream (
    fileResponse: AxiosResponse,
    fileName: string,
  ): {
    passThrough: PassThrough;
    promise: Promise<S3.ManagedUpload.SendData>;
  } {
    this.logger.verbose('uploadFromStream')
    const passThrough = new PassThrough()
    this.logger.debug({
      Bucket: this.configService.get('file.awsDefaultS3Bucket'),
      Key: fileName,
      ContentType: fileResponse.headers['content-type'],
    })
    const promise = this.s3
      .upload({
        Bucket: this.configService.get('file.awsDefaultS3Bucket'),
        Key: fileName,
        ContentType: fileResponse.headers['content-type'],
        Body: passThrough,
      })
      .promise()
    return { passThrough, promise }
  }

  async downloadFile (fileUrl: string): Promise<AxiosResponse> {
    this.logger.verbose('downloadFile')
    return await this.httpService.axiosRef({
      url: fileUrl,
      method: 'GET',
      responseType: 'stream',
    }).catch((error) => {
      this.logger.error(error as Error)
      throw new NotFoundException('File is not found')
    })
  }

  private fileFilter (fileExtension: string): void {
    this.logger.verbose('fileFilter')
    if (!this.authorizedExtensions.includes('*') && !this.authorizedExtensions.includes(fileExtension)) {
      throw new UnprocessableEntityException('File is not valid')
    }
  }

  private fileNameGenerator (fileExtension: string): string {
    this.logger.verbose('fileNameGenerator')
    return `${randomStringGenerator()}.${fileExtension.toLowerCase()}`
  }

  private fileExtension (fileName: string): string {
    this.logger.verbose('fileExtension')
    return fileName.slice((fileName.lastIndexOf('.') - 1 >>> 0) + 2)
  }
}
