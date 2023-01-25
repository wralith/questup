import { Prisma, PrismaClient } from "@prisma/client"

export default class SessionRepo {
	#db: PrismaClient

	constructor(db: PrismaClient) {
		this.#db = db
	}

	async find(id: number) {
		return this.#db.session.findUnique({
			where: {
				id: id,
			},
		})
	}

	async create(session: Prisma.SessionCreateInput) {
		return this.#db.session.create({ data: session })
	}

	async update(id: number, session: Prisma.SessionUpdateInput) {
		return this.#db.session.update({
			where: { id },
			data: session,
		})
	}

	async paginate({ limit, offset }: { limit: number; offset: number }) {
		return this.#db.session.findMany({
			skip: offset * limit,
			take: limit,
			orderBy: { createdAt: "asc" },
		})
	}
}
