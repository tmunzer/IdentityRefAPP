angular.module('Monitor').factory("monitorService", function ($http, $q, $rootScope, userTypesService, userGroupsService) {
    var dataLoaded = false;
    var promise = null;

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

        if (promise) promise.abort();
        promise = request.then(
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
                if (response.status && response.status >= 0) {
                    $rootScope.$broadcast('serverError', response);
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
