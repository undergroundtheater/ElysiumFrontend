angular.module('admin.services.users', ['ngResource', 'configuration.authorization']).
factory('userRepository', ['$resource', '$http', function($resource, $http) {
	return {
		url: '/admin/users',
		getUsers: function() {
			return $resource(this.url, {}).query().$promise;
		},
		getUsersWithRole: function(role) {
			return $resource(this.url + '/role/' + role, {}).query().$promise;
		},
		getUserWithId: function(id) {
			return $resource(this.url + '/' + id).get().$promise;
		},
		updateUser: function(user) {
			var action = { 'put': { method:'PUT' } };
			return $resource(this.url + '/:id' , null, action).put({id: user.id}, user).$promise;
		}
	};
}]);