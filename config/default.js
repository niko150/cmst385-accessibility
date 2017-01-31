const FirebaseTokenGenerator = require("firebase-token-generator")
const tokenGenerator = new FirebaseTokenGenerator("mBc9eBexg08sQSnfnR1KlhyHkVE7Z2VurY3u6x2L")

module.exports = {
	port: 8080,
	serverKey: 'cmst385-accessibility',
	firebase: {
		auth: tokenGenerator.createToken({ uid: "9w2XxhNlCAbrD4JV5zJbHLvk4tE2" }), 
		project: 'cmst385-accessibility'
	}
}