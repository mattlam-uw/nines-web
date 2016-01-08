/**
 * AngularJS Custom Filters to be used in views for Nines Web
 */
angular.module("customFilters", [])

// Returns an array of unique values for a specified property of objects in an array
.filter("unique", function() {
    return function(data, propertyName) {
        console.log("UNIQUE Filter has been Called");
        if (angular.isArray(data) && angular.isString(propertyName)) {
            var results = [];
            var keys = {};
            for (var i = 0; i < data.length; i++) {
                var val = data[i][propertyName];
                if (angular.isUndefined(keys[val])) {
                    keys[val] = true;
                    results.push(val);
                }
            }
            console.log(results);
            return results;
        } else {
            return data;
        }
    }
});
