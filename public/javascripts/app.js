var app = angular.module('taskApp', ['ngRoute']);

app.config(['$routeProvider', '$locationProvider', '$httpProvider', function($routeProvider, $locationProvider, $httpProvider){
	// clear out local storage on load
	//localStorage.reset();

	$locationProvider.html5Mode(true);
	$routeProvider.when('/login',
		{
			templateUrl: '/views/login.html',
			controller: 'loginCtrl'
		}).when('/home',
		{
			templateUrl: '/views/home.html',
			controller: 'mainCtrl'
		}).when('/tasks',
		{
			templateUrl: '/views/tasks.html',
			controller: 'taskCtrl'
		}).when('/notes',
		{
			templateUrl: '/views/notes.html',
			controller: 'noteCtrl'
		}).when('/register',
		{
			templateUrl: '/views/register.html',
			controller: 'registerCtrl'
		}).when('/logout',
		{
			templateUrl: '/views/logout.html',
			controller: 'logoutCtrl'
		}).otherwise({
			redirectTo: '/login'
		});

	$httpProvider.interceptors.push('authInterceptor');
}]);

app.controller('loginCtrl', ['$scope', '$http', '$location', '$timeout', 'authService', '$rootScope', '$interval', function($scope, $http, $location, $timeout, authService, $rootScope, $interval){
	//$('.auth').attr('disabled', true);
	//$('#error_div').append($('<p>').text("failure"));

	$scope.message = "Welcome to Task Manager!";
	$scope.subtitle = "Please login to continue...";
	$scope.login = function () {
		var user = {
			username: $scope.username,
			password: $scope.password
		};

		$http.post('/authenticate', user).then(function (res) {
			//console.log("response ", res.data);
			authService.saveToken(res.data.token);
			$rootScope.user = authService.getUser();
			//userService.setUser(authService.getUser());
			//$interval(function () {
				//console.log(authService.getUser());
			//}, 1000, 1);
			//$timeout(function () {
				$location.path('/home');
			//}, 2000);
		}, function (res) {
			$scope.error = res.responseText;
			$timeout(function () {
				$scope.error = "";
			}, 5000);
		});


		////console.log('login clicked', user);
		//var $ajaxCall = $.ajax({
		//	url: '/authenticate',
		//	method: 'POST',
		//	data: user
		//});
		//
		//$ajaxCall.done(function (res) {
		//	$scope.$apply();
		//	//localStorage.setItem('userToken', res.token);
		//	//console.log("Authed success: ", res);
		//	//$location.path('/home');
		//	authService.saveToken(res.token);
		//	$rootScope.user = authService.getUser();
		//	//console.log("Post success: ", authService.parseJwt(res.token));
		//	//$location.path('/home');
		//});
		//
		//$ajaxCall.fail(function (res) {
		//	$scope.error = res.responseText;
		//	$scope.$apply();
		//	$timeout(function () {
		//		$scope.error = "";
		//	}, 5000);
		//});
		//
		//$ajaxCall.always(function (res) {
		//	console.log("AJAX complete!", authService.getUser());
		//	var counter = 0;
		//	$interval(function () {
		//		console.log(counter++, authService.getUser());
		//	}, 1000, 10);
		//});
		//$http.post('/authenticate', user).then(function (data) {
		//	console.log("done", data.data);
		//	// save JWT token
		//	localStorage.setItem('userToken', data.data.token);
		//
		//	// redirect page to home
		//	$location.path('/home');
		//});
	};
}]);

app.controller('mainCtrl', ['$scope', 'authService', '$location', '$interval', '$rootScope', '$http', function($scope, authService, $location, $interval, $rootScope, $http){
	$rootScope.user = authService.getUser();
	//
	//
	//console.log("user service ", userService.getUser());
	//console.log("window ", $window.localStorage.jwtToken);
	//console.log("root ", $rootScope);
	//console.log("scope ", $scope);
	//if($rootScope.user && $rootScope.user.username){
	//	$location.path('/admin');
	//}
	//
	//$scope.logout = function(){
	//	authService.logout();
	//	$rootScope.user = authService.getUser();
	//	$location.path("/login");
	//}
	if(authService.isAuthed()) {
		//console.log("authed into home", authService.getToken());
		$scope.message = "Welcome Home!";
	}else {
		$scope.error = "You are not authorized to view this page";
		//console.log("Auth failed unto home", authService.getUser(), authService.isAuthed());
		$interval(function () {
			$location.path('/');
		}, 3000);
	}
	//$('.auth').prop('disabled', false);
	//var $ajaxCall = $.ajax({
	//	url: '/authenticate',
	//	method: 'POST',
	//	data:
	//})
}]);

app.controller('taskCtrl', ['$scope', '$rootScope', 'authService', function($scope, $rootScope, authService){
	$rootScope.user = authService.getUser();
	if(authService.isAuthed()) {
		//console.log("authed into home", authService.getToken());
		$scope.message = "Here are your tasks!";
	}else {
		$scope.error = "You are not authorized to view this page";
		$interval(function () {
			$location.path('/');
		}, 3000);
	}
}]);

