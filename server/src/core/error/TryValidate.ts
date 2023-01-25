import { ZodError, ZodObject, ZodRawShape } from "zod"

import { HTTPError, HTTPErrorOptions, ValidationError } from "./Errors"

export function TryZod<T>(
	zodSchema: ZodObject<ZodRawShape>,
	data: T,
	opts: Partial<HTTPErrorOptions> & Pick<HTTPErrorOptions, "message">
) {
	try {
		zodSchema.parse(data)
	} catch (err) {
		if (err instanceof ZodError) {
			throw new ValidationError(err, {
				code: opts.code ?? 400,
				title: opts.title ?? "Invalid Request",
				details: opts.details,
				message: opts.message,
				instance: opts.instance,
			})
		} else {
			throw new HTTPError({
				code: 500,
				title: "Unknown Error",
				message: "Unknown error",
				details: opts.details,
				instance: opts.instance,
			})
		}
	}
}
