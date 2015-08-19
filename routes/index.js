var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var jwt = require('express-jwt');
var passport = require('passport');
var Product = mongoose.model('Product');
var User = mongoose.model('User');

var auth = jwt({secret: 'SECRET', userProperty: 'payload'});

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

router.post('/products', auth, function(req, res, next){
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

router.post('/register', function(req, res, next){
  if(!req.body.username || !req.body.password){
    return res.status(400).json({message: 'Please fill out all fields'});
  }

  var user = new User();

  user.username = req.body.username;

  user.setPassword(req.body.password)

  user.save(function (err){
    if(err){ return next(err); }

    return res.json({token: user.generateJWT()})
  });
});

router.post('/login', function(req, res, next){
  if(!req.body.username || !req.body.password){
    return res.status(400).json({message: 'Please fill out all fields'});
  }

  passport.authenticate('local', function(err, user, info){
    if(err){ return next(err); }

    if(user){
      return res.json({token: user.generateJWT()});
    } else {
      return res.status(401).json(info);
    }
  })(req, res, next);
});



module.exports = router;