app.controller('noteCtrl', ['$scope', '$rootScope', 'authService', function($scope, $rootScope, authService){
	$rootScope.user = authService.getUser();
	if(authService.isAuthed()) {
		//console.log("authed into home", authService.getToken());
		$scope.message = "Here are your notes!";
	}else {
		$scope.error = "You are not authorized to view this page";
		$interval(function () {
			$location.path('/');
		}, 3000);
	}
}]);

app.controller('registerCtrl', ['$scope', '$http', '$location', '$interval', '$timeout', function($scope, $http, $location, $interval, $timeout){
	$scope.register = function () {
		var data = {
			username: $scope.username,
			password: $scope.password,
			password_confirm: $scope.password_confirm,
			email: $scope.email,
			email_confirm: $scope.email_confirm,
			first_name: $scope.firstName,
			last_name: $scope.lastName
		};
		//console.log("register", data);
		var $ajaxCall = $.ajax({
			url: '/register',
			data: data,
			method: 'POST'
		});

		$ajaxCall.done(function (res) {
			$scope.success = "Successfully registered for an account! Redirecting to login in ";
			$scope.time = 3;
			$scope.$apply();
			$interval(function () {
				$scope.time--;
			}, 1000, 1);
			$timeout(function () {
				$location.path('/');
			}, 2000);
		});

		//$scope.error = "Test error";
		$ajaxCall.fail(function (res) {
			//alert(res.responseText);
			//$scope.success = res.responseText;
			$scope.error = res.responseText;
			//$scope.setError(res.responseText);
			$scope.$apply();
			//console.log("registration failed (msg): ", res.responseText);
			$timeout(function () {
				$scope.error = "";
			}, 3000);
		});

		$ajaxCall.always(function (res) {
			//console.log("AJAX complete");
			//$scope.success = "Always: "+ res.responseText;
		});
	};

	//$scope.setError = function (err) {
	//	$scope.error = err;
	//};
}]);

app.controller('navCtrl', ['authService','$scope','$rootScope','$location', function(authService, $scope,$rootScope, $location){
	//$rootScope.user = authService.getUser();

	//if($rootScope.user && $rootScope.user.username){
	//	$location.path('/home');
	//}

	//$scope.logout = function(){
	//	authService.logout();
	//	$rootScope.user = authService.getUser();
	//	$location.path("/login");
	//}
}]);

app.controller('logoutCtrl', ['$scope', '$location', '$timeout', '$interval', 'authService', '$rootScope', function($scope, $location, $timeout, $interval, authService, $rootScope) {
	//$('.auth').prop('disabled', true);
	$scope.message = "Logging you out...";
	$scope.countdown = 3;
	//localStorage.removeItem('userToken');
	$interval(function () {
		$scope.countdown--;
	}, 1000, 1);
	$timeout(function () {
		authService.logout();
		$rootScope.user = authService.getUser();
		$location.path('/');
	}, 2000);
}]);

//app.service('userService', [function () {
//	var user;
//
//	this.setUser = function (usr) {
//		user = usr;
//	};
//
//	this.getUser = function () {
//		return user;
//	};
//}]);

app.service('authService', ['$window', function ($window) {

	var self = this;

	this.parseJwt = function (token) {
		if (token) {
			var base64Url = token.split('.')[1];
			var base64 = base64Url.replace('-', '+').replace('_', '/');
			return JSON.parse($window.atob(base64));
		} else return {};
	};

	this.saveToken = function (token) {
		$window.localStorage.jwtToken = token;
		//console.log('Saved token:',$window.localStorage.jwtToken);
	};

	this.getToken = function () {
		//console.log($window.localStorage);
		return $window.localStorage.jwtToken;
	};

	this.isAuthed = function () {
		var token = self.getToken();
		//var token = (this.getToken() !== "undefined") ? this.getToken() : false;
		//console.log("authed begin", token);
		if (token) {
			var params = self.parseJwt(token);
			var notExpired = Math.round(new Date().getTime() / 1000) <= params.exp;
			if (!notExpired) {
				self.logout();
			}
			return notExpired;
		} else {
			return false;
		}
	};

	this.logout = function () {
		delete $window.localStorage.jwtToken;
	};

	// expose user as an object
	this.getUser = function () {
		return self.parseJwt(self.getToken())
	};
}]);

app.factory('authInterceptor', ['$q', '$location', 'authService', function ($q, $location, authService) {
	return {
		request: function (config) {
			config.headers = config.headers || {};
			if (authService.isAuthed()) {
				config.headers.Authorization = 'Bearer ' + authService.getToken();
			}
			return config;
		},
		response: function (response) {

			if (response.status === 401) {

				// handle the case where the user is not authenticated
				$location.path("/login");
			}
			return response || $q.when(response);
		}, responseError: function (response) {
			if (response.status === 401) {
				$location.path("/login");

			} else {
				console.log(response);
			}
			return $q.reject(response);
		}
	};
}]);