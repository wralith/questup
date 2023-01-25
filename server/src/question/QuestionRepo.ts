import { PrismaClient } from "@prisma/client"

export type CreateQuestionOpts = {
	value: string
	userId: number
	sessionId: number
}
export type CreateCommentOpts = {
	value: string
	userId: number
	questionId: number
}
export type CreateCommentToCommentOpts = {
	value: string
	userId: number
	parentId: number
}
export type PaginateQuestionsOpts = {
	sessionId: number
	limit: number
	offset: number
}
export type PaginateCommentsByQuestionOpts = {
	questionId: number
	limit: number
	offset: number
}
export type PaginateCommentsByParentOpts = {
	parentId: number
	limit: number
	offset: number
}

export default class QuestionRepo {
	#db: PrismaClient

	constructor(db: PrismaClient) {
		this.#db = db
	}

	async findQuestion(id: number) {
		return this.#db.question.findUnique({
			where: {
				id: id,
			},
		})
	}

	async createQuestion({ value, userId, sessionId }: CreateQuestionOpts) {
		return this.#db.question.create({
			data: {
				value,
				user: { connect: { id: userId } },
				session: { connect: { id: sessionId } },
			},
		})
	}

	async deleteQuestion(id: number) {
		return this.#db.question.delete({
			where: { id },
		})
	}

	async paginateQuestions({ sessionId, limit, offset }: PaginateQuestionsOpts) {
		return this.#db.question.findMany({
			where: { sessionId },
			skip: offset * limit,
			take: limit,
			orderBy: { createdAt: "asc" },
		})
	}

	async findComment(id: number) {
		return this.#db.comment.findUnique({
			where: {
				id: id,
			},
		})
	}

	async createComment({ value, userId, questionId }: CreateCommentOpts) {
		return this.#db.comment.create({
			data: {
				value,
				user: { connect: { id: userId } },
				question: { connect: { id: questionId } },
			},
		})
	}

	async createCommentToComment({ value, userId, parentId }: CreateCommentToCommentOpts) {
		const parent = await this.#db.comment.findUnique({ where: { id: parentId } })
		return this.#db.comment.create({
			data: {
				value,
				user: { connect: { id: userId } },
				commentTo: { connect: { id: parentId } },
				question: { connect: { id: parent?.questionId } },
			},
		})
	}

	async deleteComment(id: number) {
		return this.#db.comment.delete({
			where: { id },
		})
	}

	async paginateCommentsByQuestion({ questionId, limit, offset }: PaginateCommentsByQuestionOpts) {
		return this.#db.comment.findMany({
			where: { questionId, commentTo: null },
			skip: offset * limit,
			take: limit,
			orderBy: { createdAt: "asc" },
		})
	}

	async paginateCommentsByParent({ parentId, limit, offset }: PaginateCommentsByParentOpts) {
		return this.#db.comment.findMany({
			where: { parentCommentId: parentId },
			skip: offset * limit,
			take: limit,
			orderBy: { createdAt: "asc" },
		})
	}
}
