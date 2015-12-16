/**
 * Created by mattlam on 11/30/15.
 */
/*---------------------------------------------------------------------------
 Main httping Controller
 ----------------------------------------------------------------------------*/
angular.module('ninesWeb')
.controller('HttpingCtrl', ['$scope', '$routeParams', 'Urls', 'Errors',
        'StatusCodes', 'ErrorCount',
        function($scope, $routeParams, Urls, Errors, StatusCodes, ErrorCount) {

        /*-----------------------------------------------------------------------
         Initialize $scope variables
         ------------------------------------------------------------------------*/
        $scope.urls = Urls.query();
        $scope.errors = Errors.query();


        if ($routeParams.id) {
            $scope.statusCode = $routeParams.id;
            $scope.count = 'blah';
            // $scope.count = ErrorCount.query();
            console.log(count);
        }

        /*-------------------------------------------------------------------------
         Event Handlers
         ------------------------------------------------------------------------*/

    }
]);
