import { PrismaClient } from "@prisma/client";

export class PrismaService extends PrismaClient {
	constructor() {
		super();
		this.connect();
	}
	async connect() {
		await this.$connect();
	}
}
