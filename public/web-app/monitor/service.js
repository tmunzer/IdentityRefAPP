angular.module('Monitor').factory("monitorService", function ($http, $q, userTypesService, userGroupsService) {
    var dataLoaded = false;

    function getDevices() {
        var params = {
            credentialType: userTypesService.getArrayForRequest(),
            userGroup: userGroupsService.getArrayForRequest()
        };
        dataLoaded = false;

        var canceller = $q.defer();
        var request = $http({
            url: "/api/monitor/devices",
            method: "GET",
            params: params,
            timeout: canceller.promise
        });
        var promise = request.then(
            function (response) {
                if (response.data.error) return response.data;
                else {
                    var credentials = [];

                    response.data.forEach(function (credential) {
                        credential.groupName = userGroupsService.getUserGroupName(credential.groupId);
                        credentials.push(credential);
                    });
                    dataLoaded = true;
                    return credentials;
                }
            },
            function (response) {
                if (response.status >= 0) {
                    console.log("error");
                    console.log(response);
                    return ($q.reject("error"));
                }
            });

        promise.abort = function () {
            canceller.resolve();
        };
        promise.finally(function () {
            console.info("Cleaning up object references.");
            promise.abort = angular.noop;
            canceller = request = promise = null;
        });

        return promise;
    }


    return {
        getDevices: getDevices,
        isLoaded: function isLoaded() {
            return dataLoaded;
        },
        setIsLoaded: function setIsLoaded(isLoaded) {
            dataLoaded = isLoaded;
        }
    }
});
