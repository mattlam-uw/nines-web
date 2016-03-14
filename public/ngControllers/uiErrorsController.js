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
            // Verify that a value was passed to dateTime parameter
            if (dateTime) {
                // Pass dateTime value to parsing method shared across
                // this module for formatting and providing easy access to
                // date-time elements
                parsedDate = DateObjParser.parseDate(dateTime);

                // Format a date string to pass back to view
                return parsedDate.month + '/' +
                    parsedDate.day + '/' +
                    parsedDate.year;
            } else {
            // If no value was passed to dateTime parameter, provide message
                return "No date data available.";
            }
        };
        $scope.getErrorTime = function(dateTime) {
            // Verify that a value was passed to dateTime parameter
            if (dateTime) {
                // Pass dateTime value to parsing method shared across
                // this module for formatting and providing easy access to
                // date-time elements
                parsedTime = DateObjParser.parseDate(dateTime);

                // Format a time string to pass back to view
                return parsedDate.hours + ':' + parsedDate.minutes;
            } else {
                // If no value was passed to dateTime parameter, provide message
                return "No time data available.";
            }
        }
    }
]);
