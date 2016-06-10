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
					o.get();
				});
		};

		o.get = function () {
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