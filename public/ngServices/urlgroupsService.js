/*-----------------------------------------------------------------------------
 Resource service to be used by AngularJS controllers to make calls to
 /urlgroups http API
 ----------------------------------------------------------------------------*/
angular.module('ninesWeb')
    .factory('UrlGroups', ['$resource', function($resource) {
        return $resource(
            'http://localhost:3000/urlgroups/:id',
            null,
            { 'update': { 'method': 'PUT' } });
    }]);
