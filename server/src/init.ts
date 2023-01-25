import { PrismaClient } from "@prisma/client"
import cookieParser from "cookie-parser"
import express from "express"
import type { Server } from "http"

import { errorHandler } from "./core/middleware/ErrorHandler"
import { softDelete, softDeleteQuery, softDeleteUpdate } from "./core/middleware/Prisma"
import commentRoutes from "./question/CommentRoutes"
import QuestionRepo from "./question/QuestionRepo"
import questionRoutes from "./question/QuestionRoutes"
import SessionRepo from "./session/SessionRepo"
import sessionRoutes from "./session/SessionRoutes"
import UserRepo from "./user/UserRepo"
import userRoutes from "./user/UserRoutes"

export function initExpress() {
	const app = express()
	app.use(express.json())
	app.use(cookieParser())

	return app
}

export function initPrisma() {
	const prisma = new PrismaClient()
	prisma.$use(softDelete)
	prisma.$use(softDeleteQuery)
	prisma.$use(softDeleteUpdate)

	return prisma
}

export function initRoutes(app: express.Application, prisma: PrismaClient) {
	const user = userRoutes(new UserRepo(prisma))
	const session = sessionRoutes(new SessionRepo(prisma))

	const questionRepo = new QuestionRepo(prisma)
	const question = questionRoutes(questionRepo)
	const comment = commentRoutes(questionRepo)

	app.use("/users", user)
	app.use("/sessions", session)
	app.use("/questions", question)
	app.use("/comments", comment)

	app.use(errorHandler)
}

export async function stopServer(server: Server, prisma: PrismaClient) {
	server.close()
	await prisma.$disconnect()
}
