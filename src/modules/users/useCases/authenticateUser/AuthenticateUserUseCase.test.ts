
import dotenv from 'dotenv'
dotenv.config()
import faker from "faker"

import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository"
import { CreateUserUseCase } from "../createUser/CreateUserUseCase"
import { AuthenticateUserUseCase } from "./AuthenticateUserUseCase"
import { IncorrectEmailOrPasswordError } from './IncorrectEmailOrPasswordError'


const inMemoryUsersRepository = new InMemoryUsersRepository()
const authenticateUserUseCase = new AuthenticateUserUseCase(inMemoryUsersRepository)
const createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository)


describe('authenticate user use case', () => {
  it('should authenticate a user for the correct email and password', async () => {
    const email = faker.internet.email()
    const password = faker.internet.password()

    const user = {
      email,
      name: `${faker.name.firstName()} ${faker.name.lastName()}`,
      password
    }

    await createUserUseCase.execute(user)

    const credentials = await authenticateUserUseCase.execute({
      email,
      password
    })

    expect(credentials).toEqual(credentials)
  })

  it('should throw trying authenticate with invalids email, password or both', async () => {
    const email = faker.internet.email()
    const password = faker.internet.password()

    let incorrectEmail = faker.internet.email()
    while (incorrectEmail === email) {
      incorrectEmail = faker.internet.email()
    }

    let incorrectPassword = faker.internet.password()
    while (incorrectPassword === password) {
      incorrectPassword = faker.internet.password()
    }

    const user = {
      email,
      name: `${faker.name.firstName()} ${faker.name.lastName()}`,
      password
    }

    await createUserUseCase.execute(user)

    expect(async () => {
      await authenticateUserUseCase.execute({
        email: incorrectEmail,
        password
      })
    }).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError)

    expect(async () => {
      await authenticateUserUseCase.execute({
        email,
        password: incorrectPassword
      })
    }).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError)

    expect(async () => {
      await authenticateUserUseCase.execute({
        email: incorrectEmail,
        password: incorrectPassword
      })
    }).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError)
  })
})
