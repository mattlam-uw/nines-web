/*-----------------------------------------------------------------------------
 Resource service to be used by AngularJS controllers to make calls to
 /urlgroupurls http API
 ----------------------------------------------------------------------------*/
angular.module('ninesWeb')
.factory('UrlGroupUrls', ['$resource', function($resource) {
    return $resource(
        'http://localhost:3000/urlgroupurls/:id',
        null,
        { 'update': { 'method': 'PUT' } });
}]);
