var app = angular.module('taskApp', ['ngRoute']);

app.config(function($routeProvider, $locationProvider){

	$locationProvider.html5Mode(true);

	$routeProvider.when('/',
		{
			templateUrl: '/views/login.html',
			controller: 'loginController'
		}).when('/home',
		{
			templateUrl: '/views/home.html',
			controller: 'mainController'
		}).when('/about',
		{
			templateUrl: '/views/tasks.html',
			controller: 'taskController'
		}).when('/contact',
		{
			templateUrl: '/views/notes.html',
			controller: 'noteController'
		}).when('/register',
		{
			templateUrl: '/views/register.html',
			controller: 'registerController'
		}).when('/logout',
		{
			templateUrl: '/views/logout.html',
			controller: 'logoutController'
		})
});

app.controller('loginController', function($scope, $http, $location){
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
});

app.controller('mainController', function($scope){
	$scope.message = "Welcome Home!";
});

app.controller('taskController', function($scope){
	$scope.message = "Here are your tasks!";
});

app.controller('noteController', function($scope){
	$scope.message = "Here are your notes!";
});

app.controller('registerController', function($scope, $http, $location){
	//$scope.message = "Here are your notes!";
	//console.log($scope.)
	$scope.register = function (event) {
		var data = {
			username: $scope.username,
			password: $scope.password,
			password_confirm: $scope.password_confirm,
			email: $scope.email,
			email_confirm: $scope.email_confirm,
			first_name: $scope.firstName,
			last_name: $scope.lastName
		};
		console.log("register", data);
		var $ajaxCall = $.ajax({
			url: '/register',
			data: data,
			method: 'POST'
		});

		$ajaxCall.done(function (res) {
			$location.path('/');
		});

		$ajaxCall.fail(function (res) {
			console.log("registration failed", res.responseText);
		});
	//}.then(function (data) {
	//		console.log("done", data.data);
			//$location.path('/');
		//}, function (data) {
		//	console.log("registration failed ", data);
		//});
	};
});

app.controller('logoutController', function($scope, $location, $timeout) {
	$scope.message = "You have been logged out...";
	localStorage.removeItem('userToken');
	$timeout(function () {
		$location.path('/');
	}, 3000);
});