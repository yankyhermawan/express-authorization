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
}
