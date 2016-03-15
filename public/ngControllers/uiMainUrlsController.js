angular.module('ninesWeb')
.controller('uiMainUrlsCtrl', ['$scope', 'Urls', 'UrlGroups', 'pingFrequencies',
    'SharedFuncs',
    function($scope, Urls, UrlGroups, pingFrequencies, SharedFuncs) {

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
        };

        // Provide view with the last ping date-time for URL Group as a
        // formatted string
        $scope.getLastPingTime = function(urlGroup) {
            // Check to make sure URL Group has a last-ping date
            if (urlGroup.last_ping) {

                // Pass URL Group last-ping date to parsing method shared across
                // this module for formatting and providing easy access to
                // date-time elements
                parsedDate = SharedFuncs.parseDateObj(urlGroup.last_ping);

                // Format a date-time string to return to the view
                return (parsedDate.month + '/' + parsedDate.day + '/' +
                        parsedDate.year + ' - ' + parsedDate.hours + ':' +
                        parsedDate.minutes);
            } else {
                // Return alternate message to view if there was no last-ping date
                return "not pinged yet";
            }
        };

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
            if (angular.isDefined(newUrl.name) && angular.isDefined(newUrl.fullUrl)) {

                // Verify that full URL begins with "http://" (https support to
                // be added later)
                newUrl.fullUrl = newUrl.fullUrl.trim();

                /**
                 *  Regular expression will make three useful captures. The
                 *  first will be the scheme (http or https). The second will be
                 *  the domain (abc.def.com or abc.com, etc.), and the third
                 *  will be the path (everything following the domain. This
                 *  will check for valid schemes and (mostly) valid domains, but
                 *  it will not check for valid paths.
                 */
                var urlRegEx = /(^https?):\/\/((?:[a-zA-z][a-zA-Z0-9\-]*\.)+[a-zA-Z]+)(\/.+)*$/;
                var urlMatch = newUrl.fullUrl.match(urlRegEx);

                // If the full URL provided satisfies the regular expression
                // requirements then add the URL
                if (urlMatch) {
                    // If scheme is https, then notify that it's not yet supported
                    if (urlMatch[1] === "https://") {
                        $scope.addUrlFormMessage = "HTTPS is not currently "
                            + "supported. Please use HTTP.";
                        return;
                    }

                    // Create new URL object that will be used for adding to
                    // URLs model
                    var addUrl = {};
                    addUrl.protocol = urlMatch[1];
                    addUrl.name = newUrl.name;
                    addUrl.host = urlMatch[2];
                    addUrl.path = urlMatch[3] || "";

                    // Initialize object to store status codes and response counts. Add
                    // all status codes currently active in URL Group to responses obj.
                    addUrl.responses = {};
                    for (var statusCode in urlGroup.responses) {
                        addUrl.responses[statusCode] = 0;
                    }

                    // Add the URL Group ID
                    addUrl.urlgroup_id = urlGroup._id;

                    // Add the new URL to the Urls model
                    var uploadUrl = new Urls(addUrl);
                    uploadUrl.$save(function(urlResData) {
                        // Update the local model with the new URL
                        $scope.urls.push(addUrl);
                        // Clear out the form fields and hide the Add URL form
                        $scope.hideAddUrlForm();
                    });

                // If the given full URL does not satisfy the regular expression
                // requirements, then notify the user.
                } else {
                    $scope.addUrlFormMessage = "Please enter a full URL that "
                        + "begins with 'http://', contains a valid domain, "
                        + "and, (if applicable) a valid path. An example is: "
                        + "http://cool.domain.com/todos/searchresults/?pri=1";
                    return;
                }

            } else {
                $scope.addUrlFormMessage = "Please provide values for both "
                    + "URL Name and Full URL";
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
    }
]);
