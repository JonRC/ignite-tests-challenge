import dotenv from 'dotenv'
dotenv.config()

import faker from 'faker'
import { Connection, getConnection } from 'typeorm'
import request from 'supertest'

import { Database } from '../../../../database'
import { app } from '../../../../app'

const database = new Database()
let token: string

describe('get statement operation integration test', () => {
  let connection: Connection
  let depositId: string

  beforeAll(async () => {
    connection = await database.init()
    await connection.runMigrations()

    const email = faker.internet.email()
    const password = faker.internet.password()



    await request(app)
      .post('/api/v1/users')
      .send({
        name: `${faker.name.findName()} ${faker.name.lastName()}`,
        email,
        password
      })

    const authenticateResponse = await request(app)
      .post('/api/v1/sessions')
      .send({
        email,
        password
      })

    token = authenticateResponse?.body?.token
  })

  afterAll(async () => {
    await connection.dropDatabase()
    await connection.close()
  })

  test('get statement operation infos', async () => {
    const amount = faker.datatype.number({
      min: 1,
      max: 100
    })

    const description = faker.lorem.sentence()

    const depositResponse = await request(app)
      .post('/api/v1/statements/deposit')
      .set('Authorization', `Bearer ${token}`)
      .send({
        amount,
        description
      })

    depositId = depositResponse.body?.id

    const { status, body } = await request(app)
      .get(`/api/v1/statements/${depositId}`)
      .set('Authorization', `Bearer ${token}`)
      .send()

    expect(status).toBe(200)
    expect(body).toMatchObject({
      description,
      amount: amount.toFixed(2),
      type: 'deposit'
    })
  })
})
