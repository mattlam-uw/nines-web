/**
 * Created by mattlam on 3/7/2016.
 */
angular.module('ninesWeb')
.controller('uiErrorsCtrl', ['$scope', '$routeParams', 'Urls', 'UrlGroups', 
	'Errors', 'ErrorsByUrlGroup', function($scope, $routeParams, Urls, 
	UrlGroups, Errors, ErrorsByUrlGroup) {

        $scope.errors = ErrorsByUrlGroup({ id: $routeParams.id });
        $scope.currentUrlGroupId = $routeParams.id;

    }
]);
