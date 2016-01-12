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
            results.sort();
            return results;
        };

        $scope.getCodesAndCountsByUrlID = function(urlID) {
            var results = {};
            var allStatusCodes = $scope.getStatusCodes();
            for (var i = 0; i < allStatusCodes.length; i++) {
                results[allStatusCodes[i]] = 0;
            }
            for (var i = 0; i < $scope.heads.length; i++) {
                if ($scope.heads[i].url_id === urlID) {
                    var statusCode = $scope.heads[i].status_code;
                    results[statusCode] += 1;
                }
            }
            console.log(urlID);
            console.log(results);
            return results;
        };

        $scope.test = function() {
            return "Supergeil!"
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
