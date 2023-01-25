import { HTTPError } from "../core/error/Errors"

export const ErrUserNotFound = (message: string, instance: string) =>
	new HTTPError({ code: 404, title: "user not found", message, instance })

export const ErrInvalidCredentials = (instance: string) =>
	new HTTPError({
		code: 400,
		title: "invalid credentials",
		message: "username and password does not match",
		instance,
	})

export const ErrAuthentication = (instance?: string) =>
	new HTTPError({
		code: 401,
		title: "authentication error",
		message: "unable to verify jwt token",
		instance: instance ?? "/",
	})
