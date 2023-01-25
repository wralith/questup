import { Request, Response, Router } from "express"

import { ErrAuthorization } from "../core/error/Errors"
import { authenticate } from "../user/auth/JWT"
import { ErrQuestionNotFound } from "./Errors"
import QuestionRepo from "./QuestionRepo"

export default function questionRoutes(repo: QuestionRepo) {
	const router = Router()

	router.post("/", authenticate, async (req: Request, res: Response) => {
		const value: string = req.body.value
		const sessionId = Number(req.query.session)
		const userId = Number(res.locals.user.sub)
		const question = await repo.createQuestion({ value, sessionId, userId })

		return res.status(201).json(question)
	})

	router.get("/:id", authenticate, async (req: Request, res: Response) => {
		const id = Number(req.params.id)
		const question = await repo.findQuestion(id)
		if (!question) {
			throw ErrQuestionNotFound(`question with id: ${id} not found`, req.originalUrl)
		}
		return res.json(question)
	})

	router.delete("/:id", authenticate, async (req: Request, res: Response) => {
		const id = Number(req.params.id)
		const userId = Number(res.locals.user.sub)
		const question = await repo.findQuestion(id)
		if (!question) {
			throw ErrQuestionNotFound(`question with id: ${id} not found`, req.originalUrl)
		}
		if (question.userId != userId) {
			throw ErrAuthorization(req.originalUrl)
		}
		await repo.deleteQuestion(id)
		return res.json({ message: `question with id: ${id} deleted successfully` })
	})

	router.get("/", async (req: Request, res: Response) => {
		const sessionId = Number(req.query.session)
		const limit = Number(req.query.limit)
		const offset = Number(req.query.offset)
		const questions = await repo.paginateQuestions({ sessionId, limit, offset })
		return res.json(questions)
	})

	return router
}
