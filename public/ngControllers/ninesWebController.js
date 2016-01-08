/**
 * Created by mattlam on 11/30/15.
 */
/*---------------------------------------------------------------------------
 Main httping Controller
 ----------------------------------------------------------------------------*/
angular.module('ninesWeb')
.controller('ninesWebCtrl', ['$scope', '$routeParams', 'Urls', 'Errors',
        function($scope, $routeParams, Urls, Errors) {

        /*-------------------------------------------------------------------
         Initialize $scope variables
         --------------------------------------------------------------------*/

        $scope.urls = Urls.query();
        $scope.errors = Errors.query();

        /*-------------------------------------------------------------------
         $scope methods for views
        --------------------------------------------------------------------*/

        // Returns object where properties are unique status codes from /errors
        // and value for each property is count of occurrences for status code
        $scope.getStatusCodesAndCounts = function() {
            console.log("CODES AND COUNTS has been called");
            var objCodesAndCounts = {};
            for (var i = 0; i < $scope.errors.length; i++) {
                var statusCode = $scope.errors[i].status_code;
                if (objCodesAndCounts[statusCode] === undefined) {
                    objCodesAndCounts[statusCode] = 1;
                } else {
                    objCodesAndCounts[statusCode] += 1;
                }
            }
            console.log(objCodesAndCounts);
            return objCodesAndCounts;
        }

        // +++++ DEBUG CODE START +++++
        // console.log('++Parameter: ', $routeParams.id);
        // console.log('++Status Codes: ', $scope.statusCodes)
        // +++++ DEBUG CODE END +++++++

//        if ($routeParams.id) {
//            $scope.statusCode = $routeParams.id;
//            $scope.count = ErrorCount.query({ statusCode: $routeParams.id });
//            $scope.files = ErrorFiles.query({ statusCode: $routeParams.id });
//
//            // +++++ DEBUG CODE START +++++
//            console.log('++Status Code: ', $scope.statusCode);
//            console.log('++Error Count: ', $scope.count);
//            console.log('++Error Files: ', $scope.files);
//            // +++++ DEBUG CODE END +++++++

//        }

        /*-------------------------------------------------------------------------
         Event Handlers
         ------------------------------------------------------------------------*/

    }
]);
