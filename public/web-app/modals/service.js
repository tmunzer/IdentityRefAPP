angular.module("Modals").factory("connectionStatusService", function ($http, $q) {
    var status = {};
    var promise = null;

    function getStatus(userName) {
        status = {};

        var canceller = $q.defer();
        var request = $http({
            url: "/api/identity/status",
            method: "GET",
            params: {userName: userName},
            timeout: canceller.promise
        });

        if (promise) promise.abort();
        promise = request.then(
            function (response) {
                if (response.data.error) return response.data;
                else {
                    status = response.data;
                    return status;
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
        getStatus: getStatus
    }
});

angular.module("Modals").factory("sendCredentialsService", function ($http, $q) {

    var promise = null;

    function deliver(credentialId, deliverMethod, email, phone) {

        var hmCredentialDeliveryInfoVo = {
            credentialId: credentialId,
            deliverMethod: deliverMethod,
            email: email,
            phone: phone
        };
        var canceller = $q.defer();
        var request = $http({
            url: "/api/identity/credentials/deliver",
            method: "POST",
            data: {hmCredentialDeliveryInfoVo: hmCredentialDeliveryInfoVo},
            timeout: canceller.promise
        });

        if (promise) promise.abort();
        promise = request.then(
            function (response) {
                if (response.data.error) return response.data;
                else {
                    return response;
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
        deliver: deliver
    }
});