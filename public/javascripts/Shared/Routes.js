app.config([
	'$stateProvider',
	'$urlRouterProvider',
	function ($stateProvider, $urlRouterProvider) {
		$urlRouterProvider.otherwise('home');

		$stateProvider
			.state('home', {
				url: '/home',
				templateUrl: '/javascripts/Home/_home.html',
				controller: 'HomeCtrl',
				resolve: {
					setupPromise: ['setup', function (setup) {
						return setup.get();
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
				templateUrl: '/javascripts/Setup/_setup.html',
				controller: 'SetupCtrl',
				resolve: {
					setupPromise: ['setup', function (setup) {
						return setup.get();
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
			})
			.state('login', {
				url: '/login',
				templateUrl: '/javascripts/Auth/_login.html',
				controller: 'AuthCtrl',
				resolve: {
					setupPromise: ['setup', function (setup) {
						return setup.get();
					}]
				},
				onEnter: [
					'$state',
					'auth',
					'setup',
					function ($state, auth, setup) {
						if (!setup.exists()) {
							$state.go('setup');
						}
						if (auth.isLoggedIn()) {
							$state.go('home');
						}
					}]
			})
			.state('register', {
				url: '/register',
				templateUrl: '/javascripts/Auth/_register.html',
				controller: 'AuthCtrl',
				resolve: {
					setupPromise: ['setup', function (setup) {
						return setup.get();
					}]
				},
				onEnter: [
					'$state',
					'auth',
					'setup',
					function ($state, auth, setup) {
						if (!setup.exists()) {
							$state.go('setup');
						}
						if (auth.isLoggedIn()) {
							$state.go('home');
						}
					}]
			});
	}]);