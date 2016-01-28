/*---------------------------------------------------------------------------
 Nines Web Main UI View Controller
 ----------------------------------------------------------------------------*/
angular.module('ninesWeb')
.controller('uiMainCtrl', ['$scope', '$routeParams', '$route', 'Urls',
    'UrlGroups', 'UrlGroupUrls', 'Heads', 'numDigits', 'errorThreshold',
    function($scope, $routeParams, $route, Urls, UrlGroups,
             UrlGroupUrls, Heads, numDigits, errorThreshold) {

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
        $scope.remUrlId = null;
        $scope.remUrlName = null;

        // Global object for storing the value of the last color used for
        // displaying a URL rating stat value.
        var leadStatColor = 0;

        /*-------------------------------------------------------------------
         View Data Prep Methods - Public (available to view)
         --------------------------------------------------------------------*/

        // The following function can be called to get either (a) stats for a
        // particular URL in a URL Group or (b) overall stats for the URL Group.
        // If an object value for the 'urlResponses' parameter is provided,
        // then it is assumed the function is being called to get specific URL
        // stats. If no value is provided for the 'urlResponses' parameter,
        // then it is assumed the function is being called to get overall
        // stats for the URL Group. In each case, the following stats will be
        // returned: (1) an occurrence total for each status code column in
        // the table, and (2) an overall availability rating
        $scope.getUrlStats = function(urlgroupResponses, urlResponses) {
            // Initialize variables:
            var results = {}; // final results object to be returned
            var resTotal = 0; // total number of responses
            var errTotal = 0; // total number of error responses

            // If this is being run for URLs (not URL Groups), then add a
            // 'results' object property for all status codes represented
            // in URL Group
            if (urlResponses) {
                for (var statusCode in urlgroupResponses) {
                    results[statusCode] = 0;
                }
            }

            // Iterate through the responses for this URL Group or URL and
            // determine the error and response totals and add the response
            // totals to the appropriate status code property in the 'results'
            // object.
            var responseObject = urlgroupResponses;
            if (urlResponses) {
                responseObject = urlResponses;
            }
            for (var statusCode in responseObject) {
                /*
                if (statusCode >= errorThreshold) {
                    errTotal += responseObject[statusCode];
                }
                resTotal += responseObject[statusCode];
                */
                results[statusCode] = responseObject[statusCode];
            }

            /*
            // Retrieve the array of digits representing the availability rating
            // for this URL
            var availRating = createAvailRating(errTotal, resTotal, numDigits);

            // Create properties in the results object for storing all digits
            // of the availability rating, and then populate the property values
            for (var i = 0; i < availRating.length; i++) {
                // Create property name
                var propertyName = 'digit' + (i + 1);
                // Assign the digit to the property
                results[propertyName] = availRating[i];
            }
            */

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


        $scope.getStatColor = function(statNum, value) {
            // If the last color was green, then check for green or yellow
            // If the last color was yellow, then all remaining are yellow
            // If the last color was red, then all remaining are red
            var statColor = "";
            if (statNum == 0) {
                leadStatColor = 1;
                if (value < 9) {
                    leadStatColor = 2;
                }
                if (value < 5) {
                    leadStatColor = 3;
                }
            } else {
                if (leadStatColor === 1) {
                    if (value < 9) {
                        leadStatColor = 2;
                    }
                }
            }

            statColor = leadStatColor;

            if (statColor === 1) {
                statColor = "label-success";
            } else if (statColor === 2) {
                statColor = "label-warning";
            } else {
                statColor = "label-danger";
            }

            return statColor;
        }

        /*-------------------------------------------------------------------
         View Data Prep Methods - Internal
         --------------------------------------------------------------------*/

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
         Handlers for Remove-URL Modal
         --------------------------------------------------------------------*/

        /*-- Handler for opening a modal dialog to remove a URL -------------*/
        $scope.prepRemoveUrl = function(remUrlId, remUrlName) {
            // Add the following attribtes for URL to be removed to $scope so
            // that these attributes can be used in the modal view
            $scope.remUrlName = remUrlName;
            $scope.remUrlId = remUrlId;
        }

        /*-- Handler for removing a URL and related availability stats ------*/
        $scope.removeUrl = function(remUrlId) {

            // Callback for call to Urls resource. Determines the index of the
            // URL in the $scope.urls array and removes item from array
            var removeUrlCallback = function(urlData) {
                // Determine the index of the URL to delete in the urls local
                // model
                var urlInd = -1;
                for (var i = 0; i < $scope.urls.length && urlInd < 0; i++) {
                    if ($scope.urls[i]._id === remUrlId) {
                        urlInd = i;
                    }
                }

                // Remove the URL from the local model
                $scope.urls.splice(urlInd, 1);

                // Update the totals for the URL Group of the URL
                updateUrlGroup(urlData);

                // Clean-up: return $scope url identifiers to empty values
                $scope.remUrlName = null;
                $scope.remUrlId = null;
            }

            // Update the URLs model (database) to delete the URL
            Urls.remove({id: remUrlId}, removeUrlCallback);
        };

        /*-------------------------------------------------------------------
         Internal functions for Removing URL
         --------------------------------------------------------------------*/

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
    }
]);
