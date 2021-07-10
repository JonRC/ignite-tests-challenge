import faker from "faker"
import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository"
import { UsersRepository } from "../../../users/repositories/UsersRepository"
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase"
import { OperationType, Statement } from "../../entities/Statement"
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository"
import { CreateStatementUseCase } from "../createStatement/CreateStatementUseCase"
import { GetBalanceError } from "./GetBalanceError"
import { GetBalanceUseCase } from "./GetBalanceUseCase"


const inMemoryUsersRepository = new InMemoryUsersRepository()
const inMemoryStatementsRepository = new InMemoryStatementsRepository()

const createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository)
const createStatementUseCase = new CreateStatementUseCase(inMemoryUsersRepository, inMemoryStatementsRepository)
const getBalanceUseCase = new GetBalanceUseCase(inMemoryStatementsRepository, inMemoryUsersRepository)

describe('Balance use case', () => {
  let userId: string | undefined
  const expectedStatements: Statement[] = []
  let expectedBalance = 0

  beforeAll(async () => {
    const user = await createUserUseCase.execute({
      email: faker.internet.email(),
      name: `${faker.name.firstName()} ${faker.name.lastName()}`,
      password: faker.internet.password()
    })

    userId = user?.id

    const amount = faker.datatype.number({
      min: 0
    })

    const depositStatement = await createStatementUseCase.execute({
      amount,
      description: faker.lorem.paragraph(),
      type: "deposit" as OperationType,
      user_id: userId as string
    })

    expectedStatements.push(depositStatement)
    expectedBalance += amount
  })

  it('should return the balance information', async () => {
    const { balance, statement: statements } = await getBalanceUseCase.execute({
      user_id: userId as string
    })

    expect(balance).toBe(expectedBalance)
    expect(statements).toEqual(expectedStatements)
  })

  it('should not get balance for a not existing user', () => {
    expect(async () => {
      await getBalanceUseCase.execute({
        user_id: faker.datatype.uuid()
      })
    }).rejects.toBeInstanceOf(GetBalanceError)
  })
})
