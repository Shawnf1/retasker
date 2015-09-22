var app = angular.module('taskApp', ['ngRoute']);

app.config(['$routeProvider', '$locationProvider', '$httpProvider', function($routeProvider, $locationProvider, $httpProvider){
	// clear out local storage on load
	//localStorage.reset();

	$locationProvider.html5Mode(true);
	$routeProvider.when('/',
		{
			templateUrl: '/views/login.html',
			controller: 'loginCtrl'
		}).when('/home',
		{
			templateUrl: '/views/home.html',
			controller: 'mainCtrl'
		}).when('/task',
		{
			templateUrl: '/views/tasks.html',
			controller: 'taskCtrl'
		}).when('/note',
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
			redirectTo: '/'
		});

	$httpProvider.interceptors.push('authInterceptor');
}]);

app.controller('loginCtrl', ['$scope', '$http', '$location', function($scope, $http, $location){
	//$('.auth').attr('disabled', true);
	//$('#error_div').append($('<p>').text("failure"));

	$scope.message = "Welcome to Task Manager!";
	$scope.subtitle = "Please login to continue...";
	$scope.login = function () {
		var user = {
			username: $scope.username,
			password: $scope.password
		};
		console.log('login clicked', user);
		$http.post('/authenticate', user).then(function (data) {
			console.log("done", data.data);
			// save JWT token
			localStorage.setItem('userToken', data.data.token);

			// redirect page to home
			$location.path('/home');
		});
	};
}]);

app.controller('mainCtrl', ['$scope', function($scope){
	$('.auth').prop('disabled', false);
	$scope.message = "Welcome Home!";
}]);

app.controller('taskCtrl', ['$scope', function($scope){
	$('.auth').prop('disabled', false);
	$scope.message = "Here are your tasks!";
}]);

app.controller('noteCtrl', ['$scope', function($scope){
	$('.auth').prop('disabled', false);
	$scope.message = "Here are your notes!";
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
			}, 1000, 3);
			$timeout(function () {
				$location.path('/');
			}, 3000);
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

app.controller('logoutCtrl', ['$scope', '$location', '$timeout', '$interval', function($scope, $location, $timeout, $interval) {
	$('.auth').prop('disabled', true);
	$scope.message = "You have been logged out...";
	$scope.countdown = 3;
	localStorage.removeItem('userToken');
	$interval(function () {
		$scope.countdown--;
	}, 1000, 3);
	$timeout(function () {
		$location.path('/');
	}, 3000);
}]);

app.controller('naCtrl', ['authService', '$scope', '$rootScope', '$location', function(authService, $scope, $rootScope, $location) {
	$rootScope.use = authService.getUser();

	if($rootScope.user && $rootScope.user.username){
		$location.path('/home');
	}

	$scope.logout = function(){
		authService.logout();
		$rootScope.user = authService.getUser();
		$location.path("/login");
	}
}]);

app.service('authService', ['$window', function ($window) {

	this.parseJwt = function (token) {
		if (token) {
			var base64Url = token.split('.')[1];
			var base64 = base64Url.replace('-', '+').replace('_', '/');
			return JSON.parse($window.atob(base64));
		} else return {};
	};

	this.saveToken = function (token) {
		$window.localStorage.jwtToken = token;
		console.log('Saved token:',$window.localStorage.jwtToken);
	};

	this.getToken = function () {
		return $window.localStorage.jwtToken;
	};

	this.isAuthed = function () {
		var token = this.getToken();
		if (token) {
			var params = this.parseJwt(token);
			var notExpired = Math.round(new Date().getTime() / 1000) <= params.exp;
			if (!notExpired) {
				this.logout();
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
		return this.parseJwt(this.getToken())
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