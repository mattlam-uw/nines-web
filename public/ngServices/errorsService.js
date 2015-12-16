/*-----------------------------------------------------------------------------
 Resource service to be used by AngularJS controllers to make calls to /errors
 http API
 ----------------------------------------------------------------------------*/
angular.module('ninesWeb')
    .factory('Errors', ['$resource', function($resource) {
        return $resource('/errors/:id', null, {
            // Need to specify isArray=false on query action to signal that
            // response should be returned as an object, not an array
            'query': { method: 'GET', isArray: false },
            'update': { 'method': 'PUT' }
            }
        );
    }])
    .factory('StatusCodes', ['$resource', function($resource) {
        return $resource('/errors/codes/:id', null, {
            'update': { 'method': 'PUT' }
        });
    }])
    .factory('ErrorCount', ['$resource', function($resource) {
        return $resource('/errors/:id/count', null, {
            'update': { 'method': 'PUT' }
        });
    }]);