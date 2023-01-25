import { PrismaClient } from "@prisma/client"
import axios, { Axios } from "axios"
import { Server } from "http"

import { initExpress, initPrisma, initRoutes, stopServer } from "../../src/init"
import { LoginDTO, RegisterDTO } from "../../src/user/UserDTOs"

let axiosClient: Axios
let prisma: PrismaClient
let server: Server

beforeAll(() => {
	const app = initExpress()
	prisma = initPrisma()
	initRoutes(app, prisma)

	const port = 8081
	server = app.listen(port)

	axiosClient = axios.create({
		baseURL: `http://127.0.0.1:${port}`,
		validateStatus: () => true,
		withCredentials: true,
	})
})

afterAll(async () => {
	await stopServer(server, prisma)
})

describe("Happy path for a user", () => {
	let userId: number
	let sessionId: number
	let questionId: number
	let parentCommentId: number

	afterAll(async () => {
		await prisma.$executeRawUnsafe(`TRUNCATE TABLE "User" RESTART IDENTITY CASCADE;`)
	})

	test("POST /users/register should create user", async () => {
		const input: RegisterDTO = {
			email: "test@test.com",
			username: "tester",
			password: "letmein",
		}
		const res = await axiosClient.post("/users/register", input)
		expect(res.status).toBe(201)
		expect(res.data.email).toBe(input.email)
		userId = res.data.id
	})

	test("POST /users/login should response with user details and jwt cookie", async () => {
		const input: LoginDTO = {
			username: "tester",
			password: "letmein",
		}
		const res = await axiosClient.post("/users/login", input)
		expect(res.status).toBe(200)

		let cookie: string | undefined | null
		if (res.headers["set-cookie"]) {
			cookie = res.headers["set-cookie"][0]
			axiosClient.defaults.headers.common["Cookie"] = cookie
		}
		expect(cookie).toBeTruthy()
	})

	test("GET /users/:id should response with user details", async () => {
		const res = await axiosClient.get(`/users/${userId}`)
		expect(res.status).toBe(200)
		expect(res.data.email).toBe("test@test.com")
	})

	test("POST /sessions should create session", async () => {
		const input = { title: "Test Session" }
		const res = await axiosClient.post("/sessions", input)
		expect(res.status).toBe(201)
		expect(res.data.title).toBe("Test Session")
		sessionId = res.data.id
	})

	test("GET /sessions/:id should response with session", async () => {
		const res = await axiosClient.get(`/sessions/${sessionId}`)
		expect(res.status).toBe(200)
		expect(res.data.title).toBe("Test Session")
	})

	test("GET /sessions should response with list of sessions", async () => {
		const res = await axiosClient.get(`/sessions?limit=5&offset=0`)
		expect(res.status).toBe(200)
		expect(res.data).toHaveLength(1)
		expect(res.data[0].title).toBe("Test Session")
	})

	test("POST /questions should create question", async () => {
		const input = { value: "Test Question?" }
		const res = await axiosClient.post(`/questions?session=${sessionId}`, input)
		expect(res.status).toBe(201)
		expect(res.data.value).toBe("Test Question?")
		expect(res.data.userId).toBe(userId)
		questionId = res.data.id
	})

	test("GET /questions/:id should response with question details", async () => {
		const res = await axiosClient.get(`/questions/${questionId}`)
		expect(res.status).toBe(200)
	})

	test("GET /questions with session query param should response with list of questions", async () => {
		let res = await axiosClient.get(`/questions?session=${sessionId}&limit=3&offset=0`)
		expect(res.data).toHaveLength(1)
		expect(res.data[0].id).toBe(questionId)
		res = await axiosClient.get(`/questions?session=${sessionId}&limit=3&offset=2`)
		expect(res.data).toHaveLength(0)
	})

	test("POST /comments should create comment to question", async () => {
		let input = { value: "Parent Comment" }
		let res = await axiosClient.post(`/comments?question=${questionId}`, input)
		expect(res.status).toBe(201)
		expect(res.data.questionId).toBe(questionId)
		parentCommentId = res.data.id

		input = { value: "Second Comment" }
		res = await axiosClient.post(`/comments?question=${questionId}`, input)
		expect(res.status).toBe(201)
		input = { value: "Third Comment" }
		res = await axiosClient.post(`/comments?question=${questionId}`, input)
		expect(res.status).toBe(201)
	})

	test("POST /comments should create comment to comment", async () => {
		let input = { value: "Nested Comment" }
		let res = await axiosClient.post(`/comments?parent=${parentCommentId}`, input)
		expect(res.status).toBe(201)

		input = { value: "Nested Comment 2" }
		res = await axiosClient.post(`/comments?parent=${parentCommentId}`, input)
		expect(res.status).toBe(201)
	})

	test("GET /comments with question or parent query param should response with list of questions", async () => {
		let res = await axiosClient.get(`/comments?question=${questionId}&limit=5&offset=0`)
		expect(res.data).toHaveLength(3)
		expect(res.data[0].id).toBe(questionId)
		res = await axiosClient.get(`/comments?parent=${parentCommentId}&limit=5&offset=0`)
		expect(res.data).toHaveLength(2)
	})
})
