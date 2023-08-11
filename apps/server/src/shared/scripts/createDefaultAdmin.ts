import * as dotenv from 'dotenv'

import { NestFactory } from '@nestjs/core'
import { AppModule } from '../../app.module'
import { UsersService } from '../../modules/users/users.service'
import { RolesService } from '../../modules/roles/providers/roles.service'
import { LoggerService } from '../modules/logger/logger.service'
import * as path from 'path'

dotenv.config({
  path: path.resolve(__dirname, '..', '..', '..', '.env'),
})

async function bootstrap (): Promise<void> {
  const app = await NestFactory.create(AppModule)
  app.useLogger(await app.resolve(LoggerService))
  const usersService = app.get(UsersService)
  const rolesService = app.get(RolesService)
  const email = process.env.DEFAULT_ADMIN_EMAIL
  const password = process.env.DEFAULT_ADMIN_PASSWORD

  if (!email || !password) {
    throw new Error('Unable to create default admin. User or password is undefined')
  }

  try {
    const [user, role] = await Promise.all([
      usersService.findOrCreate(email, password),
      rolesService.create({
        name: 'admin',
        description: 'App administrator, has full rights',
      }),
    ])
    if (user?.id && role?.id) {
      await rolesService.assignRoleToUser(role.id, user.id)
    } else {
      throw new Error('Unable to create default admin')
    }
    await app.close()
  } catch (error) {
    console.error(error)
  }
  process.exit(0)
}

bootstrap()
