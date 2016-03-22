/**
 * Created by mattlam on 3/7/2016.
 */
angular.module('ninesWeb')
    .factory('Errors', ['$resource', function($resource) {
        return $resource('http://localhost:3000/errors/:id', null, {}
        );
    }])
    .factory('ErrorsByUrlGroup', ['$resource', function($resource) {
    	return $resource(
            'http://localhost:3000/errors/urlgroup/:id',
    		null,
            { 'update': { 'method': 'PUT' } }
    	);
    }]);
