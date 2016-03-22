/*---------------------------------------------------------------------------
 Nines Web Main UI View Controller
 ----------------------------------------------------------------------------*/
angular.module('ninesWeb')
.controller('uiMainCtrl', ['$scope', '$route', 'Urls',
    'UrlsByUrlGroup', 'UrlGroups', 'numDigits', 'errorThreshold',
    function($scope, $route, Urls, UrlsByUrlGroup, UrlGroups,
             numDigits, errorThreshold) {

        /*-------------------------------------------------------------------
         Initialize $scope variables
         --------------------------------------------------------------------*/

        // Populate scope variables with objects pulled from nines-api
        // Retrieve all rows from the following models:
        $scope.urls = Urls.query();                 // Urls model
        $scope.urlgroups = UrlGroups.query();       // UrlGroups model

        // Expose numDigits constant to views
        $scope.numDigits = numDigits;

        // Expose URL name and id to modal form for confirmation of URL removal
        $scope.modalHeaderMsg = "";

        $scope.showModalControl = "";

        $scope.currentUrlGroupId = null;

        $scope.moveUrlGroup = null;

        // Global variable for storing the value of the markup code for the
        // leading stat value of an overall availability stat for URL or URL
        // Group
        var leadStatCode = 0;

        /*-------------------------------------------------------------------
         View Data Prep Methods - Public (available to view)
         --------------------------------------------------------------------*/

        // Provides numbers for total number of responses and the total number
        // of error responses in one results object for use in the view
        $scope.getUrlGroupTotals = function(urlGroup) {
            var results = {
                errTotal: 0,
                resTotal: 0
            };
            for (var statusCode in urlGroup.responses) {
                if (statusCode >= errorThreshold) {
                    results.errTotal += urlGroup.responses[statusCode];
                }
                results.resTotal += urlGroup.responses[statusCode];
            }

            return results;
        }

        /**
         * The following function can be called to get either (a) stats for a
         * particular URL in a URL Group or (b) overall stats for the URL Group.
         * If an object value for the 'urlResponses' parameter is provided,
         * then it is assumed the function is being called to get specific URL
         * stats. If no value is provided for the 'urlResponses' parameter,
         * then it is assumed the function is being called to get overall
         * stats for the URL Group. In each case, a results object will be
         * populated with an occurrence total for each status code column.
         */
        $scope.getUrlStats = function(urlgroupResponses, urlResponses) {
            // Initialize variables:
            var results = {}; // final results object to be returned

            // If this is being run for URLs (not URL Groups), then add a
            // 'results' object property for all status codes represented
            // in URL Group
            if (urlResponses) {
                for (var statusCode in urlgroupResponses) {
                    results[statusCode] = 0;
                }
            }

            // If a URL Responses argument was passed, then use that for
            // creating availability rating. Otherwise, use URL Group's.
            var responseObject = urlgroupResponses;
            if (urlResponses) {
                responseObject = urlResponses;
            }

            // Iterate through the responses for this URL Group or URL and
            // update the results object status code property with the value
            // of that of the corresponding status code of response object
            for (var statusCode in responseObject) {
                results[statusCode] = responseObject[statusCode];
            }

            return results;
        };

        $scope.getAvailRating = function(urlgroupResponses, urlResponses) {
            var results = {}; // final results object to be returned
            var resTotal = 0; // total number of responses
            var errTotal = 0; // total number of error responses

            // If a URL Responses argument was passed, then use that for
            // creating availability rating. Otherwise, use URL Group's.
            var responseObject = urlgroupResponses;
            if (urlResponses) {
                responseObject = urlResponses;
            }

            // Iterate over the status code properties in the response object
            // and calculate the error and overall response totals to be used
            // to determine the availability rating.
            for (var statusCode in responseObject) {
                if (statusCode >= errorThreshold) {
                    errTotal += responseObject[statusCode];
                }
                resTotal += responseObject[statusCode];
            }

            // Create the availability rating. It will be returned as an array
            // of digits 'numDigits' in length
            var rating = createAvailRating(errTotal, resTotal, numDigits);

            // An annoying thing with AngularJS (though there must be some
            // reason for it) -- ng-repeat will not accept an array of values
            // where all the values are the same. But it will accept an object
            // where all the property values are the same. So, rather than just
            // returning the array, we convert to object.
            for (var i = 0; i < rating.length; i++) {
                results[i] = rating[i];
            }

            return results;
        }


        /**
         *  Provides markup that will be used to style (color) a digit of
         *  an availability stat for a URL or URL Group. This function will
         *  determine an integer code that will then be fed to another
         *  function (getMarkupValue) to retrieve the appropriate corresponding
         *  markup string.
         */
        $scope.getStatMarkup = function(statNum, value) {
            // Logic Rules: (Note) The first digit in the availability rating
            // can determine the markup for all remaining digits. (1) If the
            // first digit is a '9' then it will be assigned a value of 1.
            // Following this, the first non-'9' digit in the value and all
            // digits following it will be assigned a value of 2. (2) If the
            // first digit is between 5 and 8 (inclusive) then it and all
            // following digits will receive a value of 2. If the first digit
            // is less than 5, then it and all following digits will receive a
            // value of 3.
            if (statNum == 0) {
                leadStatCode = 1;
                if (value < 9) {
                    leadStatCode = 2;
                }
                if (value < 5) {
                    leadStatCode = 3;
                }
            } else {
                if (leadStatCode === 1) {
                    if (value < 9) {
                        leadStatCode = 2;
                    }
                }
            }

            // Return the markup string that maps to the code
            return getMarkupValue(leadStatCode);
        }

        /*-------------------------------------------------------------------
         View Data Prep Methods - Internal
         --------------------------------------------------------------------*/

        // Return a mapped markup string value for a given code
        function getMarkupValue(statCode) {
            var markupMap = {
                1: "rating-good",
                2: "rating-fair",
                3: "rating-poor"
            }
            return markupMap[statCode];
        }

        /**
         * Returns a url availability rating in the form of an array of single
         * digits. The first parameter asks for the total number of error
         * responses for the url. The second parameter asks for the total number
         * of responses for the url. The third parameter asks for the number of
         * digits for the resulting availability rating.
         */
        function createAvailRating(errorTotal, requestTotal, numDigits) {

            // If the total number of requests is 0 then return dashes
            if (requestTotal === 0) {
                var noDataMsg = [];
                for (var i = 0; i < numDigits + 1; i++) {
                    if (i === 2) {
                        noDataMsg.push(".");
                    } else {
                        noDataMsg.push("-");
                    }
                }
                return noDataMsg;
            }

            // Otherwise, there's data, so caclulate and return the rating
            // Array to be used to return the results
            var results = [];

            // Initialize availability rating value variable
            var rating = 0;

            // The multFactor is used to move all digits that are part of the
            // availability rating to the left of the decimal point, making
            // division ('/') and rounding easier to execute on the numbers
            var multFactor = Math.pow(10, numDigits);

            // The divFactor is used to narrow down the next digit in the
            // availability rating to be retrieved into the results array
            var divFactor = Math.pow(10, numDigits - 1);

            // Calculate the raw rating and apply the multFactor to move digits
            // to the left of the decimal point
            rating = (1 - (errorTotal / requestTotal)) * multFactor;

            // Interesting thing here: a perfect score should be 100%, right?
            // But no system is truly up 100% of the time. If your numbers are
            // telling you that it is, then you need to increase your sample
            // size. The next couple of lines convert a perfect score (100%) to
            // a very near perfect score (e.g. 99.999%). The number of 9s are
            // determined by the numDigits.
            if (rating === (multFactor)) {
                rating = multFactor - 1;
            }

            // Convert the rating number into an array of digits numDigits in
            // length that represents the rating
            for (var i = 0; i < numDigits; i++) {
                // Add a decimal place if this is the third digit
                if (i === 2) {
                    results.push('.');
                }

                // Retrieve the number currently on the far left of the rating
                // number
                var result = Math.floor(rating / divFactor);
                // Add this number to the results array
                results.push(result);
                // Chop off the left-most digit from the rating number
                rating = rating - (result * divFactor);
                // Adjust the divFactor for the next round
                divFactor = Math.pow(10, numDigits - (i + 2));

            }

            return results;
        }

        /*-------------------------------------------------------------------
         Handlers for Update URLs Modal
         --------------------------------------------------------------------*/

        /*-- Handler for opening a modal dialog to remove URLs --------------*/
        // All this needs to do us update the Modal Header Message variable
        $scope.prepRemoveUrls = function(urlGroup) {
            $scope.modalHeaderMsg = "Click 'Remove' to permanently delete"
                                  + " the following URLs";
            $scope.showModalControl = "remove-groups";
            $scope.currentUrlGroup = urlGroup;

            // Update URLs in this group to be updated such that their 'update'
            // property is set to the URL Group ID
            setUrlGroupIdForUrlUpdate(urlGroup._id);
        };

        /*-- Handler for removing selected URLs and availability stats ------*/
        // This is a bit clunky. It will remove the URLs from the Urls
        // database model, and it will recalculate the response stats totals
        // for the affected URL Group. However, in order to get the response
        // totals recalculated and displayed (without significant dev effort),
        // a full screen refresh is forced. This causes all of the URL Groups
        // to collapse to summary view.
        $scope.removeUrls = function(urlGroup) {

            // Iterate over URLs and (1) add the IDs of those selected for 
            // removal to an array, and (2) set 'update' flag to false
            var urlIds = getArrUpdateUrlIds(urlGroup._id);

            for (var i = 0; i < urlIds.length; i++) {
                removeUrlsFromDb(urlIds[i], (i + 1), urlIds.length);
            }

            // Reset the 'update' property for URLs in this URL Group to false
            setUrlUpdateForUrlGroup(urlGroup._id, false);
        };

        /*-- Handler to open a modal dialog to move URLs to another group ---*/
        // All this needs to do us update the Modal Header Message variable
        $scope.prepMoveUrls = function(urlGroup) {
            $scope.modalHeaderMsg = "Click 'Move' to move the following URLs"
                + " to the selected URL Group";
            $scope.showModalControl = "move-groups";
            $scope.currentUrlGroup = urlGroup;

            // Update URLs in this group to be updated such that their 'update'
            // property is set to the URL Group ID
            setUrlGroupIdForUrlUpdate(urlGroup._id);
        };

        // Move selected Urls from one URL Group to another
        $scope.moveUrls = function(urlGroup) {

            // Iterate over URLs and (1) add the IDs of those that have been
            // selected for move to an array, and (2) set 'update' flag to false
            var urlIds = getArrUpdateUrlIds(urlGroup._id);

            // Iterate over the new array of IDs for URLs to be moved
            // and update the database model to set the urlgroup_id property
            // of each URL to the target URL Group ID. When the last one has
            // been updated, then recalculate all group totals and refresh
            // the view
            for (var i = 0; i < urlIds.length; i++) {
                updateUrlGroupIds(urlIds[i], (i + 1), urlIds.length);
            }

            // Reset the 'update' property for URLs in this URL Group to false
            setUrlUpdateForUrlGroup(urlGroup._id, false);
        };

        // Clears all of the 'update' property values for all URLs
        $scope.unsetAllUrlUpdate = function() {
            for (var i = 0; i < $scope.urls.length; i++) {
                $scope.urls[i].update = false;
            }
        }

        /*-- Handlers for removing URL Group --------------------------------*/

        // Open the modal for removing a URL Group
        $scope.prepRemoveUrlGroup = function(urlGroup) {
            $scope.currentUrlGroup = urlGroup;
            $scope.modalHeaderMsg = "Click 'Remove' to permanently delete"
                + " the following URL Group and all associated URLs";
            $scope.showModalControl = "remove-group";

            // Update URLs in this group to be updated such that their 'update'
            // property is set to the URL Group ID
            setUrlUpdateForUrlGroup(urlGroup._id, true);
            setUrlGroupIdForUrlUpdate(urlGroup._id);
        };

        // Remove the URL Group and all associated URLs
        $scope.removeUrlGroup = function(urlGroup) {

            // Find the URLs associated with the group
            var urlIds = getArrUpdateUrlIds(urlGroup._id);

            // Remove the urls from the Database
            for (var i = 0; i < urlIds.length; i++) {
                removeUrlsFromDb(urlIds[i], (i + 1), urlIds.length);
            }

            // Remove the URL Group from the database
            removeUrlGroupFromDb(urlGroup._id);

            // Iterate over the urlgroups local model in order to (1) determine
            // the index of the URL Group being removed, and (2) build an
            // object to be used to update the view_order values of all
            // remaining groups such that gaps the the view_order do not emerge
            // after repeated URL Group removals.
            var urlGroupInd = -1;            // Index of URL Group to remove
            var urlGroupIdsByViewOrder = {}; // Object for updating view_order
            var highestViewOrder = -1;       // Upper limit for view_order vals
            for (var i = 0; i < $scope.urlgroups.length; i++) {
                if ($scope.urlgroups[i]._id === urlGroup._id) {
                    // This is the URL Group to be removed, so capture the index
                    urlGroupInd = i;
                } else {
                    // These are the URL Groups that remain, so capture their
                    // view_order values

                    // First, determine the view_order upper limit
                    var currentViewOrder = $scope.urlgroups[i].view_order;
                    if (currentViewOrder > highestViewOrder) {
                        highestViewOrder = currentViewOrder;
                    }

                    // Then, if a property on the object for the current URL
                    // Group's view_order does not exist, add the property
                    // and assign a value of an array containing the URL
                    // Group's ID
                    if (!urlGroupIdsByViewOrder[currentViewOrder]) {
                        urlGroupIdsByViewOrder[currentViewOrder] =
                            [$scope.urlgroups[i]._id];
                    // If the property on the object does already exist (this
                    // is a case where two URL Groups had the same view_order
                    // value -- it shouldn't happen), then add the URL Group
                    // ID as a second element in the already-existing array.
                    } else {
                        urlGroupIdsByViewOrder[currentViewOrder].push(
                            $scope.urlgroups[i]._id
                        );
                    }
                }
            }

            // Update the URL Groups database model with new view_order values

            // Starting with a view_order value of 0 and going up through
            // the view_order upper limit, retrieve the URL Group IDs from the
            // view_order object in correct order. Use these to update the URL
            // Group in the database model providing a new view_order value
            // that eliminates any possible view_order gaps.
            var newViewOrder = 0;
            for (var i = 0; i <= highestViewOrder; i++) {
                if (urlGroupIdsByViewOrder[i]) {
                    for (var j = 0; j < urlGroupIdsByViewOrder[i].length; j++) {
                        updateUrlGroupViewOrder(
                            urlGroupIdsByViewOrder[i][j],
                            newViewOrder
                        );
                        console.log('adding view order of', newViewOrder);
                        newViewOrder += 1;
                    }
                }
            }

            // Remove the URL Group from the local model array
            $scope.urlgroups.splice(urlGroupInd, 1);
        };
        
        /*-- Handlers for resetting URL Group --------------------------------*/

        // Open the modal for removing a URL Group
        $scope.prepResetUrlGroup = function(urlGroup) {
            $scope.currentUrlGroup = urlGroup;
            $scope.modalHeaderMsg = "Click 'Reset' to permanently remove"
                + " all response for all URLs in this group.";
            $scope.showModalControl = "reset-group";

            // Update URLs in this group to be updated such that their 'update'
            // property is set to the URL Group ID
            setUrlUpdateForUrlGroup(urlGroup._id, true);
            setUrlGroupIdForUrlUpdate(urlGroup._id);
        };

        // Remove the URL Group and all associated URLs
        $scope.resetUrlGroup = function(urlGroup) {
            
            // Update the Database to reset the URL Group
            // Refresh the screen
        };

        /*-------------------------------------------------------------------
         Internal functions for Removing URL
         --------------------------------------------------------------------*/

        // Remove the URL Group from the database
        function removeUrlGroupFromDb(urlGroupId) {
            UrlGroups.remove({ id: urlGroupId }, function(urlGroupData) { });
        }

        function updateUrlGroupViewOrder(urlGroupId, newViewOrder) {
            console.log ('Updating URL Group ' + urlGroupId + ' with new view order: ' + newViewOrder);
            UrlGroups.update(
                { id: urlGroupId },
                { $set: { view_order: newViewOrder} },
                function(urlData) {
                    // No need to do anything else
                    console.log('new view order:', newViewOrder);
                    console.log('urlData:', urlData);
                }
            )
        }

        // Remove the specified URL from the database and revise the URL Group
        // totals so that they no longer include the URL response numbers
        function removeUrlsFromDb(urlId, num, ofTotal) {
            Urls.remove({ id: urlId }, function(urlData) {
                if (num === ofTotal) {
                    updateUrlGroupTotals();
                }
            });
        }

        // Updates the urlgroup_id property of a given URL with the ID of the
        // target URL Group chosen in the view. The 'num' and 'ofTotal'
        // parameters track which of (possibly) multiple URL updates this
        // represents. All URL Group totals are recalculated when the last URL
        // is updated.
        function updateUrlGroupIds(urlId, num, ofTotal) {
            Urls.update(
                { id: urlId },
                { $set: { urlgroup_id: $scope.moveUrlGroup._id} },
                function(urlData) {
                    if (num === ofTotal) {
                        updateUrlGroupTotals();
                    }
                }
            )
        }

        // Recalculate status code response totals for all URL Groups and then
        // refresh the screen to pull the new totals
        function updateUrlGroupTotals() {       

            // Iterate over all URL Groups in the urlgroups local model. Zero
            // out the status code response values for all status codes in each
            // URL Group.
            for (var i = 0; i < $scope.urlgroups.length; i++) {
                var urlGroup = $scope.urlgroups[i];

                // Zero out current response status code value for Url Group
                for (var statusCode in urlGroup.responses) {
                    urlGroup.responses[statusCode] = 0;
                }

                // Call recalculate function to calculate current status code
                // response totals for the group and update the model.
                recalcUrlGroupTotals(urlGroup, (i + 1), $scope.urlgroups.length);
            }
        }

        // Recalculates status code response totals for given URL Group. Writes
        // the resulting totals to the urlgroups database model. Removes any
        // case where a status code column for a URL Group is all zeroes.
        // Refreshes the view screen if this is the last URL Group being
        // recalculated.
        function recalcUrlGroupTotals(urlGroup, numGroup, ofTotalGroups) {

            // Query all URLs associated with URL Group in order to get their
            // latest status code response totals
            UrlsByUrlGroup.query({ id: urlGroup._id }, function(urls) {

                // Iterate over each URL returned in query
                for (var j = 0; j < urls.length; j++) {

                    // Iterate over each status code in responses for URL and
                    // add to status code total for URL Group
                    for (var statusCode in urls[j].responses) {

                        if (urlGroup.responses) {
                            if (urlGroup.responses[statusCode]) {
                                urlGroup.responses[statusCode] +=
                                    urls[j].responses[statusCode];
                            } else {
                                urlGroup.responses[statusCode] =
                                    urls[j].responses[statusCode];
                            }
                        } else {
                            urlGroup.responses = {};
                            urlGroup.responses[statusCode] =
                                urls[j].responses[statusCode];
                        }
                    }
                }

                // Update the URL Group database model with the recalculated
                // response totals.
                UrlGroups.update(
                    {id: urlGroup._id},
                    { $set: { responses: urlGroup.responses } },
                    function() {
                        // Check for URL Group status code response totals of
                        // zero. If any are found remove the status code
                        // response total for both the URL Group and all URLs
                        // in the group
                        removeZeroResponseTotals(urlGroup, numGroup, ofTotalGroups);

                        // Refresh the view screen if this is the last URL
                        // Group being updated. The reload that is triggered by
                        // updateUrlResponses() below will almost definitely
                        // happen after this. So this may be superfluous. But
                        // for now call it failsafe.
                        if (numGroup === ofTotalGroups) {
                            $route.reload();
                        }
                    }
                );
            });
        }

        // Look at a URL Group to see of there are cases where the response
        // total for a status code is zero. For all such cases found, remove
        // that status code from the 'responses' object of both the URL Group
        // and URLs associated with the URL Group.
        function removeZeroResponseTotals(urlGroup, numGroup, ofTotalGroups) {
            var zeroTotalStatusCodes = []; // Array for status codes w/zero total
            var updatedGroupResponses = {}; // Replacement 'responses' object

            // Iterate over the status codes in the URL Group 'responses' object
            // and add the cases of a zero total to the 'zerototal' array while
            // adding cases of non-zero total to the replacement 'responses' obj.
            for (var statusCode in urlGroup.responses) {
                if (urlGroup.responses[statusCode] === 0) {
                    zeroTotalStatusCodes.push(statusCode);
                } else {
                    updatedGroupResponses[statusCode] =
                        urlGroup.responses[statusCode];
                }
            }

            // Replace the existing 'responses' object for the URL Group with
            // the new replacement object that has no zero-total status codes.
            updateUrlGroupResponses(urlGroup, updatedGroupResponses);

            // Find the URLs associated with this URL Group and remove status
            // codes having zero totals from their 'responses' object
            UrlsByUrlGroup.query({ id: urlGroup._id }, function(urls) {

                // Iterate over all found URLs and add only positive status
                // code totals to a replacement 'responses' object
                for (var i = 0; i < urls.length; i++) {
                    var updatedResponses = {};
                    for (var statusCode in urls[i].responses) {
                        if (zeroTotalStatusCodes.indexOf(statusCode) < 0) {
                            updatedResponses[statusCode] =
                                urls[i].responses[statusCode];
                        }
                    }

                    // Update the 'responses' object for the URL with the
                    // replacement 'responses' object
                    updateUrlResponses(urls[i], updatedResponses, numGroup,
                        ofTotalGroups, (i + 1), urls.length);
                }
            });
        }

        // Replace the existing 'responses' object for the URL Group with the
        // given replacement object.
        function updateUrlGroupResponses(urlGroup, updatedResponses) {
            UrlGroups.update(
                { id: urlGroup._id },
                { $set: { responses: updatedResponses } },
                function(urlGroupData) {
                    // don't do anything
                }
            )
        }

        // Update the 'responses' object for the URL with the replacement
        // 'responses' object. Also refresh the view only when this is the last
        // URL being updated for the last URL Group being updated
        function updateUrlResponses(url, updatedResponses, numGroup, ofTotalGroups, numUrl, ofTotalUrls) {
            Urls.update(
                { id: url._id },
                { $set: { responses: updatedResponses } },
                function(urlData) {
                    if (numGroup === ofTotalGroups) {
                        if (numUrl === ofTotalUrls) {
                            $route.reload();
                        }
                    }
                }
            )
        }

        // Update the URL Group for a URL to subtract the response stats per
        // status code for the removed URL from the group total
        function updateUrlGroup(urlData) {
            // Don't do anything unless there is data to act on
            if (urlData) {

                // Determine the index of the URL Group in urlgroups local
                // model
                var urlGroupInd = -1;
                for (var j = 0; j < $scope.urlgroups.length &&
                    urlGroupInd < 0; j++) {
                    if ($scope.urlgroups[j]._id === urlData.urlgroup_id) {
                        urlGroupInd = j;
                    }
                }

                // For each status code in the responses data for the deleted
                // URL, check for a matching status code in the responses for
                // the associated URL Group and subtract the URL's status code
                // response number from the URL Group's.
                for (var delUrlStatusCode in urlData.responses) {
                    for (var urlGroupStatusCode in
                        $scope.urlgroups[urlGroupInd].responses) {

                        if (delUrlStatusCode === urlGroupStatusCode) {
                            $scope.urlgroups[urlGroupInd]
                                  .responses[urlGroupStatusCode] -=
                                urlData.responses[urlGroupStatusCode];
                        }
                    }
                }

                // Update the URL Group model (database) with the modified
                // response totals (old totals minus those of the deleted URL).
                UrlGroups.update(
                    {id: urlData.urlgroup_id},
                    $scope.urlgroups[urlGroupInd],
                    updateUrlGroupCallback
                );
            }
        }

        // Callback for the UrlGroups update call. This just refreshes
        // the page once the UrlGroups model is updated
        function updateUrlGroupCallback() {
            // Reload the page to recalculate totals and
            // availability metrics
            $route.reload();
        }

        // Iterates over local Urls model looking for any URL (1) having an
        // 'update' property set and (2) associated with the urlGroupId. For
        // these Urls, set the 'update' property to the urlGroupId.
        function setUrlGroupIdForUrlUpdate(urlGroupId) {
            for (var i = 0; i < $scope.urls.length; i++) {
                if ($scope.urls[i].update) {
                    if ($scope.urls[i].urlgroup_id === urlGroupId) {
                        $scope.urls[i].update = urlGroupId;
                    }
                }
            }
        }

        // Returns array of URL IDs for URLs associated with given URL Group
        function getArrUpdateUrlIds(urlGroupId) {
            var results = [];
            for (var i = 0; i < $scope.urls.length; i++) {
                if ($scope.urls[i].update) {
                    if ($scope.urls[i].update === urlGroupId) {
                        results.push($scope.urls[i]._id);
                    }
                }
            }
            return results;
        }

        // Sets the 'update' property for a URL to the given value for all URLs
        // associated with the given urlGroupId
        function setUrlUpdateForUrlGroup(urlGroupId, value) {
            for (var i = 0; i < $scope.urls.length; i++) {
                if ($scope.urls[i].urlgroup_id === urlGroupId) {
                    $scope.urls[i].update = value;
                }
            }
        }
    }
]);
