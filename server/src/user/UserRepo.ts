import { Prisma, PrismaClient } from "@prisma/client"

export default class UserRepo {
	#db: PrismaClient

	constructor(db: PrismaClient) {
		this.#db = db
	}

	async findById(id: number) {
		return await this.#db.user.findFirst({
			where: { id },
		})
	}

	async findByUsername(username: string) {
		return await this.#db.user.findFirst({
			where: {
				username: username,
			},
		})
	}

	async create(user: Prisma.UserCreateInput) {
		return await this.#db.user.create({ data: user })
	}

	async update(id: number, user: Prisma.UserUpdateInput) {
		return await this.#db.user.update({
			where: { id },
			data: user,
		})
	}
}
