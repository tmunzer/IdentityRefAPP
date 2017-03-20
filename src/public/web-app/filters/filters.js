
angular.module("CustomFilters").filter("ssidStringFromArray", function () {
    return function (input) {
        if (!input || input.length === 0) return "";
        else {
            var string = "";
            input.forEach(function (ssid) {
                string += ssid + ", ";
            });
            string = string.trim().slice(0, -1);
            return string;
        }
    }
});
angular.module("CustomFilters").filter("userType", function () {
    return function (input) {
        if (input === "CLOUD_PPSK") return "PPSK";
        else if (input === "CLOUD_RADIUS") return "RADIUS";
        else return "";
    }
});
angular.module("CustomFilters").filter("deliverMethod", function () {
    return function (input) {
        var string = input.replace(/_/g, " ");
        return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
    }
});
