/**
 * Created by mattlam on 11/30/15.
 */
/*---------------------------------------------------------------------------
 Main httping Controller
 ----------------------------------------------------------------------------*/
angular.module('ninesWeb')
.controller('ninesWebCtrl', ['$scope', '$routeParams', 'Urls', 'Errors',
        'StatusCodes', 'ErrorCount',
        function($scope, $routeParams, Urls, Errors, StatusCodes, ErrorCount) {

        /*-----------------------------------------------------------------------
         Initialize $scope variables
         ------------------------------------------------------------------------*/
        $scope.urls = Urls.query();
        $scope.errors = Errors.query();
        $scope.statusCodes = StatusCodes.query();



        // +++++ DEBUG CODE START +++++
        console.log('++Parameter: ', $routeParams.id);
        console.log('++Status Codes: ', $scope.statusCodes)
        // +++++ DEBUG CODE END +++++++

        if ($routeParams.id) {
            $scope.statusCode = $routeParams.id;
            $scope.count = ErrorCount.query({ statusCode: $routeParams.id });

            // +++++ DEBUG CODE START +++++
            console.log('++Status Code: ', $scope.statusCode);
            console.log('++Error Count: ', $scope.count);
            // +++++ DEBUG CODE END +++++++

        }

        /*-------------------------------------------------------------------------
         Event Handlers
         ------------------------------------------------------------------------*/

    }
]);
