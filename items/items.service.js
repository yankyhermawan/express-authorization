/**
 * @swagger
 * tags:
 *   name: Items
 *   description: The items managing API
 * /items:
 *   get:
 *     summary: Get all item
 *     tags: [Items]
 *     responses:
 *       200:
 *         description: Get all item.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Items'
 *       500:
 *         description: Some server error
 *   post:
 *     summary: Post an item
 *     security:
 *       -  bearerAuth: []
 *     tags: [Items]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref:  '#/components/schemas/Items'
 *     response:
 *       200:
 *         description: Item Posted
 *         content:
 *           application/json:
 *             schema:
 *               $ref:  '#/components/schemas/Items'
 *       500:
 *         description: Server Error
 * /items/{id}:
 *   get:
 *     summary: get item by id
 *     tags: [Items]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: item ID
 *     responses:
 *       200:
 *         description: Item ID Response
 *         contents:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Items'
 *       404:
 *         description: Item Not Found
 *   patch:
 *     summary: Post an item
 *     security:
 *       -  bearerAuth: []
 *     tags: [Items]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: item ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref:  '#/components/schemas/Items'
 *     response:
 *       200:
 *         description: Item Posted
 *         content:
 *           application/json:
 *             schema:
 *               $ref:  '#/components/schemas/Items'
 *       500:
 *         description: Server Error
 *   delete:
 *     summary: Delete an item
 *     security:
 *       -  bearerAuth: []
 *     tags: [Items]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: item ID
 *     response:
 *       200:
 *         description: Item Deleted
 *       500:
 *         description: Server Error
 *
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Items:
 *       type: object
 *       required:
 *         - name
 *         - description
 *         - sellerID
 *       properties:
 *         id:
 *           type: integer
 *           description: The auto-generated id of the item
 *         name:
 *           type: string
 *           description: Item's name
 *         description:
 *           type: string
 *           description: Description about item
 *         sellerID:
 *           type: integer
 *           description: Which seller this item belongs to
 *       example:
 *         id: 1
 *         title: Bracelet
 *         author: Pure Gold
 *         sellerID: 1
 */

import { PrismaService } from "../prisma.service.js";
import { SellerException } from "../seller/seller.exception.js";

export class ItemsService {
	constructor() {
		this.prismaService = new PrismaService();
		this.sellerException = new SellerException();
	}

	async createNewItem(sellerID, ItemData) {
		const sellerExist = await this.prismaService.seller.findFirst({
			where: {
				id: +sellerID,
			},
		});
		if (!sellerExist) {
			return {
				code: 401,
				response: {
					message: this.sellerException.UserNotFound(),
				},
			};
		}

		const response = await this.prismaService.item.create({
			data: {
				name: ItemData.name,
				description: ItemData.description,
				sellerID: sellerExist.id,
			},
		});

		return { code: 201, response: response };
	}

	async getAll() {
		try {
			const response = await this.prismaService.item.findMany();
			return { code: 200, response: response };
		} catch {
			return { code: 401, response: { message: "Error" } };
		}
	}

	async patchItem(itemID, sellerID, content) {
		const response = await this.prismaService.item.findFirst({
			where: { id: itemID },
		});
		if (response.sellerID !== +sellerID) {
			return { code: 401, response: { message: "Unauthorized" } };
		}

		const editedContent = {
			name: content.name || response.name,
			description: content.description || response.description,
		};
		const editResponse = await this.prismaService.item.update({
			where: {
				id: +itemID,
			},
			data: editedContent,
		});
		return { code: 201, response: editResponse };
	}

	async deleteItem(itemID, sellerID) {
		const response = await this.prismaService.item.findFirst({
			where: {
				id: itemID,
			},
		});
		if (!response) {
			return { code: 404, response: { message: "Item Not Found" } };
		}

		if (response.sellerID !== +sellerID) {
			return { code: 401, response: { message: "Unauthorized" } };
		}

		const deleteResponse = await this.prismaService.item.delete({
			where: {
				id: itemID,
			},
		});
		return { code: 200, response: deleteResponse };
	}

	async getByID(itemID) {
		const response = await this.prismaService.item.findFirst({
			where: { id: itemID },
		});
		if (!response) {
			return { code: 404, response: { message: "Item Not Found" } };
		}
		return { code: 200, response: response };
	}
}
