app.controller('AuthCtrl', [
	'$scope',
	'$state',
	'$stateParams',
	'auth',
	'setup',
	function ($scope, $state, $stateParams, auth, setup) {

		$scope.setup = setup.setup;
		$scope.user = {};

		$scope.register = function () {
			if ($scope.user.password != $scope.user.passwordConfirm) { return; }
			auth.register($scope.user)
				.error(function (error) {
					$scope.error = error;
				}).then(function () {
					$state.go('home');
				});
		};

		$scope.logIn = function () {
			auth.logIn($scope.user)
				.error(function (error) {
					$scope.error = error;
				}).then(function () {
					$state.go('home');
				});
		};

	}
]);