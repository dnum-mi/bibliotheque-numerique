import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common'
import { ApiResponse, ApiTags } from '@nestjs/swagger'
import { UserService } from '../providers/user.service'
import { IUser, Roles } from '@biblio-num/shared'
import { Role } from '@/modules/users/providers/decorators/role.decorator'
import { PublicRoute } from '@/modules/users/providers/decorators/public-route.decorator'
import { LoggerService } from '@/shared/modules/logger/logger.service'
import { CurrentUser } from '@/modules/users/providers/decorators/current-user.decorator'
import {
  CreateUserDto,
  PaginationUserDto,
} from '@/modules/users/objects/dtos/input'
import {
  PaginatedUserDto,
  UserOutputDto,
} from '@/modules/users/objects/dtos/output'
import { UsualApiOperation } from '@/shared/documentation/usual-api-operation.decorator'
import { FileInterceptor } from '@nestjs/platform-express'
import { XlsxService } from '@/shared/modules/xlsx/xlsx.service'
import { type Express } from 'express'
import { UserImportService } from '@/modules/users/providers/user-import.service'
import { ExcelUser } from '@/modules/users/objects/types/excel-user.type'
import {
  PasswordChangeRequestsDto,
} from '../objects/dtos/output/password-change-requests.dto'
import { ManagePasswordRequestDto } from '../objects/dtos/input/manage-password-request.dto'

@ApiTags('Users')
@Controller('users')
export class UserController {
  constructor(
    private readonly usersService: UserService,
    private logger: LoggerService,
    private readonly xlsxService: XlsxService,
    private readonly userImportService: UserImportService,
  ) {
    this.logger.setContext(this.constructor.name)
  }

  @Post()
  @UsualApiOperation({
    summary: 'Créer un utilisateur.',
    method: 'POST',
    minimumRole: 'aucun',
    responseType: UserOutputDto,
  })
  @PublicRoute()
  async signUp(@Body() body: CreateUserDto): Promise<UserOutputDto> {
    this.logger.verbose('signUp')
    const user = await this.usersService.create(body)
    return Object.fromEntries(
      [
        'id',
        'email',
        'createdAt',
        'updatedAt',
        'lastname',
        'firstname',
        'job',
        'role',
        'prefecture',
      ].map((key) => [key, user[key]]),
    ) as UserOutputDto
  }

  @Post('/list')
  @UsualApiOperation({
    summary: 'Lister les utilisateurs.',
    method: 'POST',
    minimumRole: Roles.admin,
    isPagination: true,
    responseType: null,
  })
  @HttpCode(200)
  @Role(Roles.admin)
  @ApiResponse({ status: 200 })
  async listUsers(
    @Body() dto: PaginationUserDto,
    @CurrentUser() user: IUser,
  ): Promise<PaginatedUserDto> {
    this.logger.verbose('listUsers')
    return this.usersService.listUsers(dto, user)
  }

  @Post('/import')
  @UsualApiOperation({
    summary:
      "Import une liste d'utilisateur. Fichier attendu: form data nommé users, format xlsx.",
    method: 'POST',
    minimumRole: Roles.sudo,
    responseType: Boolean,
  })
  @UseInterceptors(FileInterceptor('users'))
  @HttpCode(201)
  @Role(Roles.sudo)
  async importUsers(
    @UploadedFile() file: Express.Multer.File,
  ): Promise<boolean> {
    this.logger.verbose('importUsers')
    if (!file?.buffer) {
      throw new BadRequestException('File buffer not found.')
    }
    const data = this.xlsxService.returnFirstData(file.buffer)
    this.logger.debug(data)
    return this.userImportService.createUserFromExcelData(
      data as unknown as ExcelUser[],
    )
  }

  @Get('/password-requests')
  @UsualApiOperation({
    summary: 'Retourne une liste de requêtes de changement de mot de passe.',
    method: 'GET',
    minimumRole: Roles.sudo,
    isArray: true,
    responseType: PasswordChangeRequestsDto,
  })
  @HttpCode(200)
  @Role(Roles.sudo)
  @ApiResponse({ status: 200 })
  async listPasswordChangeRequests(): Promise<PasswordChangeRequestsDto[]> {
    this.logger.verbose('listPasswordChangeRequests')
    return this.usersService.listPasswordChangeRequests()
  }

  @Post('/password-requests/:userId/decision')
  @UsualApiOperation({
    summary: 'Approuver ou refuser une demande de changement de mot de passe.',
    method: 'POST',
    minimumRole: Roles.sudo,
    responseType: Boolean,
  })
  @Role(Roles.sudo)
  async managePasswordRequest(
    @Param('userId', ParseIntPipe) userId: number,
    @Body() dto: ManagePasswordRequestDto,
  ): Promise<boolean> {
    this.logger.verbose('managePasswordRequest')
    await this.usersService.managePasswordRequest(userId, dto.action)
    return true
  }
}
