app.factory('auth', [
	'$http',
	'$window',
	'$state',
	'$stateParams',
	function ($http, $window, $state, $stateParams) {
		var auth = {
			roles: [],
			users: [],
			message: []
		};

		auth.saveToken = function (token) {
			$window.localStorage['helpdesk-token'] = token;
		};

		auth.getToken = function () {
			return $window.localStorage['helpdesk-token'];
		};

		auth.isLoggedIn = function () {
			var token = auth.getToken();

			if (token) {
				var payload = JSON.parse($window.atob(token.split('.')[1]));

				return payload.exp > Date.now() / 1000;
			} else {
				return false;
			}
		};

		auth.hasRole = function (role) {
			for (var i=0; i<auth.roles.length; i++) {
				if (role == 'user') {
					if (auth.roles[i] == role || auth.roles[i] == 'admin') {
						return true;
					}
				} else {
					if (auth.roles[i] == role) {
						return true;
					}
				}

			}

			return false;
		};

		auth.getAllUsers = function () {
			if (auth.isLoggedIn && auth.hasRole('admin')) {
				return $http.get('/users')
					.success(function (data) {
					angular.copy(data, auth.users);
				});
			}
		};

		auth.currentUser = function () {
			if (auth.isLoggedIn()) {
				var token = auth.getToken();
				var payload = JSON.parse($window.atob(token.split('.')[1]));

				angular.copy(payload.roles, auth.roles);

				return payload.username;
			}
		};

		auth.getRoles = function () {
			if (auth.isLoggedIn()) {
				var token = auth.getToken();
				var payload = JSON.parse($window.atob(token.split('.')[1]));

				return $http.get('/users/' + payload._id + '/roles')
					.success(function (data) {
						angular.copy(data, auth.roles);
					});
			} else {
				angular.copy([], auth.roles);
			}

		};

		auth.deleteUser = function (id) {
			return $http.delete('/users/' + id)
				.success(function (data) {
					angular.copy(data, auth.message);
					$state.transitionTo($state.current, $stateParams, { reload: true, inherit: false, notify: true });
				});
		};


		auth.logIn = function (user) {
			return $http.post('/users/login', user)
				.success(function (data) {
					auth.saveToken(data.token);
				});
		};

		auth.logOut = function () {
			$window.localStorage.removeItem('helpdesk-token');
			auth.roles = [];
			$state.transitionTo($state.current, $stateParams, { reload: true, inherit: false, notify: true });
		};

		auth.register = function (user) {
			return $http.post('/users/register', user)
				.success(function (data) {
					auth.saveToken(data.token);
				});
		};


		return auth;
	}
]);
