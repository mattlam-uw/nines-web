angular.module('ninesWeb')
.controller('uiMainUrlsCtrl', ['$scope', 'Urls', 'UrlGroups', 'pingFrequencies',
    function($scope, Urls, UrlGroups, pingFrequencies) {

        /*---------------------------------------------------------------------
         Initialize $scope variables
         --------------------------------------------------------------------*/

        // Hide form to add new URL by default
        $scope.showFormAddUrl = false;
        // Hide URL Group details view by default
        $scope.showDetailsUrlGroup = false;
        // Hide the Update Ping Frequency controls by default
        $scope.showDropdownPingFrequency = false;
        // Provide feedback for add URL form
        $scope.addUrlFormMessage = "";
        // Hide the Icons for removing URLS by default
        $scope.showControlsUpdateUrl = "";
        // Object bound to Add-URL-Form for conveying form data
        $scope.newUrl = {};
        // Set protocol to "http" by default
        $scope.newUrl.protocol = "http";
        // URL Ping Frequencies (sourced from ng-constant)
        $scope.frequencies = pingFrequencies;

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

        /*-------------------------------------------------------------------
         Handlers for Updating Ping Frequency
         --------------------------------------------------------------------*/

        // Provide view with a ping frequency value translated into an easily
        // readable string (i.e. translates 1440 minutes into "24 hours")
        $scope.displayPingFrequency = function(freqMins) {
            var result = "";
            freqMins = parseInt(freqMins);
            if (freqMins < 60) {
                result = freqMins + " Minutes";
            } else if (freqMins === 60) {
                result = "1 Hour";
            } else if (freqMins > 60) {
                result = (freqMins / 60) + " Hours";
            }
            return result;
        };

        // show controls for updating ping frequency for a URL Group
        $scope.showUpdatePingFrequency = function(urlGroup) {
            $scope.showDropdownPingFrequency = true;
        };

        // Hide controls for updating ping frequency for a URL Group
        $scope.hideUpdatePingFrequency = function() {
            $scope.showDropdownPingFrequency = false;
        };

        // Update UrlGroups database model with new URL Group ping frequency.
        // Also update the ping frequencies in database for all associated URLs.
        $scope.updatePingFrequency = function(urlGroup) {
            $scope.hideUpdatePingFrequency();
            UrlGroups.update(
                { id: urlGroup._id },
                { $set: { ping_frequency: urlGroup.ping_frequency} },
                function(urlData) {
                    // Do nothing else
                }
            );
            // Determine URLs to update
            var urlIds = getArrUpdateUrlIds(urlGroup._id);
            // Update ping_frequency of URLs
            for (var i = 0; i < urlIds.length; i++) {
                updateUrlPingFreq(urlIds[i], urlGroup.ping_frequency);
            }
        };

        // Provide view with the last ping date-time for URL Group as a
        // formatted string
        $scope.getLastPingTime = function(urlGroup) {
            lastPing = new Date(urlGroup.last_ping);

            var month = lastPing.getMonth() + 1;
            var day = lastPing.getDate();
            var year = lastPing.getYear() + 1900;
            var hours = lastPing.getHours();
            var minutes = lastPing.getMinutes();
            var seconds = lastPing.getSeconds();

            // Add preceding zeroes to single digit minute and second values
            if (minutes < 10) {
                minutes = '0' + minutes;
            }
            if (seconds < 10) {
                seconds = '0' + seconds;
            }

            return (month + '/' + day + '/' + year + ' - '
                    + hours + ':' + minutes + ':' + seconds);
        }

        // Move URL Group higher or lower in the order in which it is displayed
        $scope.moveUrlGroup = function(urlGroup, direction) {

            var maxViewOrder = 1000;

            // Find URL Group just above
            var thisViewOrder = urlGroup.view_order;
            var thisUrlGroupInd = -1;
            var targetUrlGroupInd = -1;

            if (direction === 'up') {
                var targetViewOrder = -1;

                for (var i = 0; i < $scope.urlgroups.length; i++) {
                    if ($scope.urlgroups[i].view_order < thisViewOrder) {
                        if ($scope.urlgroups[i].view_order >= targetViewOrder) {
                            targetUrlGroupInd = i;
                            targetViewOrder = $scope.urlgroups[i].view_order;
                        }
                    }
                    if ($scope.urlgroups[i]._id === urlGroup._id) {
                        thisUrlGroupInd = i;
                        thisViewOrder = $scope.urlgroups[i].view_order;
                    }
                }

            } else if (direction === 'down') {
                var targetViewOrder = maxViewOrder;

                for (var i = 0; i < $scope.urlgroups.length; i++) {
                    if ($scope.urlgroups[i].view_order > thisViewOrder) {
                        if ($scope.urlgroups[i].view_order <= targetViewOrder) {
                            targetUrlGroupInd = i;
                            targetViewOrder = $scope.urlgroups[i].view_order;
                        }
                    }
                    if ($scope.urlgroups[i]._id === urlGroup._id) {
                        thisUrlGroupInd = i;
                        thisViewOrder = $scope.urlgroups[i].view_order;
                    }
                }

            } else {
                console.log("Bad value for 'direction' parameter provided");
                console.log("'direction' parameter value must be 'up' or 'down");
            }

            // Swap view_order values (only if a target was found)
            if (targetViewOrder > -1 && targetViewOrder < maxViewOrder) {

                // Update the local model
                $scope.urlgroups[targetUrlGroupInd].view_order = thisViewOrder
                $scope.urlgroups[thisUrlGroupInd].view_order = targetViewOrder;

                // Update the database model
                UrlGroups.update(
                    { id: $scope.urlgroups[targetUrlGroupInd]._id },
                    { $set: { view_order: thisViewOrder} },
                    function(urlData) {
                        // Do nothing else
                    }
                );
                UrlGroups.update(
                    { id: $scope.urlgroups[thisUrlGroupInd]._id },
                    { $set: { view_order: targetViewOrder} },
                    function(urlData) {
                        // Do nothing else
                    }
                );
            }
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

                // Set the Ping Frequency
                newUrl.ping_frequency = urlGroup.ping_frequency;

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

        // Returns array of URL IDs for URLs associated with given URL Group
        function getArrUpdateUrlIds(urlGroupId) {
            var results = [];
            for (var i = 0; i < $scope.urls.length; i++) {
                if ($scope.urls[i].urlgroup_id === urlGroupId) {
                    results.push($scope.urls[i]._id);
                }
            }
            return results;
        }

        // Update URLs database model to replace ping_frequency value with
        // given pingFreq value for given URL
        function updateUrlPingFreq(urlId, pingFreq) {
            Urls.update(
                { id: urlId },
                { $set: { ping_frequency: pingFreq} },
                function(urlData) {
                    // No need to do anything
                }
            )
        }
    }
]);
