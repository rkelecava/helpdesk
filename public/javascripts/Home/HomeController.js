app.controller('HomeCtrl', ['$scope', 'setup', 'auth', function ($scope, setup, auth) {

	$scope.setup = setup.setup;
	$scope.isLoggedIn = auth.isLoggedIn;
	$scope.hasRole = auth.hasRole;
	$scope.currentUser = auth.currentUser;
	$scope.logOut = auth.logOut;

}]);