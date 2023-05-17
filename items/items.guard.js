import jwt from "jsonwebtoken";

export class ItemsGuard {
	checkTokenValid(token) {
		return jwt.verify(token, process.env["JWT_PRIVATE"]);
	}
}
