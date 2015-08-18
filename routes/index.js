var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var Product = mongoose.model('Product');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/products', function(req, res, next){
	Product.find(function(err, products){
		if(err){ return next(err); }
		res.json(products);		
	});	
});

router.post('/products', function(req, res, next){
	var product = new Product(req.body);

	product.save(function(err, product){
		if(err) {  return next(err); }
		res.json(product);
	});

});

router.param('product', function(req, res, next, id) {
  var query = Product.findById(id);

  query.exec(function (err, product){
    if (err) { return next(err); }
    if (!product) { return next(new Error('can\'t find product')); }

    req.product = product;
    return next();
  });
});

router.get('/products/:product', function(req, res) {
  res.json(req.product);
});

router.put('/products/:product', function(req, res){
  for(prop in req.body){
    req.product[prop] = req.body[prop];
  }
  req.product.save(function(err, product){
    if(err) { return res.send(err); }
    res.json(product);
  });
});

router.delete('/products/:product', function(req, res){
	req.product.remove(function(err){
  	if(err){
  		res.send('Error');  		
  	}
  	res.send(204);  	
  });
});





module.exports = router;
