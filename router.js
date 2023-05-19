import express from "express";
import { SellerService } from "./seller/seller.service.js";
import { ItemsService } from "./items/items.service.js";
import { ItemsGuard } from "./items/items.guard.js";
import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

const app = express();
const port = process.env.PORT || 4000;
const sellerService = new SellerService();
const itemsService = new ItemsService();
const itemsGuard = new ItemsGuard();
const swaggerOptions = {
	definition: {
		openapi: "3.0.0",
		info: {
			title: "Your API Title",
			version: "1.0.0",
			description: "Your API Description",
		},
		components: {
			securitySchemes: {
				bearerAuth: {
					type: "http",
					scheme: "bearer",
					bearerFormat: "JWT",
				},
			},
		},
	},
	apis: ["./router.js", "./items/*.js", "./seller/*.js"], // Path to your API route files
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);

app.use(express.json());
app.use(
	"/api-docs",
	swaggerUi.serve,
	swaggerUi.setup(swaggerDocs, { explorer: true })
);

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
	.get(async (req, res) => {
		const itemID = req.params.id;
		const response = await itemsService.getByID(+itemID);
		res.status(response.code).json(response.response);
	})
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
