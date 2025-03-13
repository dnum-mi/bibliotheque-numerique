import { INestApplication } from '@nestjs/common'
import * as request from 'supertest'

export const getAnyToken = (app: INestApplication, email?: string): Promise<string> => {
  return request(app.getHttpServer())
    .post('/auth/sign-in')
    .send({
      email: email || 'test.no.role@localhost.com',
      password: 'password',
    })
    .then((res) => res.body.accessToken)
}
