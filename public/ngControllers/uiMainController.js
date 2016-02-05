/*---------------------------------------------------------------------------
 Nines Web Main UI View Controller
 ----------------------------------------------------------------------------*/
angular.module('ninesWeb')
.controller('uiMainCtrl', ['$scope', '$routeParams', '$route', 'Urls',
    'UrlGroups', 'Heads', 'numDigits', 'errorThreshold',
    function($scope, $routeParams, $route, Urls, UrlGroups,
             Heads, numDigits, errorThreshold) {

        /*-------------------------------------------------------------------
         Initialize $scope variables
         --------------------------------------------------------------------*/

        // Populate scope variables with objects pulled from nines-api
        // Retrieve all rows from the following models:
        $scope.urls = Urls.query();                 // Urls model
        $scope.urlgroups = UrlGroups.query();       // UrlGroups model
        $scope.heads = Heads.query();               // Heads model

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
        $scope.prepRemoveUrls = function() {
            $scope.modalHeaderMsg = "Click 'Remove' to permanently delete"
                                  + " the following URLs";
            $scope.showModalControl = "remove-groups";

        };

        /*-- Handler for removing selected URLs and availability stats ------*/
        // This is a bit clunky. It will remove the URLs from the Urls
        // database model, and it will recalculate the response stats totals
        // for the affected URL Group. However, in order to get the response
        // totals recalculated and displayed (without significant dev effort),
        // a full screen refresh is forced. This causes all of the URL Groups
        // to collapse to summary view.
        $scope.removeUrls = function() {

            // Determine urls to remove and remove them from database model
            for (var i = 0; i < $scope.urls.length; i++) {
                if ($scope.urls[i].update) {
                    Urls.remove({ id: $scope.urls[i]._id }, function(urlData) {
                        // Update the response totals for the associated URL
                        // group and refresh the screen
                        updateUrlGroup(urlData);
                    });
                }
            }
        };

        /*-- Handler to open a modal dialog to move URLs to another group ---*/
        // All this needs to do us update the Modal Header Message variable
        $scope.prepMoveUrls = function(urlGroupId) {
            $scope.modalHeaderMsg = "Click 'Move' to move the following URLs"
                + " to the selected URL Group";
            $scope.showModalControl = "move-groups";
            $scope.currentUrlGroupId = urlGroupId;
        };

        // WORK IN PROGRESS
        $scope.moveUrls = function() {
            var allDone = { count: 0 };
            var urlIds = [];
            for (var i = 0; i < $scope.urls.length; i++) {
                if ($scope.urls[i].update) {
                    urlIds.push($scope.urls[i]._id);
                }
            }

            for (var i = 0; i < urlIds.length; i++) {
                Urls.update(
                    { id: urlIds[i] },
                    { $set: { urlgroup_id: $scope.moveUrlGroup._id} },
                    function(urlData) {
                        if (i === urlIds.length) {
                            var urlGroupIds = [urlData.urlgroup_id, $scope.moveUrlGroup._id];
                            updateMoveUrlGroupTotals(urlGroupIds);
                        }
                    }
                )
            }

            // Set 'update' property to false for all URLs in local model
            setUrlPropToFalse('update');
        };

        /*-------------------------------------------------------------------
         Internal functions for Removing URL
         --------------------------------------------------------------------*/

        // Update URL Groups of URLs that have been moved so that the response
        // stat totals for the URL Groups will accurately reflect the response
        // stats of their URL members
        function updateMoveUrlGroupTotals(fromUrlGroupId, toUrlGroupId) {

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

        // Runs through all Url objects in $scope.urls and sets the given
        // property to false
        function setUrlPropToFalse(prop) {
            for (var i = 0; i < $scope.urls.length; i++) {
                $scope.urls[i][prop] = false;
            }
        }
    }
]);
