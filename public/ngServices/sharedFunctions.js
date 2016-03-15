/**
 * Created by mattlam on 3/10/2016.
 */

angular.module('ninesWeb')
/** 
 * Returns an Object of formatted date and time elements parsed from a given 
 * JavaScript Date object.
 **/
.factory('SharedFuncs', function() {
    return {
        parseDateObj: function(datetime) {
            var result = {};

            var dateObj = new Date(datetime);

            result.month = dateObj.getMonth() + 1;
            result.day = dateObj.getDate();
            result.year = dateObj.getYear() + 1900;
            result.hours = dateObj.getHours();
            result.minutes = dateObj.getMinutes();

            // Add preceding zeroes to single digit minute values
            if (result.minutes < 10) {
                result.minutes = '0' + result.minutes;
            }

            return result;
        }
    };
});
