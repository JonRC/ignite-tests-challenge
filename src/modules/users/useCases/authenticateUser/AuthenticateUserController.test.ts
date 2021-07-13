import dotenv from 'dotenv'
dotenv.config()

import faker from 'faker'
import request from 'supertest'

import { Connection, getConnection } from "typeorm"
import { app } from '../../../../app'
import { Database } from "../../../../database"

let connection: Connection
const database = new Database()

describe('autheticate user integration test', () => {
  beforeAll(async () => {
    connection = await database.init()
    await connection.runMigrations()
  })

  afterAll(async () => {
    await connection.dropDatabase()
    await connection.close()
  })

  test('authenticate a user', async () => {
    const name = `${faker.name.findName()} ${faker.name.lastName()}`
    const email = faker.internet.email()
    const password = faker.internet.password()

    await request(app)
      .post('/api/v1/users')
      .send({
        name,
        email,
        password
      })

    const { status, body } = await request(app)
      .post('/api/v1/sessions')
      .send({
        email,
        password
      })

    expect(status).toBe(200)

    expect(body).toHaveProperty('user')
    expect(body).toHaveProperty('token')
  })

  test('incorrect credentials', async () => {
    const email = faker.internet.email()
    const password = faker.internet.password()

    const { status, body } = await request(app)
      .post('/api/v1/sessions')
      .send({
        email,
        password
      })

    expect(status).toBe(401)
  })
})
