/*---------------------------------------------------------------------------
 Nines Web Main UI View Controller
 ----------------------------------------------------------------------------*/
angular.module('ninesWeb')
.controller('uiMainCtrl', ['$scope', '$routeParams', 'Urls', 'UrlGroups',
    'UrlGroupUrls', 'Heads', 'numDigits', 'errorThreshold',
    function($scope, $routeParams, Urls, UrlGroups, UrlGroupUrls, Heads,
             numDigits, errorThreshold) {

        /*-------------------------------------------------------------------
         Initialize $scope variables
         --------------------------------------------------------------------*/

        // Populate scope variables with objects pulled from nines-api
        // Retrieve all rows from the following models:
        $scope.urls = Urls.query();                 // Urls model
        $scope.urlgroups = UrlGroups.query();       // UrlGroups model
        $scope.urlgroupurls = UrlGroupUrls.query(); // UrlGroupUrls model
        $scope.heads = Heads.query();               // Heads model

        // Expose numDigits constant to views
        $scope.numDigits = numDigits;

        // Global object for storing URL Group Rating Totals
        var urlGroupRatingTotals = {};


        // +++++ DEBUG CODE START +++++
        // console.log('++Parameter: ', $routeParams.id);
        // console.log('++Status Codes: ', $scope.statusCodes)
        // +++++ DEBUG CODE END +++++++

//        if ($routeParams.id) {
//            $scope.statusCode = $routeParams.id;
//            $scope.count = ErrorCount.query({ statusCode: $routeParams.id });
//            $scope.files = ErrorFiles.query({ statusCode: $routeParams.id });
//
//            // +++++ DEBUG CODE START +++++
//            console.log('++Status Code: ', $scope.statusCode);
//            console.log('++Error Count: ', $scope.count);
//            console.log('++Error Files: ', $scope.files);
//            // +++++ DEBUG CODE END +++++++

//        }

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
                if (statusCode >= errorThreshold) {
                    errTotal += responseObject[statusCode];
                }
                resTotal += responseObject[statusCode];
                results[statusCode] = responseObject[statusCode];
            }

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

            return results;
        };

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
                for (var i = 0; i < numDigits; i++) {
                    noDataMsg.push("-");
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
    }
]);
