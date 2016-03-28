angular.module('ninesWeb')
.controller('uiMainUrlGroupsCtrl', ['$scope', 'UrlGroups', 'InputFieldSizeMaxes',
    function($scope, UrlGroups, InputFieldSizeMaxes) {

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
            $scope.newUrlGroup.name = null;
        }

        /*-- Add a new URL Group --------------------------------------------*/
        $scope.addUrlGroup = function(newUrlGroup) {
            // Only add if URL Group name has been provided
            if (newUrlGroup.name) {

                // Ensure that new URL Group name is at least 1 character in
                // length and does not exceed the specified limit
                if (newUrlGroup.name.length < 1 ||
                    newUrlGroup.name.length > InputFieldSizeMaxes.urlGroup) {
                    $scope.addUrlGroupFormMessage = "URL Group name must be " +
                        "between 1 and " + InputFieldSizeMaxes.urlGroup +
                        " characters in length.";

                // URL Group name passes validation, so add the new URL Group
                } else {
                    $scope.addUrlGroupFormMessage = "";

                    // Initialize the Response and Error Total properties
                    newUrlGroup.responses = { 200: 0 };

                    // Initialize a Ping Frequency of five minutes:
                    newUrlGroup.ping_frequency = 5;

                    // Determine a new view order number higher than the current
                    // highest view order, increment by one and set for new group
                    var highestViewOrder = -1;
                    for (var i = 0; i < $scope.urlgroups.length; i++) {
                        if ($scope.urlgroups[i].view_order > highestViewOrder) {
                            highestViewOrder = $scope.urlgroups[i].view_order;
                        }
                    }
                    newUrlGroup.view_order = highestViewOrder + 1;

                    // Add the new URL Group to the UrlGroups model
                    var addUrlGroup = new UrlGroups(newUrlGroup);
                    addUrlGroup.$save(function() {
                        // Update the local model with the new URL Group
                        $scope.urlgroups.push(addUrlGroup);
                        // Clear out the form fields and hid the Add URL Group form
                        $scope.hideAddUrlGroupForm();
                    });
                }

            } else {
                $scope.addUrlGroupFormMessage = "Please provide a group name."
                return;
            }
        }
    }
]);
