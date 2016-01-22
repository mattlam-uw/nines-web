angular.module('ninesWeb')
.controller('uiMainUrlGroupsCtrl', ['$scope', 'UrlGroups',
    function($scope, UrlGroups) {

        /*---------------------------------------------------------------------
         Initialize $scope variables
         --------------------------------------------------------------------*/

        // Hide form to add new URL Group by default
        $scope.showFormAddUrlGroup = false;
        // Provide feedback for Add-URL-Group Form
        $scope.addUrlGroupFormMessage = "";
        // Object bound to Add URL Group form for conveying form data
        $scope.newUrlGroup = {};

        /*--------------------------------------------------------------------
        Handlers for Add-New-URL-Group
        ---------------------------------------------------------------------*/

        /*-- Show the add-new-URL-Group Form --------------------------------*/
        $scope.showAddUrlGroupForm = function() {
            if (!$scope.showFormAddUrlGroup) {
                $scope.showFormAddUrlGroup = true
            } else {
                $scope.hideAddUrlGroupForm();
            }
        };

        /*-- Hide the add-new-URL-Group Form --------------------------------*/
        $scope.hideAddUrlGroupForm = function() {
            $scope.showFormAddUrlGroup = false;
            $scope.addUrlGroupFormMessage = "";
            $scope.showFormAddUrl = false;
            $scope.newUrlGroup.name = null;
        }

        /*-- Add a new URL Group --------------------------------------------*/
        $scope.addUrlGroup = function(newUrlGroup) {
            // Take no action if the name field has no data
            if (!newUrlGroup.name) {
                $scope.addUrlGroupFormMessage = "Please provide a group name"
                return;
            }

            // Initialize the Response and Error Total properties
            newUrlGroup.responses = { 200: 0 };

            // Add the new URL Group to the UrlGroups model
            var addUrlGroup = new UrlGroups(newUrlGroup);
            addUrlGroup.$save(function() {
                // Update the local model with the new URL Group
                $scope.urlgroups.push(addUrlGroup);
                // Clear out the form fields and hid the Add URL Group form
                $scope.hideAddUrlGroupForm();
            })
        }
    }
]);
