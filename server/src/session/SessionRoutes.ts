import { Request, Response, Router } from "express"

import { ErrAuthorization } from "../core/error/Errors"
import { authenticate } from "../user/auth/JWT"
import { ErrSessionNotFound } from "./Errors"
import SessionRepo from "./SessionRepo"

export default function sessionRoutes(repo: SessionRepo) {
	const router = Router()

	router.get("/:id", async (req: Request, res: Response) => {
		const id = Number(req.params.id)
		const session = await repo.find(id)
		if (!session) {
			throw ErrSessionNotFound(`session with id: ${id} not found`, req.originalUrl)
		}
		return res.json(session)
	})

	router.post("/", authenticate, async (req: Request, res: Response) => {
		const { title } = req.body
		const userId = Number(res.locals.user.sub)
		const session = await repo.create({ title, owner: { connect: { id: userId } } })
		return res.status(201).json(session)
	})

	router.delete("/:id/end", authenticate, async (req: Request, res: Response) => {
		const id = Number(req.params.id)
		const userId = Number(res.locals.user.sub)
		const session = await repo.find(id)
		if (!session) {
			throw ErrSessionNotFound(`session with id: ${id} not found`, req.originalUrl)
		}
		if (session.ownerId !== userId) {
			throw ErrAuthorization(req.originalUrl)
		}
	})

	router.get("/", async (req: Request, res: Response) => {
		const limit = Number(req.query.limit)
		const offset = Number(req.query.offset)
		const sessions = await repo.paginate({ limit, offset })
		return res.json(sessions)
	})

	return router
}
