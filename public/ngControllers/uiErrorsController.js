/**
 * Created by mattlam on 3/7/2016.
 *
 * Main controller for Error view
 */
angular.module('ninesWeb')
.controller('uiErrorsCtrl', ['$scope', '$routeParams', '$sce',
    'ErrorsByUrlGroup', 'SharedFuncs', 'ErrorResponseHtmlUrl',
    function($scope, $routeParams, $sce, ErrorsByUrlGroup, SharedFuncs,
             ErrorResponseHtmlUrl) {

        // Retrieve all errors associated with the given URL Group ID
        $scope.errors = ErrorsByUrlGroup.query({ id: $routeParams.id });
        // Indicate the error for which user is viewing details
        $scope.currentErrorId = null;

        // Retrieve HTML page for follow-up full request to instance of error
        // on header request
        $scope.setCurrentError = function(error) {
            // Show details only for error selected
            $scope.currentErrorId = error._id;
            // Build URL to be used to get full request response HTML and
            // make available to view
            var errorResponseUrl = ErrorResponseHtmlUrl
                + error._id;
            $scope.currentErrorResponseUrl =
                $sce.trustAsResourceUrl(errorResponseUrl);
        };

        // Hide (close) the detail view for any/all errors
        $scope.clearCurrentError = function() {
            $scope.currentErrorId = null;
        };

        // Provide to view the month, day, and year elements of error date-time
        $scope.getErrorDate = function(dateTime) {
            // Verify that a value was passed to dateTime parameter
            if (dateTime) {
                // Pass dateTime value to parsing method shared across
                // this module for formatting and providing easy access to
                // date-time elements
                parsedDate = SharedFuncs.parseDateObj(dateTime);

                // Format a date string to pass back to view
                return parsedDate.month + '/' +
                    parsedDate.day + '/' +
                    parsedDate.year;
            } else {
            // If no value was passed to dateTime parameter, provide message
                return "No date data available.";
            }
        };

        // Provide to view the hour and minute elements of the error date-time
        $scope.getErrorTime = function(dateTime) {
            // Verify that a value was passed to dateTime parameter
            if (dateTime) {
                // Pass dateTime value to parsing method shared across
                // this module for formatting and providing easy access to
                // date-time elements
                parsedDate = SharedFuncs.parseDateObj(dateTime);

                // Format a time string to pass back to view
                return parsedDate.hours + ':' + parsedDate.minutes;
            } else {
                // If no value was passed to dateTime parameter, provide message
                return "No time data available.";
            }
        }
    }
]);
