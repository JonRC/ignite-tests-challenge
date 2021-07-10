import faker from "faker"
import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository"
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase"
import { OperationType } from "../../entities/Statement"
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository"
import { CreateStatementError } from "./CreateStatementError"
import { CreateStatementUseCase } from "./CreateStatementUseCase"


const statementsRepository = new InMemoryStatementsRepository()
const usersRepository = new InMemoryUsersRepository()

const createStatementUseCase = new CreateStatementUseCase(usersRepository, statementsRepository)
const createUserUseCase = new CreateUserUseCase(usersRepository)

describe("create statement use case test", () => {
  it("should create a statement", async () => {
    const user = await createUserUseCase.execute({
      email: faker.internet.email(),
      name: `${faker.name.firstName()} ${faker.name.lastName()}`,
      password: faker.internet.password()
    })

    const userId = user?.id

    const depositAmount = faker.datatype.number({
      min: 1
    })
    const withdrawAmount = faker.datatype.number({
      max: depositAmount
    })

    const depositStatementData = {
      amount: depositAmount,
      description: faker.lorem.paragraph(),
      type: "deposit" as OperationType,
      user_id: userId as string
    }

    const withdrawStatementData = {
      amount: withdrawAmount,
      description: faker.lorem.paragraph(),
      type: "withdraw" as OperationType,
      user_id: userId as string
    }

    const depositStatement = await createStatementUseCase.execute(depositStatementData)
    const withdrawStatement = await createStatementUseCase.execute(withdrawStatementData)

    expect(depositStatement).toHaveProperty('id')
    expect(withdrawStatement).toHaveProperty('id')

    expect(depositStatement).toMatchObject(depositStatementData)
    expect(withdrawStatement).toMatchObject(withdrawStatementData)
  })

  it('should not create a statement for a not existing user', () => {
    expect(async () => {
      await createStatementUseCase.execute({
        amount: faker.datatype.number(),
        description: faker.lorem.paragraph(),
        type: "deposit" as OperationType,
        user_id: faker.datatype.uuid()
      })
    }).rejects.toBeInstanceOf(CreateStatementError.UserNotFound)
  })

  it('should not be able to withdraw insufficient funds', async () => {

    const user = await createUserUseCase.execute({
      email: faker.internet.email(),
      name: `${faker.name.firstName()} ${faker.name.lastName()}`,
      password: faker.internet.password()
    })

    const userId = user?.id

    const depositAmount = faker.datatype.number({
      min: 1
    })
    const withdrawAmount = faker.datatype.number({
      min: depositAmount + 1
    })

    const depositStatementData = {
      amount: depositAmount,
      description: faker.lorem.paragraph(),
      type: "deposit" as OperationType,
      user_id: userId as string
    }

    const withdrawStatementData = {
      amount: withdrawAmount,
      description: faker.lorem.paragraph(),
      type: "withdraw" as OperationType,
      user_id: userId as string
    }

    await createStatementUseCase.execute(depositStatementData)

    expect(async () => {
      await createStatementUseCase.execute(withdrawStatementData)
    }).rejects.toBeInstanceOf(CreateStatementError.InsufficientFunds)
  })
})
