app.controller('NavCtrl', [
	'$scope',
	'auth',
	function ($scope, auth) {

		$scope.isLoggedIn = auth.isLoggedIn;
		$scope.hasRole = auth.hasRole;
		$scope.currentUser = auth.currentUser;
		$scope.logOut = auth.logOut;

	}
]);