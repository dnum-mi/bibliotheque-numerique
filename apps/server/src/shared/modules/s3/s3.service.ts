import { Injectable, OnModuleInit } from '@nestjs/common'
import { LoggerService } from '@/shared/modules/logger/logger.service'
import { ConfigService } from '@nestjs/config'
import { S3 } from 'aws-sdk/clients/browser_default'
import * as AWS from 'aws-sdk'
import { HttpService } from '@nestjs/axios'
import stream, { PassThrough } from 'stream'
import { ManagedUpload } from 'aws-sdk/lib/s3/managed_upload'
import SendData = ManagedUpload.SendData

@Injectable()
export class S3Service implements OnModuleInit {
  private s3: S3
  private bucketName: string

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
    private logger: LoggerService,
  ) {
    this.logger.setContext(this.constructor.name)
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
    // TODO: for what ?
    //  this.maxFileSize = parseInt(
    //    (await this.bnConfigService.findByKeyName(
    //      eBnConfiguration.FILE_MAXIMUM_SIZE,
    //    )).stringValue,
    //  )
  }

  public async getStreamedFile(uuid: string): Promise<stream.Readable> {
    return this.s3
      .getObject({
        Bucket: this.bucketName,
        Key: uuid,
      })
      .createReadStream()
  }

  public async downloadAndUploadToS3(url: string, uuid: string): Promise<SendData> {
    this.logger.verbose('downloadAndUploadToS3')
    const stream = await this.httpService.axiosRef({
      url,
      method: 'GET',
      responseType: 'stream',
    })
    const passThrough = new PassThrough()
    stream.data.pipe(passThrough)
    return this.s3.upload({
      Bucket: this.bucketName,
      Key: uuid,
      Body: passThrough,
    }).promise()
  }
}
