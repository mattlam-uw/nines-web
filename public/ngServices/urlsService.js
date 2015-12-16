/*-----------------------------------------------------------------------------
 Resource service to be used by AngularJS controllers to make calls to /urls
 http API
 ----------------------------------------------------------------------------*/
angular.module('ninesWeb')
.factory('Urls', ['$resource', function($resource) {
    return $resource('http://localhost:3000/urls/:id', null, { 'update': { 'method': 'PUT' } });
}]);