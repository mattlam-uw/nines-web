/*-----------------------------------------------------------------------------
 Routing for Links views depending on requested URL
 ----------------------------------------------------------------------------*/
angular.module('ninesWeb').config(function($routeProvider) {
    // For non-specified URL, render httpingMain.html
    $routeProvider.when('/', {
        templateUrl: 'ngViews/ninesWebMain.html',
        controller: 'ninesWebCtrl'
    }, true);

    // When specifying a status code (e.g. 404) then render errorInstances.html
    $routeProvider.when('/:id', {
        templateUrl: 'ngViews/ninesWebErrors.html',
        controller: 'ninesWebCtrl'
    }, true);

    // For any other URL, render httpingMain.html
    $routeProvider.otherwise({
        redirectTo: '/'
    });
});
