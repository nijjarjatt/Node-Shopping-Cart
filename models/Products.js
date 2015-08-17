var mongoose = require('mongoose');

var ProductSchema = new mongoose.Schema({
	name: String,
	sku: String,
	desc: String,
	price: String
});

mongoose.model('Product', ProductSchema);