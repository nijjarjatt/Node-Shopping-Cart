var app = angular.module('shoppingCart',['ui.router', 'xeditable']);


app.config([
	'$stateProvider',
	'$urlRouterProvider',
	function($stateProvider, $urlRouterProvider) {

	$stateProvider
	.state('home', {
		url: '/home',
		templateUrl: '/home.html',
		controller: 'MainCtrl',
		resolve: {
			postPromise: ['products', function(products){
			  return products.getAll();
			}]
		}

	}).state('products',{
		url: '/products/{id}',
		templateUrl: '/products.html',
		controller: 'ProductsCtrl',
		resolve: {
			product: ['$stateParams', 'products', function($stateParams, products) {
			  return products.get($stateParams.id);
			}]
		}
	}).state('login', {
	  url: '/login',
	  templateUrl: '/login.html',
	  controller: 'AuthCtrl',
	  onEnter: ['$state', 'auth', function($state, auth){
	    if(auth.isLoggedIn()){
	      $state.go('home');
	    }
	  }]
	})
	.state('register', {
	  url: '/register',
	  templateUrl: '/register.html',
	  controller: 'AuthCtrl',
	  onEnter: ['$state', 'auth', function($state, auth){
	    if(auth.isLoggedIn()){
	      $state.go('home');
	    }
	  }]
	});

	$urlRouterProvider.otherwise('home');
}]);

app.factory('products', ['$http', 'auth', function($http, auth){
	var o = {
		products:[]
	};
	o.getAll = function(){
		return $http.get('/products').success(function(data){
			angular.copy(data, o.products)			
		});		
	}
	o.create = function(product) {
	  return $http.post('/products', product, { headers: {Authorization: 'Bearer '+auth.getToken()} }).success(function(data){
	    o.products.push(data);
	  });
	};
	o.get = function(id) {
		return $http.get('/products/' + id).then(function(res){
			return res.data;
		});
	};
	o.delete = function(id){
		return $http.delete('/products/' + id).then(function(res){
			for(var i = 0; i < o.products.length; i++) {
				var obj = o.products[i];
				if( String(id) == obj._id ){
					o.products.splice(i, 1);					
				}
			}	
		});
	};
	o.update = function(product){
		return $http.put('/products/' + product._id, product).then(function(res){
			console.log('Product Updated Sucessfully');

		});
	};
	return o;
}]);

app.factory('auth', ['$http', '$window', function($http, $window){
	var auth = {};

	auth.saveToken = function (token){
		$window.localStorage['flapper-news-token'] = token;
	};

	auth.getToken = function (){
		return $window.localStorage['flapper-news-token'];
	};

	auth.isLoggedIn = function(){
		var token = auth.getToken();

		if(token){
			var payload = JSON.parse($window.atob(token.split('.')[1]));
			return payload.exp > Date.now() / 1000;
		} else {
			return false;
		}
	};

	auth.currentUser = function(){
		if(auth.isLoggedIn()){
			var token = auth.getToken();
			var payload = JSON.parse($window.atob(token.split('.')[1]));

			return payload.username;
		}
	};

	auth.register = function(user){
		return $http.post('/register', user).success(function(data){
			auth.saveToken(data.token);
		});
	};

	auth.logIn = function(user){
		return $http.post('/login', user).success(function(data){
			auth.saveToken(data.token);
		});
	};

	auth.logOut = function(){
		$window.localStorage.removeItem('flapper-news-token');
	};

	return auth;
}])

app.controller('MainCtrl', ['$scope', 'products', 'auth', function($scope, products, auth ){

	$scope.products = products.products;
	$scope.isLoggedIn = auth.isLoggedIn;
	$scope.editMode = false;

	$scope.updateProduct = function(product){
		products.update(product);
	};
	$scope.addProduct =  function(){
		if( !$scope.name || $scope.name ==='' || !$scope.sku || $scope.sku ==='' || !$scope.desc || $scope.desc ==='' || !$scope.price || $scope.price ===''  ){return;}

		products.create({
			name: $scope.name,
			sku: $scope.sku,
			desc: $scope.desc,
			price: $scope.price 
		});

		$scope.name = $scope.sku = $scope.desc = $scope.price = '';
	};

	$scope.deleteProduct = function(productID){
		products.delete(productID);
	};

}]).controller('ProductsCtrl', ['$scope','$stateParams','products', 'product',	function($scope, $stateParams, products, product){
	$scope.product = product;
}]).controller('AuthCtrl', [
'$scope',
'$state',
'auth',
function($scope, $state, auth){
  $scope.user = {};

  $scope.register = function(){
    auth.register($scope.user).error(function(error){
      $scope.error = error;
    }).then(function(){
      $state.go('home');
    });
  };

  $scope.logIn = function(){
    auth.logIn($scope.user).error(function(error){
      $scope.error = error;
    }).then(function(){
      $state.go('home');
    });
  };
}]).controller('NavCtrl', [
	'$scope',
	'auth',
	function($scope, auth){
	  $scope.isLoggedIn = auth.isLoggedIn;
	  $scope.currentUser = auth.currentUser;
	  $scope.logOut = auth.logOut;
}]);

app.run(function(editableOptions) {
  editableOptions.theme = 'bs3'; // bootstrap3 theme. Can be also 'bs2', 'default'
});




