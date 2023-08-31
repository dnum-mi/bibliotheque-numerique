import { INestApplication } from '@nestjs/common'
import * as request from 'supertest'

export const getUserCookie = (app: INestApplication, email?: string): Promise<string> => {
  return request(app.getHttpServer())
    .post('/auth/sign-in')
    .send({
      email: email || 'test.no.role@localhost.com',
      password: 'password',
    })
    .then((res) => {
      console.log(res.header)
      return res.header['set-cookie'][0].split(';')[0]
    })
}
