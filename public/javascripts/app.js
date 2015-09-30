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
	$scope.status = false;
	$rootScope.user = authService.getUser();
	var prettyDate = "MM/DD/YYYY";
	var fullDate = "MM/DD/YYYY h:mm:ss a";
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

	$scope.show = function () {
		//console.log("user_id", authService.getUserId());
		$http.get('/tasks', {params: {user_id: authService.getUserId()}}).then(function (res) {
			//console.log("res data: ", res.data);
			$scope.header = "Tasks";
			if(Array.isArray(res.data) && typeof res.data !== "string") {
				$scope.error = "";
				$scope.status = false;
				$scope.tasks = res.data;
				$scope.tasks.forEach(function (v, i, a) {
					// for each of the dates in an object, creating a pretty format (shrunk to date only) and full (with time)
					a[i].pCreate = moment(a[i].created_on).format(prettyDate);
					a[i].fCreate = moment(a[i].created_on).format(fullDate);

					a[i].pUpdate = moment(a[i].updated_on).format(prettyDate);
					a[i].fUpdate = moment(a[i].updated_on).format(fullDate);

					a[i].pStart = moment(a[i].start_date).format(prettyDate);
					a[i].fStart = moment(a[i].start_date).format(fullDate);

					if(a[i].end_date) {
						a[i].pEnd = moment(a[i].end_date).format(prettyDate);
						a[i].fEnd = moment(a[i].end_date).format(fullDate);
					}
				});
			} else if(typeof res.data === "string") {
				if(res.data == "No tasks created.") {
					$scope.status = res.data;
				}else {
					$scope.error = res.data;
				}
			}
			//console.log("updated", $scope.tasks);
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
		//$http.post('/tags', {tags: [{title: "test"}, {title: "test 2"}, {title: "test 3"}], user_id: authService.getUserId()}).then(function (res) {
		////$http.post('/tags', {tags: [{title: "test"}], user_id: authService.getUserId()}).then(function (res) {
		//	console.log("added tags");
		//}, function (res) {
		//	console.log("failed to add tags");
		//});

		var task = {
			title: $scope.title,
			desc: $scope.desc,
			frequency: $scope.freq,
			start_date: $scope.start,
			repetitions: $scope.reps,
			read_only: $scope.read_only
		};
		//var user = authService.getUserId();
		$http.post('/tasks', {user_id: authService.getUserId(), task: task}).then(function (res) {
			$scope.success = "Successfully inserted task.";
			var temp = res.data;
			temp.pCreate = moment(temp.created_on).format(prettyDate);
			temp.fCreate = moment(temp.created_on).format(fullDate);

			temp.pUpdate = moment(temp.updated_on).format(prettyDate);
			temp.fUpdate = moment(temp.updated_on).format(fullDate);

			temp.pStart = moment(temp.start_date).format(prettyDate);
			temp.fStart = moment(temp.start_date).format(fullDate);

			if(temp.end_date) {
				temp.pEnd = moment(temp.end_date).format(prettyDate);
				temp.fEnd = moment(temp.end_date).format(fullDate);
			}
			$scope.tasks.push(temp);
			$timeout(function () {
				$scope.success = "";
			}, 3000);
		}, function (res) {
			//console.log(res.responseText);
			$scope.error = res.responseText;
		});
	};

	$scope.updateReadOnly = function ($index, task_id, status, title) {
		$http.put('/tasks/read_only', {user_id: authService.getUserId(), task_id: task_id, read_only: status}).then(function (res) {
			// flash success message to user, then remove after 3 seconds
			$scope.success = "Successfully updated '"+ title +"' read only status to "+ status;
			$timeout(function () {
				$scope.success = "";
			}, 3000);

		}, function (res) {
			$scope.error = "Failed to update '"+ title +"' read only status to "+ status;
			$timeout(function () {
				$scope.error = "";
			}, 3000);
			$scope.tasks[$index].read_only = !status;
		});
	};

	$scope.endTask = function ($index, task_id, title) {
		$http.put('/tasks/end', {user_id: authService.getUserId(), task_id: task_id}).then(function (res) {
			$scope.tasks[$index].pEnd = moment(res.data).format(prettyDate);
			$scope.tasks[$index].fEnd = moment(res.data).format(fullDate);
			// flash success message to user, then remove after 3 seconds
			$scope.success = "Successfully ended "+ title;
			$timeout(function () {
				$scope.success = "";
			}, 3000);

		}, function (res) {
			//console.log("failed", !status, "index", $index);
			//$event.target.attr("checked", !status);
			//$scope.tasks[$index].read_only = !status;
			$scope.error = "Failed to end "+ title;
			$timeout(function () {
				$scope.error = "";
			}, 3000);
		});
	};
}]);

