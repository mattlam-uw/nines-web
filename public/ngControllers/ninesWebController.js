/**
 * Created by mattlam on 11/30/15.
 */
/*---------------------------------------------------------------------------
 Main httping Controller
 ----------------------------------------------------------------------------*/
angular.module('ninesWeb')
.constant("numDigits", 5)
.controller('ninesWebCtrl', ['$scope', '$routeParams', 'Urls', 'Heads',
            'numDigits',
             function($scope, $routeParams, Urls, Heads, numDigits) {

        /*-------------------------------------------------------------------
         Initialize $scope variables
         --------------------------------------------------------------------*/

        // Populate scope variables with objects pulled from nines-api
        $scope.urls = Urls.query();
        $scope.heads = Heads.query();

        // Scope variables used within this controller to provide data to views
        $scope.urlTotals = {};

        $scope.getStatusCodes = function() {
            var results = [];
            var keys = {};
            for (var i = 0; i < $scope.heads.length; i++) {
                var val = $scope.heads[i].status_code;
                if (angular.isUndefined(keys[val])) {
                    keys[val] = true;
                    results.push(val);
                }
            }
            results.sort();
            return results;
        };


        // Provide view with an object containing the following for a given URL:
        // 1) an occurrence total for each status code column in the table,
        // 2) an overall availability rating
        $scope.getResponseStatsByUrlId = function(urlId) {
            // Initialize variables:
            var results = {}; // final results object to be returned
            var resTotal = 0; // total number of responses
            var errTotal = 0; // total number of error responses

            // Create a property in the results object for every possible
            // status code a response from the URL might have
            var allStatusCodes = $scope.getStatusCodes();
            for (var i = 0; i < allStatusCodes.length; i++) {
                results[allStatusCodes[i]] = 0;
            }

            // Iterate over the header responses retrieved from the Heads model
            // looking for responses for the given URL. For each header response
            // identified, increment the appropriate results object status code
            // property value. Also increment the overall count of responses.
            for (var i = 0; i < $scope.heads.length; i++) {
                if ($scope.heads[i].url_id === urlId) {
                    var statusCode = $scope.heads[i].status_code;
                    results[statusCode] += 1;
                    if (statusCode >= 400) {
                        errTotal += 1;
                    }
                    resTotal += 1;
                }
            }

            // Retrieve the array of digits representing the availability rating
            // for this URL
            availRating = createAvailRating(errTotal, resTotal, numDigits);

            // Create properties in the results object for storing all digits
            // of the availability rating, and then populate the property values
            for (var i = 0; i < availRating.length; i++) {
                // Create property name
                var propertyName = 'digit' + (i + 1);
                // Assign the digit to the property
                results[propertyName] = availRating[i];
            }

            console.log(urlId);
            console.log(results);

            return results;
        };

       /**
        * Returns a url availability rating in the form of an array of single
        * digits. The first parameter asks for the total number of error
        * responses for the url. The second parameter asks for the total number
        * of responses for the url. The third parameter asks for the number of
        * digits for the resulting availability rating.
        */
        function createAvailRating(errorTotal, requestTotal, numDigits) {
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

        /*-------------------------------------------------------------------------
         Event Handlers
         ------------------------------------------------------------------------*/

    }
]);
