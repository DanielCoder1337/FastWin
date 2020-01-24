const mysql = require("mysql")

const db = mysql.createConnection({
	host: "db",
	user: "root",
	password: "abc123",
	database: "myDB"
})
exports.getAllHubs = function(callback){
	
	db.query("SELECT * FROM hubs", function(error, hubs){
		// TODO: Also handle errors.
		if (!error) {
			console.log(hubs)
			callback(hubs)
		} else throw "Failed to get hubs!"
	})
	
}