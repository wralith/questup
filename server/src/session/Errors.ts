import { HTTPError } from "../core/error/Errors"

export const ErrSessionNotFound = (message: string, instance: string) =>
	new HTTPError({ code: 404, title: "session not found", message, instance })
