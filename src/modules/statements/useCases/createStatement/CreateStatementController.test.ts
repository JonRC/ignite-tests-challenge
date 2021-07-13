import dotenv from 'dotenv'
dotenv.config()

import faker from 'faker'
import { Connection, getConnection } from 'typeorm'
import request from 'supertest'

import { Database } from '../../../../database'
import { app } from '../../../../app'

const database = new Database()
let token: string

describe('create statement integration test', () => {
  let connection: Connection
  const depositAmount = faker.datatype.number({
    min: 1,
    max: 100
  })

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

  test('Deposit statement', async () => {
    const description = faker.lorem.sentence()

    const { status, body } = await request(app)
      .post('/api/v1/statements/deposit')
      .set('Authorization', `Bearer ${token}`)
      .send({
        amount: depositAmount,
        description
      })

    expect(status).toBe(201)
    expect(body).toMatchObject({
      amount: depositAmount,
      description,
      type: 'deposit'
    })
    expect(body).toHaveProperty('id')
  })

  test('Withdraw statement', async () => {
    const withdrawAmount = faker.datatype.number({
      min: 0,
      max: depositAmount,
    })

    const description = faker.lorem.sentence()

    const { status, body } = await request(app)
      .post('/api/v1/statements/withdraw')
      .set('Authorization', `Bearer ${token}`)
      .send({
        amount: withdrawAmount,
        description
      })

    expect(status).toBe(201)
    expect(body).toMatchObject({
      amount: withdrawAmount,
      description,
      type: 'withdraw'
    })
    expect(body).toHaveProperty('id')
  })
})
