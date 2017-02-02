const FirebaseTokenGenerator = require("firebase-token-generator")
const tokenGenerator = new FirebaseTokenGenerator("mBc9eBexg08sQSnfnR1KlhyHkVE7Z2VurY3u6x2L")

module.exports = {
	port: 8080,
	public: 'dist/public',
	serverKey: 'cmst385-accessibility',
	firebase: {
		auth: tokenGenerator.createToken({ uid: "9w2XxhNlCAbrD4JV5zJbHLvk4tE2" }), 
		project: 'cmst385-accessibility',
		initializeConfig: {
			apiKey: "AIzaSyD5C7keyrldPDYSfR6k3X0HiO7RT3PUgx0",
	    authDomain: "cmst385-accessibility.firebaseapp.com",
  	  databaseURL: "https://cmst385-accessibility.firebaseio.com",
    	storageBucket: "cmst385-accessibility.appspot.com",
    	messagingSenderId: "131765912631"
		}
	}
}