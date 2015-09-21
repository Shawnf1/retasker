var app = angular.module('taskApp', ['ngRoute']);

app.config(function($routeProvider, $locationProvider){

	$locationProvider.html5Mode(true);

	$routeProvider.when('/',
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
		})
});

app.controller('mainController', function($scope){
	$scope.message = "Welcome to Task Manager!";
});

app.controller('taskController', function($scope){
	$scope.message = "Here are your tasks!";
});

app.controller('noteController', function($scope){
	$scope.message = "Here are your notes!";
});

app.controller('registerController', function($scope, $http){
	//$scope.message = "Here are your notes!";
	//console.log($scope.)
	$scope.register = function (event) {
		var data = {
			username: $scope.username,
			password: $scope.password,
			email: $scope.email,
			first_name: $scope.firstName,
			last_name: $scope.lastName
		};
		console.log("register", data);
		$http.post('/register', data).then(function (data) {
			console.log("done", data.data);
		});
	};
});