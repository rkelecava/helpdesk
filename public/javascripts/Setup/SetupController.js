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