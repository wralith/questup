import { Request, Response, Router } from "express"

import { TryZod } from "../core/error/TryValidate"
import Hash from "./auth/Hash"
import { authenticate, signJWT } from "./auth/JWT"
import { ErrInvalidCredentials, ErrUserNotFound } from "./Errors"
import { LoginDTO, loginSchema, MapToUserDTO, RegisterDTO, registerSchema } from "./UserDTOs"
import UserRepo from "./UserRepo"

export default function userRoutes(repo: UserRepo) {
	const router = Router()

	router.get("/me", authenticate, (req: Request, res: Response) => {
		const me = res.locals.user
		return res.json(me)
	})

	router.get("/:id", async (req: Request, res: Response) => {
		const id = Number(req.params.id)
		const user = await repo.findById(id)
		if (!user) {
			throw ErrUserNotFound(`user with id: ${id} not found`, req.originalUrl)
		}
		return res.json(MapToUserDTO(user))
	})

	router.post("/register", async (req: Request, res: Response) => {
		const body: RegisterDTO = req.body
		TryZod(registerSchema, body, { message: "invalid input" })

		const hashedPassword = await Hash.create(body.password)
		const user = await repo.create({
			username: body.username,
			email: body.email,
			hashedPassword,
		})
		return res.status(201).json(MapToUserDTO(user))
	})

	router.post("/login", async (req: Request, res: Response) => {
		const body: LoginDTO = req.body
		TryZod(loginSchema, body, { message: "invalid credentials" })

		const user = await repo.findByUsername(body.username)
		if (!user) {
			throw ErrInvalidCredentials(req.originalUrl)
		}
		const isMatch = await Hash.compare(body.password, user.hashedPassword)
		if (!isMatch) {
			throw ErrInvalidCredentials(req.originalUrl)
		}

		const jwt = signJWT(String(user.id), user.username)
		res.cookie("token", jwt, { httpOnly: true, maxAge: 15 * 60 * 1000 })

		return res.json(MapToUserDTO(user))
	})

	return router
}
