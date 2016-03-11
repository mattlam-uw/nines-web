/**
 * Created by mattlam on 3/10/2016.
 */
angular.module('ninesWeb')
    .factory('FormatDateTime', function() {
        return {
            formatDateTime: function(datetime) {
                var dateObj = new Date(datetime);

                var month = dateObj.getMonth() + 1;
                var day = dateObj.getDate();
                var year = dateObj.getYear() + 1900;
                var hours = dateObj.getHours();
                var minutes = dateObj.getMinutes();

                // Add preceding zeroes to single digit minute values
                if (minutes < 10) {
                    minutes = '0' + minutes;
                }

                return (month + '/' + day + '/' + year + ' - '
                + hours + ':' + minutes);
            }
        };
    });
