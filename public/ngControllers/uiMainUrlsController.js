angular.module('ninesWeb')
.controller('uiMainUrlsCtrl', ['$scope', 'Urls', 'UrlGroupUrls',
    function($scope, Urls, UrlGroupUrls) {

        /*---------------------------------------------------------------------
         Initialize $scope variables
         --------------------------------------------------------------------*/

        // Hide form to add new URL by default
        $scope.showFormAddUrl = false;
        // Hide URL Group details view by default
        $scope.showDetailsUrlGroup = false;
        // Provide feedback for add URL form
        $scope.addUrlFormMessage = "";
        // Hide the Icons for removing URLS by default
        $scope.showIconsRemoveUrl = "";
        // Object bound to Add-URL-Form for conveying form data
        $scope.newUrl = {};
        // Set protocol to "http" by default
        $scope.newUrl.protocol = "http";

        /*-------------------------------------------------------------------
         Handlers for Showing and Hiding URL Group Details
         --------------------------------------------------------------------*/
        $scope.showUrlGroupDetails = function(groupId) {
            if ($scope.showDetailsUrlGroup !== groupId) {
                $scope.showDetailsUrlGroup = groupId;
            } else {
                $scope.hideUrlGroupDetails();
            }
        }

        $scope.hideUrlGroupDetails = function() {
            $scope.showDetailsUrlGroup = false;
        }

        /*-------------------------------------------------------------------
         Handlers for Add-New-URL Form
         --------------------------------------------------------------------*/

        /*-- Show the add-new-URL Form for given URL Group ------------------*/
        // Hides the form if currently showing
        $scope.showAddUrlForm = function(groupId) {
            if ($scope.showFormAddUrl !== groupId) {
                $scope.showFormAddUrl = groupId;
            } else {
                $scope.hideAddUrlForm();
            }
        };

        /*-- Hide the add-new-URL Form and clear out form fields ------------*/
        $scope.hideAddUrlForm = function() {
            $scope.showFormAddUrl = false;
            $scope.newUrl.name = null;
            $scope.newUrl.host = null;
            $scope.newUrl.path = null;
            $scope.addUrlFormMessage = "";
            $scope.newUrl.protocol = "http";
        };

        /*-- Show the Remove-URL icons given URL Group ----------------------*/
        // Hides the icons if they are currently showing
        $scope.showRemoveUrlIcons = function(groupId) {
            if ($scope.showIconsRemoveUrl !== groupId) {
                $scope.showIconsRemoveUrl = groupId;
            } else {
                $scope.hideRemoveUrlIcons();
            }
        };

        /*-- Hide the Remove-URL icons for given URL Group ------------------*/
        $scope.hideRemoveUrlIcons = function() {
            $scope.showIconsRemoveUrl = false;
        };

        /*-- Add a new URL --------------------------------------------------*/
        $scope.addUrl = function(newUrl, urlGroupId) {
            // Take no action if no data in either 'name' or the 'host' fields
            if (!newUrl.name || !newUrl.host) {
                $scope.addUrlFormMessage = "Please provide values for both "
                    + "URL Name and URL Host";
                return;
            }
            // Clean up and format data to get ready for adding to model:
            // (1) Remove trailing slash from the Host value if it exists
            newUrl.host = removeAllTrailingSlashes(newUrl.host.trim());
            // (2) Make sure the host name is formatted correctly (e.g.
            // abc.def.ghi or abd.def)
            var hostNameRegEx = /^(([a-zA-Z][a-zA-Z0-9\-]*\.)?[a-zA-Z][a-zA-Z0-9\-]*\.[a-zA-Z]+)$/;
            if (!newUrl.host.match(hostNameRegEx)) {
                $scope.addUrlFormMessage = "Make sure your 'URL Host' value is"
                    + " of either of the following formats: 'abc.def.ghi' or"
                    + " 'abc.def'.";
                return;
            }

            // If a path value was provided, then add a leading slash if
            // needed. If no path value provided, then set path empty string
            if (!newUrl.path) {
                newUrl.path = "";
            } else {
                newUrl.path = newUrl.path.trim();
                if (!newUrl.path.startsWith('/')) {
                    newUrl.path = '/' + newUrl.path;
                }
            }

            // Initialize object to store status codes and response counts
            newUrl.responses = { 200: 0 };

            // Add the URL Group ID
            newUrl.urlgroup_id = urlGroupId;

            // Add the new URL to the Urls model
            // Also add a new relationship between the URL Group and the new URL
            var addUrl = new Urls(newUrl);
            addUrl.$save(function(urlResData) {
                // Update the local model with the new URL
                $scope.urls.push(addUrl);
                // Clear out the form fields and hide the Add URL form
                $scope.hideAddUrlForm();
            });
        };

        /*---------------------------------------------------------------------
         Private Utility Functions
         --------------------------------------------------------------------*/

        // Recursive function removes any and all trailing forward slashes
        // from string
        function removeAllTrailingSlashes(input) {
            if (input.endsWith('/')) {
                return removeAllTrailingSlashes(input.substr(0, input.length - 1));
            } else {
                return input;
            }
        }
    }
]);
