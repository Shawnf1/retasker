var app = angular.module('taskApp', ['ngRoute', 'ui.bootstrap']);

var prettyDate = "MM/DD/YYYY";
var fullDate = "MM/DD/YYYY h:mm:ss a";

function formatDates (date) {
	return {
		full: moment(date).format(fullDate),
		pretty: moment(date).format(prettyDate)
	};
}

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
	var prettyDate = "MM/DD/YYYY";
	$scope.taskStatus = false;
	//$scope.status = false;
	//$scope.selected.status = false;
	$scope.sortOptions = [{value:"title", text: "Title"}, {value: "frequency", text: "Frequency"}, {value: "start_date", text: "Started"}];
	if(authService.isAuthed()) {
		$scope.message = "Welcome Home!";
		$http.get('/tasks', {params: {user_id: authService.getUserId()}}).then(function (res) {
			//console.log("res data: ", res.data);
			$scope.header = "Tasks";
			if(Array.isArray(res.data) && typeof res.data !== "string") {
				$scope.error = "";
				$scope.taskStatus = false;
				$scope.tasks = res.data;
				$scope.tasks.forEach(function (v, i, a) {
					// for each of the dates in an object, creating a pretty format (shrunk to date only) and full (with time)

					a[i].pStart = formatDates(a[i].start_date).pretty;

				});
			} else if(typeof res.data === "string") {
				if(res.data == "No tasks created.") {
					$scope.taskStatus = res.data;
				}else {
					$scope.error = res.data;
				}
			}
			//console.log("updated", $scope.tasks);
		});
	}else {
		$rootScope.user = { };
		$scope.error = "You are not authorized to view this page";
		$interval(function () {
			$location.path('/');
		}, 3000);
	}

	$scope.showTask = function (task, event) {
		var $elem = $(event.target);
		// hide additional info if select same task
		if($elem.parent().hasClass('selected')) {
			$elem.parent().removeClass('selected');
			$scope.selected = false;
		}else {
			// else switch selected row, load info
			$('#tasks .selected').removeClass('selected');

			$elem.parent().addClass("selected");
			var temp = task;

			//temp.fCreate = moment(temp.created_on).format(fullDate);
			temp.fCreate = formatDates(temp.created_on).full;

			//temp.fUpdate = moment(temp.updated_on).format(fullDate);
			temp.fUpdate = formatDates(temp.updated_on).full;

			//temp.fStart = moment(temp.start_date).format(fullDate);
			temp.fStart = formatDates(temp.start_date).full;

			if(temp.end_date) {
				//temp.fEnd = moment(temp.end_date).format(fullDate);
				temp.fEnd = formatDates(temp.end_date).full;
			}
			//console.log("temp", temp);
			//$scope.selected.status = true;
			$scope.selected = temp;
			$scope.loadNotes(temp._id);
			//console.log("Clicked row", $scope.selected);
		}
	};

	$scope.loadNotes = function (task_id) {
		$http.get('/notes', {params: {user_id: authService.getUserId(), task_id: task_id}}).then(function (res) {
			//console.log("res data: ", res.data);
			//console.log("response", res);
			//console.log($scope.selected.status);
			$scope.notes = [];
			if(Array.isArray(res.data) && typeof res.data !== "string") {
				$scope.error = "";
				//$scope.status = false;
				var temp = res.data;
				temp.forEach(function (v, i, a) {
					// for each of the dates in an object, creating a pretty format (shrunk to date only) and full (with time)
					var tempDate = formatDates(v.created_on);
					a[i].pCreate = tempDate.pretty;
					a[i].fCreate = tempDate.full;
					if(v.sticky) {
						v.pIteration = "-";
						v.fIteration = "No date for sticky items!";
					}else {
						tempDate = formatDates(v.iteration);
						a[i].pIteration = temp.pretty;
						a[i].fIteration = temp.pretty;
					}
				});
				$scope.selected.Notestatus = true;
				$scope.notes = temp;
				//console.log("Notes", temp.length, temp);
				//console.log("updated", $scope.tasks);
			}else if(typeof res.data === "string") {
				// show error message if don't receive an array back
				//console.log("logging data", res.data);
				$scope.selected.Notestatus = false;
				if(res.data == "No notes created.") {
					//$scope.selected.status = true;
					//$scope.selected.noteStatus = false;
					$scope.selected.length = res.data;
				}else {
					//$scope.selected.Notestatus = false;
					$scope.error = res.data;
				}
				//console.log("end note.show -> get");
			}
		}, function (res) {
			$scope.selected.status = false;
		});
	};
	$scope.$watch('taskSort', function (newValue, oldValue) {
		$scope.taskOrder = newValue.value;
	});
}]);

