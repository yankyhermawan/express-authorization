/**
 * @swagger
 * tags:
 *   name: Seller
 *   description: The sellers managing API
 * /seller:
 *   get:
 *     summary: Get all Seller
 *     tags: [Seller]
 *     responses:
 *       200:
 *         description: Get all Seller.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Seller'
 *       500:
 *         description: Some server error
 * /seller/register:
 *   post:
 *     summary: Post an new Seller
 *     tags: [Seller]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Seller'
 *     response:
 *       200:
 *         description: Seller Posted
 *         content:
 *           application/json:
 *             schema:
 *               $ref:  '#/components/schemas/Seller'
 *       500:
 *         description: Server Error
 * /seller/login:
 *   post:
 *     summary: Post an new Seller
 *     tags: [Seller]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Seller'
 *     response:
 *       200:
 *         description: Login Success
 *         content:
 *           application/json:
 *             schema:
 *               $ref:  '#/components/schemas/Seller'
 *       500:
 *         description: Server Error
 * /Seller/{id}:
 *   get:
 *     summary: get Seller by id
 *     tags: [Seller]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Seller ID
 *     responses:
 *       200:
 *         description: Seller ID Response
 *         contents:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Seller'
 *       404:
 *         description: Seller Not Found
 *   patch:
 *     summary: Post an Seller
 *     tags: [Seller]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Seller ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref:  '#/components/schemas/Seller'
 *     response:
 *       200:
 *         description: Seller Posted
 *         content:
 *           application/json:
 *             schema:
 *               $ref:  '#/components/schemas/Seller'
 *       500:
 *         description: Server Error
 *   delete:
 *     summary: Delete a Seller
 *     tags: [Seller]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Seller ID
 *     response:
 *       200:
 *         description: Seller Deleted
 *       500:
 *         description: Server Error
 *
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Seller:
 *       type: object
 *       required:
 *         - username
 *         - password
 *         - location
 *       properties:
 *         id:
 *           type: integer
 *           description: The auto-generated id of the seller
 *         name:
 *           type: string
 *           description: Seller Username
 *         password:
 *           type: string
 *           description: Account password
 *         location:
 *           type: integer
 *           description: Seller Location
 *       example:
 *         id: 1
 *         username: seller1
 *         password: passwordseller1
 *         location: london
 */

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
