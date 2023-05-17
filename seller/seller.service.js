import { PrismaService } from "../prisma.service.js";
import * as bcrypt from "bcrypt";
import { SellerException } from "./seller.exception.js";
import jwt from "jsonwebtoken";

export class SellerService {
	constructor() {
		this.prismaService = new PrismaService();
		this.sellerException = new SellerException();
	}

	async getAll() {
		return await this.prismaService.seller.findMany({
			include: {
				item: true,
			},
		});
	}

	async register(data) {
		const response = await this.prismaService.seller.findFirst({
			where: {
				username: data.username,
			},
		});
		if (response) {
			return {
				code: 409,
				response: {
					message: this.sellerException.UsernameExist(),
				},
			};
		}
		data.password = bcrypt.hashSync(data.password, 10);
		const result = await this.prismaService.seller.create({
			data,
		});
		result.password = undefined;
		return {
			code: 201,
			response: {
				result,
			},
		};
	}

	async login(data) {
		const user = await this.prismaService.seller.findFirst({
			where: {
				username: data.username,
			},
		});
		if (!user) {
			return {
				code: 401,
				response: {
					message: this.sellerException.UserNotFound(),
				},
			};
		}

		const result = bcrypt.compareSync(data.password, user.password);
		if (!result) {
			return {
				code: 401,
				response: {
					message: this.sellerException.InvalidUsernameOrPassword(),
				},
			};
		}

		const payload = { username: user.username, id: user.id };
		const token = jwt.sign(payload, process.env["JWT_PRIVATE"], {
			expiresIn: "24h",
		});
		return {
			code: 200,
			response: {
				access_token: token,
			},
		};
	}

	checkTokenValid(token) {
		return jwt.verify(token, process.env["JWT_PRIVATE"]);
	}
}
