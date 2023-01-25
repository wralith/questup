import { initExpress, initPrisma, initRoutes, stopServer } from "./init"

function start() {
	const app = initExpress()
	const prisma = initPrisma()
	initRoutes(app, prisma)

	const port = process.env.PORT ?? 8080
	const server = app.listen(port, () => {
		console.log(`Server started at port: ${port}`)
	})

	process.on("SIGTERM", async () => {
		stopServer(server, prisma)
		process.exit()
	})
	process.on("SIGINT", async () => {
		stopServer(server, prisma)
		process.exit()
	})
}

start()
