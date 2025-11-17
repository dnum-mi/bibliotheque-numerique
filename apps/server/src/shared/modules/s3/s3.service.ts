import {
  HttpException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common'
import { LoggerService } from '@/shared/modules/logger/logger.service'
import { ConfigService } from '@nestjs/config'
import { S3 } from 'aws-sdk/clients/browser_default'
import * as AWS from 'aws-sdk'
import { HttpService } from '@nestjs/axios'
import stream, { PassThrough } from 'stream'

export interface S3CopyResult {
  checksum: string
  byteSize: number
  s3Key: string
}

@Injectable()
export class S3Service implements OnModuleInit {
  private s3: S3
  private bucketName: string
  private maarchBucketName: string

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
    private logger: LoggerService,
  ) {
    this.logger.setContext(this.constructor.name)
  }

  static manageS3StreamError(err: Error): HttpException {
    if (err.name?.startsWith('NoSuchKey')) {
      return new NotFoundException('File not found')
    } else {
      return new InternalServerErrorException(err)
    }
  }

  async onModuleInit(): Promise<void> {
    this.logger.verbose('onModuleInit')
    await this._init()
  }

  private async _init(): Promise<void> {
    this.s3 = new AWS.S3({
      accessKeyId: this.configService.get('file.accessKeyId'),
      secretAccessKey: this.configService.get('file.secretAccessKey'),
      endpoint: this.configService.get('file.awsDefaultS3Url'),
      region: this.configService.get('file.awsS3Region'),
      s3ForcePathStyle: true,
    })
    this.bucketName = this.configService.get('file.awsDefaultS3Bucket')!
    this.maarchBucketName = this.configService.get('file.awsMaarchS3Bucket')!
    // TODO: for what ?
    //  this.maxFileSize = parseInt(
    //    (await this.bnConfigService.findByKeyName(
    //      eBnConfiguration.FILE_MAXIMUM_SIZE,
    //    )).stringValue,
    //  )
  }

  public getStreamedFile(uuid: string): stream.Readable {
    return this.s3
      .getObject({
        Bucket: this.bucketName,
        Key: uuid,
      })
      .createReadStream()
  }

  public getCompleteFile(uuid: string): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const stream = this.getStreamedFile(uuid)
      const chunks: never[] = []
      stream.on('data', (chunk) => chunks.push(chunk as never))
      stream.on('end', () => resolve(Buffer.concat(chunks)))
      stream.on('error', (e) => {
        reject(S3Service.manageS3StreamError(e))
      })
    })
  }

  public async downloadAndUploadToS3(url: string, uuid: string): Promise<number> {
    this.logger.verbose('downloadAndUploadToS3')
    const stream = await this.httpService.axiosRef({
      url,
      method: 'GET',
      responseType: 'stream',
    })
    let byteSize = 0
    stream.data.on('data', (chunk) => {
      byteSize += chunk.length
    })
    const passThrough = new PassThrough()
    stream.data.pipe(passThrough)
    await this.s3.upload({
      Bucket: this.bucketName,
      Key: uuid,
      Body: passThrough,
    }).promise()
    return byteSize
  }

  public async deleteFile(uuid: string): Promise<void> {
    await this.s3.deleteObject({
      Bucket: this.bucketName,
      Key: uuid,
    }).promise()
  }

  public async copyFromSourceBucket(
    sourceS3Path: string,
    newKey: string,
  ): Promise<S3CopyResult> {
    this.logger.debug(
      `Copying 's3://${this.maarchBucketName}/${sourceS3Path}' to 's3://${this.bucketName}/${newKey}'`,
    )

    const copyResult = await this.s3.copyObject({
      Bucket: this.bucketName,
      CopySource: `${this.maarchBucketName}/${sourceS3Path}`,
      Key: newKey,
    }).promise()

    const headResult = await this.s3.headObject({
      Bucket: this.bucketName,
      Key: newKey,
    }).promise()

    if (!headResult.ContentLength || !headResult.ETag) {
      throw new InternalServerErrorException(
        `Failed to retrieve metadata for copied file: ${newKey}`,
      )
    }

    return {
      checksum: (headResult.ETag || copyResult.CopyObjectResult?.ETag || '').replace(/"/g, ''),
      byteSize: headResult.ContentLength || 0,
      s3Key: newKey,
    }
  }
}
