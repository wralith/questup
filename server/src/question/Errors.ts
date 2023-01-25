import { HTTPError } from "../core/error/Errors"

export const ErrQuestionNotFound = (message: string, instance: string) =>
	new HTTPError({ code: 404, title: "question not found", message, instance })

export const ErrCommentNotFound = (message: string, instance: string) =>
	new HTTPError({ code: 404, title: "comment not found", message, instance })

export const ErrParentOrQuestionQueryParamMissing = (instance: string) =>
	new HTTPError({
		code: 400,
		message: "at least one provide one 'parent', 'question' query parameter",
		details: [
			"'parent' query parameter expected to fetch comments by its parent comment",
			"'question' query parameter expected to fetch comment by question it belongs",
		],
		title: "bad request",
		instance,
	})
