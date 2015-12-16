/*-----------------------------------------------------------------------------
 Routing for Links views depending on requested URL
 ----------------------------------------------------------------------------*/
angular.module('ninesWeb').config(function($routeProvider) {
    // For non-specified URL, render httpingMain.html
    $routeProvider.when('/', {
        templateUrl: 'ngViews/httpingMain.html',
        controller: 'HttpingCtrl'
    }, true);

    // When specifying a status code (e.g. 404) then render errorInstances.html
    $routeProvider.when('/:id', {
        templateUrl: 'ngViews/errorInstances.html',
        controller: 'HttpingCtrl'
    }, true);

    // For any other URL, render httpingMain.html
    $routeProvider.otherwise({
        redirectTo: '/'
    });
});
