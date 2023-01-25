import { Prisma } from "@prisma/client"

// https://www.prisma.io/docs/concepts/components/prisma-client/middleware/soft-delete-middleware

export async function softDeleteQuery(
	params: Prisma.MiddlewareParams,
	next: (params: Prisma.MiddlewareParams) => Promise<unknown>
) {
	if (params.model == "Question" || params.model == "Comment") {
		if (params.action === "findUnique" || params.action === "findFirst") {
			// Change to findFirst - you cannot filter
			// by anything except ID / unique with findUnique
			params.action = "findFirst"
			// Add 'deleted' filter
			// ID filter maintained
			params.args.where["deletedAt"] = null
		}
		if (params.action === "findMany") {
			// Find many queries
			if (params.args.where) {
				if (params.args.where.deletedAt == undefined) {
					// Exclude deleted records if they have not been explicitly requested
					params.args.where["deletedAt"] = null
				}
			} else {
				params.args["where"] = { deletedAt: null }
			}
		}
	}
	return next(params)
}

export async function softDeleteUpdate(
	params: Prisma.MiddlewareParams,
	next: (params: Prisma.MiddlewareParams) => Promise<unknown>
) {
	if (params.model == "Question" || params.model == "Comment") {
		if (params.action == "update") {
			// Change to updateMany - you cannot filter
			// by anything except ID / unique with findUnique
			params.action = "updateMany"
			// Add 'deleted' filter
			// ID filter maintained
			params.args.where["deletedAt"] = null
		}
		if (params.action == "updateMany") {
			if (params.args.where != undefined) {
				params.args.where["deletedAt"] = null
			} else {
				params.args["where"] = { deletedAt: null }
			}
		}
	}
	return next(params)
}

export async function softDelete(
	params: Prisma.MiddlewareParams,
	next: (params: Prisma.MiddlewareParams) => Promise<unknown>
) {
	// Check incoming query type
	if (params.model == "Question" || params.model == "Comment") {
		if (params.action == "delete") {
			// Delete queries
			// Change action to an update
			params.action = "update"
			params.args["data"] = { deletedAt: new Date() }
		}
		if (params.action == "deleteMany") {
			// Delete many queries
			params.action = "updateMany"
			if (params.args.data != undefined) {
				params.args.data["deletedAt"] = new Date()
			} else {
				params.args["data"] = { deletedAt: new Date() }
			}
		}
	}
	return next(params)
}
