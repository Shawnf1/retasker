var app = angular.module('taskApp', ['ngRoute']);

app.config(function($routeProvider, $locationProvider){
	// clear out local storage on load
	//localStorage.reset();

	$locationProvider.html5Mode(true);
	$routeProvider.when('/',
		{
			templateUrl: '/views/login.html',
			controller: 'loginController'
		}).when('/home',
		{
			templateUrl: '/views/home.html',
			controller: 'mainController'
		}).when('/task',
		{
			templateUrl: '/views/tasks.html',
			controller: 'taskController'
		}).when('/note',
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

app.controller('loginController', ['$scope', '$http', '$location', function($scope, $http, $location){
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

app.controller('mainController', ['$scope', function($scope){
	$('.auth').prop('disabled', false);
	$scope.message = "Welcome Home!";
}]);

app.controller('taskController', ['$scope', function($scope){
	$('.auth').prop('disabled', false);
	$scope.message = "Here are your tasks!";
}]);

app.controller('noteController', ['$scope', function($scope){
	$('.auth').prop('disabled', false);
	$scope.message = "Here are your notes!";
}]);

app.controller('registerController', ['$scope', '$http', '$location', '$interval', '$timeout', function($scope, $http, $location, $interval, $timeout){
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
			$interval(function () {
				$scope.time--;
			}, 1000, 3);
			$timeout(function () {
				$location.path('/');
			}, 3000);
		});

		//$scope.error = "Test error";
		$ajaxCall.fail(function (res) {
			alert(res.responseText);
			//$scope.success = res.responseText;
			$scope.error = res.responseText;
			//$scope.setError(res.responseText);
			$scope.$apply();
			console.log("registration failed (msg): ", res.responseText);
		});

		$ajaxCall.always(function (res) {
			console.log("AJAX complete");
			$scope.success = "Always: "+ res.responseText;
		});
	};

	//$scope.setError = function (err) {
	//	$scope.error = err;
	//};
}]);

app.controller('logoutController', ['$scope', '$location', '$timeout', '$interval', function($scope, $location, $timeout, $interval) {
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