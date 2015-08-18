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
	});

	$urlRouterProvider.otherwise('home');
}]);

app.factory('products', ['$http', function($http){
	var o = {
		products:[]
	};
	o.getAll = function(){
		return $http.get('/products').success(function(data){
			angular.copy(data, o.products)			
		});		
	}
	o.create = function(product) {
	  return $http.post('/products', product).success(function(data){
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
}])

app.controller('MainCtrl', ['$scope', 'products', function($scope, products ){

	$scope.products = products.products;

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

}]);


app.controller('ProductsCtrl', ['$scope','$stateParams','products', 'product',	function($scope, $stateParams, products, product){
	$scope.product = product;
}]);

app.run(function(editableOptions) {
  editableOptions.theme = 'bs3'; // bootstrap3 theme. Can be also 'bs2', 'default'
});




