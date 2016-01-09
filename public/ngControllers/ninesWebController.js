/**
 * Created by mattlam on 11/30/15.
 */
/*---------------------------------------------------------------------------
 Main httping Controller
 ----------------------------------------------------------------------------*/
angular.module('ninesWeb')
.controller('ninesWebCtrl', ['$scope', '$routeParams', 'Urls', 'Heads',
        function($scope, $routeParams, Urls, Heads) {

        /*-------------------------------------------------------------------
         Initialize $scope variables
         --------------------------------------------------------------------*/

        $scope.urls = Urls.query();
        $scope.heads = Heads.query();

        $scope.getStatusCodes = function() {
            var results = [];
            var keys = {};
            for (var i = 0; i < $scope.heads.length; i++) {
                var val = $scope.heads[i].status_code;
                if (angular.isUndefined(keys[val])) {
                    keys[val] = true;
                    results.push(val);
                }
            }
            return results;
        };

        $scope.getStatusCodesForURL = function(urlID) {
            var objCodesAndCounts = {};
            for (var i = 0; i < $scope.heads.length; i++) {
                var statusCode = $scope.heads[i].status_code;
                if ($scope.heads[i].url_id === urlID) {
                    if (objCodesAndCounts[statusCode] === undefined) {
                        objCodesAndCounts[statusCode] = 1;
                    } else {
                        objCodesAndCounts[statusCode] += 1;
                    }
                }
            }
            return objCodesAndCounts;
        };

        $scope.getStatusCodesAndCounts = function(urlID) {
            var objCodesAndCounts = {};
            for (var i = 0; i < $scope.heads.length; i++) {
                var statusCode = $scope.heads[i].status_code;
                if ($scope.heads[i].url_id === urlID) {
                    if (objCodesAndCounts[statusCode] === undefined) {
                        objCodesAndCounts[statusCode] = 1;
                    } else {
                        objCodesAndCounts[statusCode] += 1;
                    }
                }
            }
            return objCodesAndCounts;
        };

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
