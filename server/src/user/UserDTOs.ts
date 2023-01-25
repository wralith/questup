import { Role, User } from "@prisma/client"
import { z } from "zod"

import { MinCharactersErr } from "../core/error/ErrorMessages"

export const registerSchema = z.object({
	username: z.string().min(3, MinCharactersErr(3, "username")).regex(/^\w+$/),
	email: z.string().email(),
	password: z.string().min(6, MinCharactersErr(6, "password")),
})

export type RegisterDTO = z.infer<typeof registerSchema>

export const loginSchema = z.object({
	username: z.string().min(3, MinCharactersErr(3, "username")),
	password: z.string().min(6, MinCharactersErr(6, "password")),
})

export type LoginDTO = z.infer<typeof loginSchema>

export type UserDTO = {
	id: number
	username: string
	email: string
	createdAt: Date
	role: Role
}

export const MapToUserDTO = (user: User): UserDTO => ({
	id: user.id,
	username: user.username,
	email: user.email,
	createdAt: user.createdAt,
	role: user.role,
})
