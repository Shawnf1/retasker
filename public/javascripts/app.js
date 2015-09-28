var app = angular.module('taskApp', ['ngRoute', 'ngTagsInput']);

app.config(['$routeProvider', '$locationProvider', '$httpProvider', function($routeProvider, $locationProvider, $httpProvider){
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
	var token = authService.getToken();
	var task = {
		token: token
	};
	//console.log($moment());
	//$scope.dateFormat = 'MM/DD/YYYY';
	//$scope.fullDateFormat = 'MM/DD/YYYY h:mm';
	$scope.freqOptions =
		[
			{
				value: "",
				text: "Select One"
			},
			{
				value: "daily",
				text: "Daily"
			},
			{
				value: "weekly",
				text: "Weekly"
			},
			{
				value: "monthly",
				text: "Monthly"
			},
			{
				value: "quarterly",
				text: "Quarterly"
			},
			{
				value: "semi-annually",
				text: "Semi Annually"
			},
			{
				value: "annually",
				text: "Annually"
			}
		];

	$scope.repOptions =
		[
			{
				value: "indef",
				text: "Indefinitely"
			},
			{
				value: "times",
				text: "Number of Times"
			},
			{
				value: "date",
				text: "End Date"
			}
		];
	// $scope.freq = $scope.freqOptions[0];
	// console.log("onload data: ", task);
	$scope.show = function () {
		console.log("user_id", authService.getUserId());
		$http.get('/tasks', {params: {user_id: authService.getUserId()}}).then(function (res) {
			console.log("res data: ", res.data);
			$scope.header = "Tasks";
			$scope.tasks = res.data;
			$scope.tasks.forEach(function (v, i, a) {
				// for each of the dates in an object, creating a pretty format (shrunk to date only) and full (with time)
				a[i].pCreate = moment(a[i].created_on).format("MM/DD/YYYY");
				a[i].fCreate = moment(a[i].created_on).format("MM/DD/YYYY h:mm:ss a");

				a[i].pUpdate = moment(a[i].updated_on).format("MM/DD/YYYY");
				a[i].fUpdate = moment(a[i].updated_on).format("MM/DD/YYYY h:mm:ss a");

				a[i].pStart = moment(a[i].start_date).format("MM/DD/YYYY");
				a[i].fStart = moment(a[i].start_date).format("MM/DD/YYYY h:mm:ss a");

				if(a[i].end_date) {
					a[i].pEnd = moment(a[i].end_date).format("MM/DD/YYYY");
					a[i].fEnd = moment(a[i].end_date).format("MM/DD/YYYY h:mm:ss a");
				}
			});
			console.log("updated", $scope.tasks);
		});
	};
	if(authService.isAuthed()) {
		$scope.message = "Here are your tasks!";
		$scope.show();

	}else {
		$rootScope.user = { };
		$scope.error = "You are not authorized to view this page";
		$interval(function () {
			$location.path('/');
		}, 3000);
	}


	$scope.addTask = function () {
		var task = {
			title: $scope.title,
			desc: $scope.desc,
			frequency: $scope.freq,
			start_date: $scope.start,
			repetitions: $scope.reps,
			read_only: $scope.read_only
		};
		var user = authService.getUserId();
		$http.post('/tasks', {user_id: user.id, task: task}).then(function (res) {
			$scope.success = res.responseText;
			$timeout(function () {
				$scope.success = "";
			}, 3000);
			$scope.tasks.push(res.data);
		}, function (res) {
			console.log(res.responseText);
			$scope.error = res.responseText;
			//$timeout(function () {
			//	$scope.error = "";
			//}, 5000);
		});
	};
}]);

app.controller('noteCtrl', ['$scope', '$rootScope', 'authService', '$http', function($scope, $rootScope, authService, $http){
	$rootScope.user = authService.getUser();
	if(authService.isAuthed()) {
		$scope.message = "Here are your notes!";
		$scope.tagsArray = [];
		$scope.AddNote = function () {
			var note = {
				title: $scope.title,
				desc: $scope.desc,
				tag: $scope.tagsArray,
				read_only: $scope.read_only,
				task: $scope.task
			};
			$http.post('/tasks', task).then(function (res) {
				$scope.success = res.responseText;
				$timeout(function () {
					$scope.success = "";
				}, 3000);
				$scope.tasks.push(res.data);
			}, function (res) {
				console.log(res.responseText);
				$scope.error = res.responseText;
				//$timeout(function () {
				//	$scope.error = "";
				//}, 5000);
			});
		};
		// load tags from db
		$scope.getTags = function (query) {
			//return $http.get()
			return [{text: 'Tag1'}, {text: 'Tag2'}, {text: 'Tag3'}];
		};
		$scope.addTag = function (tag) {
			console.log(tag);
			$scope.tagsArray.push(tag);
		};
		$scope.highlight = function (element) {
			element.select();
		};
		$scope.nothing = function () {
			console.log("did nothing");
		};
		//$scope.removeTag = function (tag) {
		//	var index = $scope.tagsArray.indexOf(tag);
		//	$scope.tagsArray.splice(index, 1);
		//};
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

app.controller('tagCtrl',['$scope',function($scope){
	$scope.$watchCollection('tags',function(val){
		console.log(val, $scope.data);
	});
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

	// return just user id for queries
	this.getUserId = function () {
		return self.getUser().id;
	}
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

app.directive('autoComplete',['$http',function($http){
	return {
		restrict:'AE',
		scope:{
			selectedTags:'=model'
		},
		templateUrl:'/views/autocomplete.html',
		link:function(scope,elem,attrs){

			scope.suggestions=[];

			scope.selectedTags=[];

			scope.selectedIndex=-1;

			scope.removeTag=function(index){
				scope.selectedTags.splice(index,1);
			};

			scope.search=function(){
				console.log("Search ", scope.searchText);
				//$http.get(attrs.url, {params: {term: scope.searchText}}).success(function(data){
				//$http.get(attrs.url+'?term='+scope.searchText).success(function(data){
				$http({
					method: 'GET',
					url: attrs.url,
					params: {term: scope.searchText}
				}).then( function (data) {
					var res = data.data;
					console.log("tags", data, data.data);
					if(res.indexOf(scope.searchText)===-1){
						res.unshift(scope.searchText);
					}
					scope.suggestions=res;
					scope.selectedIndex=-1;
				});
			};

			scope.addToSelectedTags=function(index){
				if(scope.selectedTags.indexOf(scope.suggestions[index])===-1){
					scope.selectedTags.push(scope.suggestions[index]);
					scope.searchText='';
					scope.suggestions=[];
				}
			};

			scope.checkKeyDown=function(event){
				if(event.keyCode===40){
					event.preventDefault();
					if(scope.selectedIndex+1 !== scope.suggestions.length){
						scope.selectedIndex++;
					}
				}
				else if(event.keyCode===38){
					event.preventDefault();
					if(scope.selectedIndex-1 !== -1){
						scope.selectedIndex--;
					}
				}
				else if(event.keyCode===13){
					if(scope.selectedIndex === -1) {
						scope.addToSelectedTags(0);
					}else {
						scope.addToSelectedTags(scope.selectedIndex);
					}
				}
			};

			scope.$watch('selectedIndex',function(val){
				if(val!==-1) {
					scope.searchText = scope.suggestions[scope.selectedIndex];
				}
			});
		}
	}
}]);