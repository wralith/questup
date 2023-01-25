import { Request, Response, Router } from "express"

import { ErrAuthorization } from "../core/error/Errors"
import { authenticate } from "../user/auth/JWT"
import { ErrCommentNotFound, ErrParentOrQuestionQueryParamMissing } from "./Errors"
import QuestionRepo from "./QuestionRepo"

export default function commentRoutes(repo: QuestionRepo) {
	const router = Router()

	router.post("/", authenticate, async (req: Request, res: Response) => {
		const value: string = req.body.value
		const userId = Number(res.locals.user.sub)
		if (req.query.question) {
			const questionId = Number(req.query.question)
			const comment = await repo.createComment({ value, questionId, userId })
			return res.status(201).json(comment)
		}
		if (req.query.parent) {
			const parentId = Number(req.query.parent)
			const comment = await repo.createCommentToComment({ value, parentId, userId })
			return res.status(201).json(comment)
		}
		throw ErrParentOrQuestionQueryParamMissing(req.originalUrl)
	})

	router.get("/:id", authenticate, async (req: Request, res: Response) => {
		const id = Number(req.params.id)
		const comment = await repo.findComment(id)
		if (!comment) {
			throw ErrCommentNotFound(`comment with id: ${id} not found`, req.originalUrl)
		}
		return res.json(comment)
	})

	router.delete("/:id", authenticate, async (req: Request, res: Response) => {
		const id = Number(req.params.id)
		const userId = Number(res.locals.user.sub)
		const comment = await repo.findComment(id)
		if (!comment) {
			throw ErrCommentNotFound(`comment with id: ${id} not found`, req.originalUrl)
		}
		if (comment.userId != userId) {
			throw ErrAuthorization(req.originalUrl)
		}
		await repo.deleteComment(id)
		res.json({ message: `comment with id: ${id} deleted successfully` })
	})

	router.get("/", async (req: Request, res: Response) => {
		const limit = Number(req.query.limit)
		const offset = Number(req.query.offset)
		if (req.query.question) {
			const questionId = Number(req.query.question)
			const comments = await repo.paginateCommentsByQuestion({ questionId, limit, offset })
			return res.json(comments)
		}
		if (req.query.parent) {
			const parentId = Number(req.query.parent)
			const comments = await repo.paginateCommentsByParent({ parentId, limit, offset })
			return res.json(comments)
		}
		throw ErrParentOrQuestionQueryParamMissing(req.originalUrl)
	})

	return router
}