app.controller('noteCtrl', ['$scope', '$rootScope', 'authService', '$http', '$timeout', function($scope, $rootScope, authService, $http, $timeout){
	$scope.status = false;
	$scope.header = "Notes";
	$rootScope.user = authService.getUser();
	var prettyDate = "MM/DD/YYYY";
	var fullDate = "MM/DD/YYYY h:mm:ss a";

	$scope.show = function () {
		//console.log("user_id", authService.getUserId());
		$http.get('/notes', {params: {user_id: authService.getUserId()}}).then(function (res) {
			console.log("res data: ", res.data);
			//console.log("response", res);
			if(Array.isArray(res.data) && typeof res.data !== "string") {
				$scope.error = "";
				$scope.status = false;
				$scope.notes = res.data;
				$scope.notes.forEach(function (v, i, a) {
					// for each of the dates in an object, creating a pretty format (shrunk to date only) and full (with time)
					a[i].pCreate = moment(a[i].created_on).format(prettyDate);
					a[i].fCreate = moment(a[i].created_on).format(fullDate);

					a[i].pUpdate = moment(a[i].updated_on).format(prettyDate);
					a[i].fUpdate = moment(a[i].updated_on).format(fullDate);
				});
				//console.log("updated", $scope.tasks);
			}else if(typeof res.data === "string") {
				// show error message if don't receive an array back
				//console.log("logging data", res.data);

				if(res.data == "No notes created.") {
					$scope.status = res.data;
				}else {
					$scope.error = res.data;
				}

				//console.log("end note.show -> get");
			}
		});
		//console.log("End note.show");
	};
	if(authService.isAuthed()) {
		$scope.message = "Here are your Notes!";
		$scope.show();

	}else {
		$rootScope.user = { };
		$scope.error = "You are not authorized to view this page";
		$interval(function () {
			$location.path('/');
		}, 3000);
	}


	$scope.addNote = function () {
		var note = {
			title: $scope.title,
			text: $scope.text,
			tag: $scope.tagsArray,
			read_only: $scope.read_only,
			task: $scope.task
		};
		$http.post('/notes', {user_id: authService.getUserId(), note: note}).then(function (res) {
			$scope.success = "Successfully added note.";
			$timeout(function () {
				$scope.success = "";
			}, 3000);
			var temp = res.data;
			temp.pCreate = moment(res.data.created_on).format(prettyDate);
			temp.fCreate = moment(res.data.created_on).format(fullDate);
			temp.pUpdate = moment(res.data.updated_on).format(prettyDate);
			temp.fUpdate = moment(res.data.updated_on).format(fullDate);

			console.log("Post notes push", res.data);
			$scope.notes.push(res.data);
		}, function (res) {
			//console.log(res.responseText);
			$scope.error = res.responseText;
			$timeout(function () {
				$scope.error = "";
			}, 3000);
		});
	};
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
		//console.log(val, $scope.data);
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

app.directive('autoComplete',['$http', 'authService',function($http, authService){
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
				if(scope.searchText.length > 2) {
					console.log("Search ", scope.searchText);
					//$http.get(attrs.url, {params: {term: scope.searchText}}).success(function(data){
					//$http.get(attrs.url+'?term='+scope.searchText).success(function(data){
					$http({
						method: 'GET',
						url: attrs.url,
						params: {user_id: authService.getUserId(), term: scope.searchText}
					}).then( function (data) {
						var res = data.data;
						console.log("tags", data, data.data);
						if(res.indexOf(scope.searchText)===-1){
							res.unshift(scope.searchText);
						}
						scope.suggestions=res;
						scope.selectedIndex=-1;
					});
				}
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
				if(val !== -1) {
					scope.searchText = scope.suggestions[scope.selectedIndex];
				}
			});
		}
	}
}]);