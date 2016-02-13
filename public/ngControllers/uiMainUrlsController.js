angular.module('ninesWeb')
.controller('uiMainUrlsCtrl', ['$scope', 'Urls', function($scope, Urls) {

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
        $scope.showControlsUpdateUrl = "";
        // Object bound to Add-URL-Form for conveying form data
        $scope.newUrl = {};
        // Set protocol to "http" by default
        $scope.newUrl.protocol = "http";

        /*-------------------------------------------------------------------
         Handlers for Showing and Hiding URL Group Actions from Summary View
         --------------------------------------------------------------------*/
        $scope.showUrlGroupDetails = function(groupId) {
            if ($scope.showDetailsUrlGroup !== groupId) {
                $scope.showDetailsUrlGroup = groupId;
            } else {
                $scope.hideUrlGroupDetails();
            }
        };

        $scope.hideUrlGroupDetails = function() {
            $scope.showDetailsUrlGroup = false;
        };

        $scope.moveUrlGroupUp = function(urlGroup) {

            // Only do anything if this is *not* the first group by view order
            if (urlGroup.view_order > 0) {

                // Find URL Group just above
                var thisViewOrder = urlGroup.view_order;
                var targetViewOrder = -1;
                var targetUrlGroupId = null;
                for (var i = 0; i < $scope.urlgroups.length; i++) {
                    if ($scope.urlgroups[i].view_order < thisViewOrder) {
                        if ($scope.urlgroups[i].view_order >= targetViewOrder) {
                            targetViewOrder = $scope.urlgroups[i].view_order;
                            targetUrlGroupId = $scope.urlgroups[i]._id;
                        }
                    }
                }
                // Swap view_order values (only if a target was found)
                if (targetViewOrder > -1) {

                }
            }

        };

        $scope.moveUrlGroupDown = function(urlGroup) {

        };

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
        $scope.showUpdateUrlControls = function(groupId) {
            if ($scope.showControlsUpdateUrl !== groupId) {
                $scope.showControlsUpdateUrl = groupId;
            } else {
                $scope.hideRemoveUrlIcons();
            }
        };

        /*-- Hide the Remove-URL icons for given URL Group ------------------*/
        // Also uncheck any checkboxes
        $scope.hideRemoveUrlIcons = function() {
            // Hide the controls view
            $scope.showControlsUpdateUrl = false;
            // Set all URL 'update' properties to false (un-checks checkboxes)
            setUrlPropToFalse('update');
        };

        /*-- Add a new URL --------------------------------------------------*/
        $scope.addUrl = function(newUrl, urlGroup) {

            // Take no action if no data in either 'name' or the 'host' fields
            if (angular.isDefined(newUrl.name) && angular.isDefined(newUrl.host)) {

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

                // Initialize object to store status codes and response counts. Add
                // all status codes currently active in URL Group to responses obj.
                newUrl.responses = {};
                for (var statusCode in urlGroup.responses) {
                    newUrl.responses[statusCode] = 0;
                }

                // Add the URL Group ID
                newUrl.urlgroup_id = urlGroup._id;

                // Add the new URL to the Urls model
                var addUrl = new Urls(newUrl);
                addUrl.$save(function(urlResData) {
                    // Update the local model with the new URL
                    $scope.urls.push(addUrl);
                    // Clear out the form fields and hide the Add URL form
                    $scope.hideAddUrlForm();
                });
            } else {
                $scope.addUrlFormMessage = "Please provide values for both "
                    + "URL Name and URL Host";
                return;
            }
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

        // Runs through all Url objects in $scope.urls and sets the given
        // property to false
        function setUrlPropToFalse(prop) {
            for (var i = 0; i < $scope.urls.length; i++) {
                $scope.urls[i][prop] = false;
            }
        }
    }
]);
