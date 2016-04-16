/**
 * Created by mattlam on 4/15/2016.
 */
angular.module('ninesWeb')
.controller('uiLoginCtrl', ['$scope', '$route',
    function($scope, $route) {

        $scope.User = null;
        $scope.loginFormMessage = false;
    }
]);