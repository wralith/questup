import { NextFunction, Request, Response } from "express"

import { HTTPError } from "../error/Errors"

export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
	if (err) {
		if (err instanceof HTTPError) {
			return res.status(err.code).json({ ...err, message: err.message })
		} else {
			console.log(err)
			return res.status(500).json("unknown error")
		}
	}
	next()
}

// Same, cooler looking!
// export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) =>
// 	err
// 		? err instanceof HTTPError
// 			? res.status(err.code).json({ ...err, message: err.message })
// 			: res.status(500).json("unknown error")
// 		: next()
