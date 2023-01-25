import bcrypt from "bcrypt"
const rounds = 5

const create = async (password: string) => await bcrypt.hash(password, rounds)
const compare = async (password: string, hash: string) => await bcrypt.compare(password, hash)

export default {
	create,
	compare,
}
