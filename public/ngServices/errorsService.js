/*-----------------------------------------------------------------------------
 Resource service to be used by AngularJS controllers to make calls to /errors
 http API
 ----------------------------------------------------------------------------*/
angular.module('ninesWeb')
    .factory('Errors', ['$resource', function($resource) {
        return $resource('http://localhost:3000/errors/:id', null, {
            // Need to specify isArray=false on query action to signal that
            // response should be returned as an object, not an array
            'query': { method: 'GET', isArray: false },
            'update': { 'method': 'PUT' }
            }
        );
    }])
    // Service to get the status codes resulting from request errors
    .factory('StatusCodes', ['$resource', function($resource) {
        return $resource('http://localhost:3000/errors/codes/:id', null, {
            'update': { 'method': 'PUT' }
        });
    }])
    // Service to get the error count for a given error status code
    .factory('ErrorCount', ['$resource', function($resource) {
        return $resource('http://localhost:3000/errors/:statusCode/count', null, {
            'query': { method: 'GET', isArray: true },
            'update': { 'method': 'PUT' }
        });
    }])
    // Service to get HTML of resulting pages from request errors for a given
    // status code
    .factory('ErrorFiles', ['$resource', function($resource) {
        return $resource('http://localhost:3000/errors/:statusCode/files', null, {
            'query': { method: 'GET', isArray: true },
            'update': { 'method': 'PUT' }
        });
    }]);
