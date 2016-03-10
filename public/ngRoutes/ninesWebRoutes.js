/*-----------------------------------------------------------------------------
 Routing for Links views depending on requested URL
 ----------------------------------------------------------------------------*/
angular.module('ninesWeb').config(function($routeProvider) {
    // For non-specified URL, render httpingMain.html
    $routeProvider.when('/', {
        templateUrl: 'ngViews/ninesWebMain.html',
        controller: 'uiMainCtrl'
    }, true);

    // When specifying a status code (e.g. 404) then render errorInstances.html
    $routeProvider.when('/:id', {
        templateUrl: 'ngViews/ninesWebErrors.html',
        controller: 'uiMainCtrl'
    }, true);

    // /errors route to show all error responses for a particular URL Group
    $routeProvider.when('/errors/urlgroup/:id', {
        templateUrl: 'ngViews/ninesWebErrors.html',
        controller: 'uiMainCtrl'
    }, true);

    // For any other URL, render httpingMain.html
    $routeProvider.otherwise({
        redirectTo: '/'
    });
});
