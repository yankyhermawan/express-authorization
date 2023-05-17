export class SellerException {
	UserNotFound() {
		return "Seller Not Found";
	}

	InvalidUsernameOrPassword() {
		return "Wrong Username or Password";
	}

	UsernameExist() {
		return "Username Already Registered";
	}
}
