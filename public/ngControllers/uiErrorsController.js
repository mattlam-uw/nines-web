/**
 * Created by mattlam on 3/7/2016.
 */
angular.module('ninesWeb')
.controller('uiErrorsCtrl', ['$scope', '$routeParams', '$sce',
    'ErrorsByUrlGroup', 'DateObjParser',
    function($scope, $routeParams, $sce, ErrorsByUrlGroup, DateObjParser) {

        $scope.errors = ErrorsByUrlGroup.query({ id: $routeParams.id });
        $scope.currentErrorId = null;
        $scope.currentErrorResonseUrl = null;


        $scope.setCurrentError = function(error) {
            $scope.currentErrorId = error._id;
            var errorResponseUrl = "http://localhost:3000/errors/response/"
                + error._id;
            $scope.currentErrorResponseUrl =
                $sce.trustAsResourceUrl(errorResponseUrl);
        };

        $scope.clearCurrentError = function() {
            $scope.currentErrorId = null;
        };

        $scope.getErrorDate = function(dateTime) {
            parsedDate = DateObjParser.parseDate(dateTime);
            return parsedDate.month + '/' +
                   parsedDate.day + '/' +
                   parsedDate.year;
         
        };
        $scope.getErrorTime = function(dateTime) {
            parsedTime = DateObjParser.parseDate(dateTime);
            return parsedDate.hours + ':' + parsedDate.minutes;
        }
    }
]);
