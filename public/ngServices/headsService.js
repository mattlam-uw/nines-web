/*-----------------------------------------------------------------------------
 Resource service to be used by AngularJS controllers to make calls to /heads
 http API
 ----------------------------------------------------------------------------*/
angular.module('ninesWeb')
    .factory('Heads', ['$resource', function($resource) {
        return $resource('http://localhost:3000/heads/:id', null, {}
        );
    }]);