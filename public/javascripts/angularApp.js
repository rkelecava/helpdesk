var app = angular.module('helpdesk', ['ui.router']);

app.factory('setup', [
	'$http',
	'$window',
	'$state',
	'$stateParams',
	function ($http, $window, $state, $stateParams) {
		var o = {
			setup: []
		};

		o.create = function (setup) {
			return $http.post('/setup', setup)
				.success(function (data) {
					o.getSetup();
				});
		};

		o.getSetup = function () {
			return $http.get('/setup/main')
				.success(function (data) {
					angular.copy(data, o.setup);
			});

		};

		o.exists = function () {
			return o.setup.isComplete;
		};

		return o;
	}
]);

app.config([
	'$stateProvider',
	'$urlRouterProvider',
	function ($stateProvider, $urlRouterProvider) {
		$urlRouterProvider.otherwise('home');

		$stateProvider
			.state('home', {
				url: '/home',
				templateUrl: '_home.html',
				controller: 'HomeCtrl',
				resolve: {
					setupPromise: ['setup', function (setup) {
						return setup.getSetup();
					}]
				},
				onEnter: [
					'$state',
					'setup',
					function ($state, setup) {
						if (!setup.exists()) {
							$state.go('setup');
						}
					}]
			})
			.state('setup', {
				url: '/setup',
				templateUrl: '_setup.html',
				controller: 'SetupCtrl',
				resolve: {
					setupPromise: ['setup', function (setup) {
						return setup.getSetup();
					}]
				},
				onEnter: [
					'$state',
					'setup',
					function ($state, setup) {
						if (setup.exists()) {
							$state.go('home');
						}
					}]
			});
	}
]);


app.controller('HomeCtrl', ['$scope', 'setup', function ($scope, setup) {
	$scope.setup = setup.setup;
}]);

app.controller('SetupCtrl', ['$scope', '$state', 'setup', function ($scope, $state, setup) {
	$scope.setup = setup.setup;

	$scope.completeSetup = function () {
		if (!$scope.password || $scope.password === '') { return; }
		if (!$scope.smtpPw || $scope.smtpPw === '') { return; }
		if ($scope.password != $scope.passwordConfirm) { return; }
		if ($scope.smtpPw != $scope.smtpPwConfirm) { return; }

		setup.create({
			username: $scope.username,
			password: $scope.password,
			first: $scope.first,
			last: $scope.last,
			email: $scope.email,
			jobTitle: $scope.jobTitle,
			phoneNumber: $scope.phoneNumber,
			phoneExt: $scope.phoneExt,
			companyName: $scope.companyName,
			smtpServer: $scope.smtpServer,
			smtpUser: $scope.smtpUser,
			smtpPw: $scope.smtpPw
		});

		$scope.username = '';
		$scope.password = '';
		$scope.passwordConfirm = '';
		$scope.first = '';
		$scope.last = '';
		$scope.email = '';
		$scope.jobTitle = '';
		$scope.phoneNumber = '';
		$scope.phoneExt = '';
		$scope.companyName = '';
		$scope.smtpServer = '';
		$scope.smtpUser = '';
		$scope.smtpPw = '';
		$scope.smtpPwConfirm = '';

		$state.go('home');

	};
}]);