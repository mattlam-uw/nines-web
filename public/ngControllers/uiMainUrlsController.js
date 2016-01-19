angular.module('ninesWeb')
.controller('uiMainUrlsCtrl', ['$scope', 'Urls', 'UrlGroupUrls',
    function($scope, Urls, UrlGroupUrls) {

        /*---------------------------------------------------------------------
         Initialize $scope variables
         --------------------------------------------------------------------*/

        // Hide form to add new URL by default
        $scope.showFormAddUrl = false;
        // Provide feedback for add URL form
        $scope.addUrlFormMessage = "";
        // Object bound to Add-URL-Form for conveying form data
        $scope.newUrl = {};
        // Set protocol to "http" by default
        $scope.newUrl.protocol = "http";

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

        /*-- Add a new URL --------------------------------------------------*/
        $scope.addUrl = function(newUrl, urlGroupId) {
            // Take no action if no data in either 'name' or the 'host' fields
            if (!newUrl.name || !newUrl.host) {
                $scope.addUrlFormMessage = "Please provide values for both "
                    + "URL Name and URL Host";
                return;
            }

            // Clean up and format data to get ready for adding to model

            // Remove trailing slash from the Host value if it exists
            newUrl.host = removeAllTrailingSlashes(newUrl.host.trim());

            // If a path value was provided, then add a leading slash if needed
            // If no path value was provided, then set path to empty string
            if (angular.isDefined(newUrl.path)) {
                newUrl.path = newUrl.path.trim();
                if (!newUrl.path.startsWith('/')) {
                    newUrl.path = '/' + newUrl.path;
                }
            } else {
                newUrl.path = "";
            }

            // Add the new URL to the Urls model
            // Also add a new relationship between the URL Group and the new URL
            var addUrl = new Urls(newUrl);
            addUrl.$save(function(urlResData) {
                // Update the local model with the new URL
                $scope.urls.push(addUrl);
                // Clear out the form fields and hide the Add URL form
                $scope.hideAddUrlForm();

                // Add a new relationship between URL and URL Group
                var newUrlGroupUrl = {
                    urlgroup_id: urlGroupId,
                    url_id: urlResData._id
                }
                var addUrlGroupUrl = new UrlGroupUrls(newUrlGroupUrl);
                addUrlGroupUrl.$save(function() {
                    $scope.urlgroupurls.push(addUrlGroupUrl);
                });
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