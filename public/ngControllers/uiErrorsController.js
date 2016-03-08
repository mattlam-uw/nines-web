/**
 * Created by mattlam on 3/7/2016.
 */
angular.module('ninesWeb')
.controller('uiErrorsCtrl', ['$scope', '$routeParams', 'Urls', 'UrlGroups', 'Errors',
    function($scope, $routeParams, Urls, UrlGroups, Errors) {

        $scope.errors = Errors.query();                 // Errors model
        $scope.currentUrlGroupId = $routeParams.id;

    }
]);