app.controller('taskCtrl', ['$scope', '$rootScope', 'authService', '$http', '$timeout', function($scope, $rootScope, authService, $http, $timeout){
	$scope.status = false;
	$rootScope.user = authService.getUser();
	$scope.freq = "";
	$scope.reps = "";
	$scope.freqOptions =
		[
			{
				text: "Select Frequency"
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
			},
			{
				value: "infreq",
				text: "Infrequently"
			}
		];

	$scope.repOptions =
		[
			{
				text: "Select Repetitions"
			},
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
	$duration = $('#duration');
	$scope.$watch('reps', function (newValue, oldValue) {
		//console.log('watch fired, new value: ', newValue);
		switch(newValue.value) {
			case "indef":
				$duration.attr({
					disabled: true,
					placeholder: 'Indefinite...',
					type: 'text'});
				break;
			case "times":
				$duration.attr({
					disabled: false,
					placeholder: 'Number',
					type: 'number',
					min: 1});

				break;
			case "date":
				$duration.attr({
					disabled: false,
					placeholder: 'End Date (MM/DD/YYYY)',
					type: 'text'});
				break;
		}
	});

	$scope.addTask = function () {
		var task = {
			title: $scope.title,
			desc: $scope.desc,
			frequency: $scope.freq.text,
			//frequency: $scope.freqOptions[$scope.freq.indexOf].text,
			//frequency: $scope.freqOptions[$scope.model.freq.indexOf].text,
			//frequency: $scope.freqOptions[$scope.freqOptions.indexOf( $scope.freq )].text,
			start_date: $scope.start,
			repetitions: $scope.reps.text,
			duration: $scope.duration,
			read_only: ($scope.read_only) ? true : false
		};
	// commented out while testing
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
			$scope.error = res.responseText;
		});
	};

	$scope.updateReadOnly = function (index, task_id, status, title) {
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
			$scope.tasks[index].read_only = !status;
		});
	};

	$scope.endTask = function (index, task_id, title) {
		$http.put('/tasks/end', {user_id: authService.getUserId(), task_id: task_id}).then(function (res) {
			$scope.tasks[index].pEnd = moment(res.data).format(prettyDate);
			$scope.tasks[index].fEnd = moment(res.data).format(fullDate);
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

	$scope.show = function () {
		//console.log("user_id", authService.getUserId());
		$http.get('/notes', {params: {user_id: authService.getUserId()}}).then(function (res) {
			//console.log("res data: ", res.data);
			//console.log("response", res);
			if(Array.isArray(res.data) && typeof res.data !== "string") {
				$scope.error = "";
				$scope.status = false;
				$scope.notes = res.data;
				$scope.notes.forEach(function (v, i, a) {
					// for each of the dates in an object, creating a pretty format (shrunk to date only) and full (with time)
					v.pCreate = moment(v.created_on).format(prettyDate);
					v.fCreate = moment(v.created_on).format(fullDate);

					if(v.sticky) {
						v.pIteration = "-";
						v.fIteration = "No date for sticky items!";
					}else {
						v.pIteration = moment(v.iteration).format(prettyDate);
						v.fIteration = moment(v.iteration).format(fullDate);
					}
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
		// get tasks into select box
		$http.get('/tasks', {params: {user_id: authService.getUserId()}}).then(function (res) {
			var $tasks = $('#tasks');
			$scope.taskOptions = [ { text: "Select a task (opt)" }];
			// if returned array of tasks
			if(Array.isArray(res.data) && typeof res.data !== "string") {
				res.data.forEach(function (v, i, a) {
					$scope.taskOptions.push({ value: v._id, text: v.title});
				});
				//$scope.tasOptions.push(res.)
			}else {
				$tasks.prop('disabled', true);
			}
			//console.log("tasks", $scope.taskOptions);
		});
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
			read_only: $('#read_only').is(':checked'),
			task_link: $scope.tasks.value,
			iteration: $scope.date,
			sticky: ($scope.sticky) ? true : false
		};
		//console.log($scope.read_only);
		$http.post('/notes', {user_id: authService.getUserId(), note: note}).then(function (res) {
			$scope.success = "Successfully added note.";
			$timeout(function () {
				$scope.success = "";
			}, 3000);
			var temp = res.data;
			temp.pCreate = moment(res.data.created_on).format(prettyDate);
			temp.fCreate = moment(res.data.created_on).format(fullDate);
			if(temp.sticky) {
				temp.pIteration = "-";
				temp.fIteration = "No date for sticky items!";
			}else {
				temp.pIteration = moment(temp.iteration).format(prettyDate);
				temp.fIteration = moment(temp.iteration).format(fullDate);
			}

			//console.log("Post notes push", res.data);
			$scope.notes.push(res.data);
		}, function (res) {
			//console.log(res.responseText);
			$scope.error = res.responseText;
			$timeout(function () {
				$scope.error = "";
			}, 3000);
		});
	};

	$scope.updateReadOnly = function (index, note_id, status, title) {
		$http.put('/notes/read_only', {user_id: authService.getUserId(), note_id: note_id, read_only: status}).then(function (res) {
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
			$scope.notes[index].read_only = !status;
		});
	};

	$scope.deleteNote = function(index, note_id, title) {
		$http({
			url: '/notes',
			method: 'DELETE',
			data: {
				user_id: authService.getUserId(),
				note_id: note_id
			},
			headers: {"Content-Type": "application/json;charset=utf-8"}
		}).then(function (res) {
			$scope.notes.splice(index, 1);
			// flash success message to user, then remove after 3 seconds
			$scope.success = "Successfully deleted "+ title;
			$timeout(function () {
				$scope.success = "";
			}, 3000);

		}, function (res) {
			// flash fail message, remove after 3 seconds
			$scope.error = "Failed to delete "+ title;
			$timeout(function () {
				$scope.error = "";
			}, 3000);
		})
	};

	var $date = $('#date');
	var $readOnly = $('#read_only');
	$scope.$watch('sticky', function (newValue, oldValue) {
		// if checked, disable iteration date
		if(newValue) {
			$date.attr("disabled", true);
			$readOnly.prop("checked", true);
		}else {
			$date.attr("disabled", false);
			$readOnly.prop("checked", true);
		}
	});
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