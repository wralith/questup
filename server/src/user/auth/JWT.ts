import { NextFunction, Request, Response } from "express"
import jwt from "jsonwebtoken"

import { ErrAuthentication } from "../Errors"

const jwtSecret = "secret"

export const signJWT = (id: string, username: string) => {
	const claims = {
		username: username,
	}

	return jwt.sign(claims, jwtSecret, {
		expiresIn: "15m",
		subject: id,
	})
}

export const verifyJWT = (token: string) => {
	try {
		const decoded = jwt.verify(token, jwtSecret)
		return decoded
	} catch (e) {
		throw ErrAuthentication()
	}
}

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
	try {
		const user = verifyJWT(req.cookies.token)
		res.locals.user = user
		next()
	} catch (e) {
		res.clearCookie("token")
		throw ErrAuthentication(req.originalUrl)
	}
}
