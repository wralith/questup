import { ZodError } from "zod"

export type HTTPErrorOptions = {
	code: number
	message: string
	title?: string
	details?: string[]
	instance?: string
}

export class HTTPError extends Error {
	code: number
	title?: string
	instance?: string
	details?: string[]

	constructor(opts: HTTPErrorOptions) {
		super(opts.message)
		this.code = opts.code
		this.title = opts.title
		this.instance = opts.instance
		this.details = opts.details
	}
}

export class ValidationError extends HTTPError {
	constructor(zodError: ZodError, opts: HTTPErrorOptions) {
		opts.details = zodError.issues.map((issue) => issue.message)
		super(opts)
	}
}

export const ErrAuthentication = (instance?: string) =>
	new HTTPError({
		code: 401,
		title: "authentication error",
		message: "unable to verify jwt token",
		instance: instance ?? "/",
	})

export const ErrAuthorization = (instance: string) =>
	new HTTPError({
		code: 403,
		title: "authorization error",
		message: "not allowed to do that",
		instance: instance,
	})
