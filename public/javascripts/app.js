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

	$rootScope.user = authService.getUser();

	if(authService.isAuthed()) {
		$scope.message = "Welcome back, "+ $rootScope.user.first_name;
		$scope.subtitle = "Logging you in...";
		$timeout(function () {
			$location.path('/home');
		}, 1500);
	}else {
		$scope.message = "Welcome to Task Manager!";
		$scope.subtitle = "Please login to continue...";
	}

	$scope.login = function () {
		var user = {
			username: $scope.username,
			password: $scope.password
		};

		$http.post('/authenticate', user).then(function (res) {
			authService.saveToken(res.data.token);
			$rootScope.user = authService.getUser();
			$location.path('/home');
		}, function (res) {
			$scope.error = res.responseText;
			$timeout(function () {
				$scope.error = "";
			}, 5000);
		});
	};
}]);

app.controller('mainCtrl', ['$scope', 'authService', '$location', '$interval', '$rootScope', '$http', function($scope, authService, $location, $interval, $rootScope, $http){
	$rootScope.user = authService.getUser();

	if(authService.isAuthed()) {
		$scope.message = "Welcome Home!";
	}else {
		$rootScope.user = { };
		$scope.error = "You are not authorized to view this page";
		$interval(function () {
			$location.path('/');
		}, 3000);
	}
}]);

app.controller('taskCtrl', ['$scope', '$rootScope', 'authService', '$http', '$timeout', function($scope, $rootScope, authService, $http, $timeout){
	$rootScope.user = authService.getUser();
	if(authService.isAuthed()) {
		$scope.message = "Here are your tasks!";
	}else {
		$rootScope.user = { };
		$scope.error = "You are not authorized to view this page";
		$interval(function () {
			$location.path('/');
		}, 3000);
	}

	$scope.addTask = function () {
		var task = {
			token: authService.getToken(),
			title: $scope.title,
			desc: $scope.desc,
			frequency: $scope.freq,
			start_date: $scope.start,
			repetitions: $scope.reps,
			read_only: $scope.read_only
		};
		$http.post('/tasks', task).then(function (res) {
			$scope.success = res.responseText;
			$timeout(function () {
				$scope.success = "";
			}, 3000);
		}, function (res) {
			$scope.error = res.responseText;
			$timeout(function () {
				$scope.error = "";
			}, 5000);
		});
	};

}]);

app.controller('noteCtrl', ['$scope', '$rootScope', 'authService', function($scope, $rootScope, authService){
	$rootScope.user = authService.getUser();
	if(authService.isAuthed()) {
		$scope.message = "Here are your notes!";
	}else {
		$rootScope.user = { };
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

		$ajaxCall.fail(function (res) {
			$scope.error = res.responseText;
			$scope.$apply();
			$timeout(function () {
				$scope.error = "";
			}, 3000);
		});

		$ajaxCall.always(function (res) {
			//console.log("AJAX complete");
		});
	};
}]);

app.controller('navCtrl', ['authService','$scope','$rootScope','$location', function(authService, $scope,$rootScope, $location){

}]);

app.controller('logoutCtrl', ['$scope', '$location', '$timeout', '$interval', 'authService', '$rootScope', function($scope, $location, $timeout, $interval, authService, $rootScope) {

	$scope.message = "Logging you out...";
	$scope.countdown = 3;

	$interval(function () {
		$scope.countdown--;
	}, 1000, 1);
	$timeout(function () {
		authService.logout();
		$rootScope.user = authService.getUser();
		$location.path('/');
	}, 2000);
}]);

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
		return $window.localStorage.jwtToken;
	};

	this.isAuthed = function () {
		var token = self.getToken();
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