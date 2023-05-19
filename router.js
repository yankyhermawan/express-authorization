import express from "express";
import { SellerService } from "./seller/seller.service.js";
import { ItemsService } from "./items/items.service.js";
import { ItemsGuard } from "./items/items.guard.js";

const app = express();
const port = process.env.PORT || 4000;
const sellerService = new SellerService();
const itemsService = new ItemsService();
const itemsGuard = new ItemsGuard();

app.use(express.json());

app.route("/seller").get(async (req, res) => {
	const response = await sellerService.getAll();
	response.map((response) => (response.password = undefined));
	res.json(response);
});
app.route("/seller/register").post(async (req, res) => {
	const response = await sellerService.register(req.body);
	res.status(response.code).json(response.response);
});

app.route("/seller/login").post(async (req, res) => {
	const response = await sellerService.login(req.body);
	res.status(response.code).json(response.response);
});

app
	.route("/items")
	.post(async (req, res) => {
		const token = String(
			req.headers["authorization"].split(" ")[1].replace("'", "")
		);
		try {
			const checkToken = itemsGuard.checkTokenValid(token);
			if (checkToken) {
				const response = await itemsService.createNewItem(
					checkToken.id,
					req.body
				);
				res.status(response.code).json(response.response);
			}
		} catch {
			res.status(401).json({ message: "Invalid Token" });
		}
	})
	.get(async (req, res) => {
		const response = await itemsService.getAll();
		res.status(response.code).json(response.response);
	});

app
	.route("/items/:id")
	.patch(async (req, res) => {
		const itemID = req.params.id;
		const editedContent = req.body;
		const token = req.headers["authorization"].split(" ")[1].replace("'", "");
		const checkToken = itemsGuard.checkTokenValid(token);
		if (checkToken) {
			const response = await itemsService.patchItem(
				+itemID,
				+checkToken.id,
				editedContent
			);
			res.status(response.code).json(response.response);
		}
		res.status(404).json({ message: "Invalid Token" });
	})
	.delete(async (req, res) => {
		const itemID = req.params.id;
		const token = req.headers["authorization"].split(" ")[1].replace("'", "");
		const checkToken = itemsGuard.checkTokenValid(token);
		if (checkToken) {
			const response = await itemsService.deleteItem(itemID, checkToken.id);
			res.status(response.code, response.response);
		}
	});

app.listen(port, () => {
	console.log(`Server Started on ${port}`);
});
