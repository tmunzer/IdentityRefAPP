angular.module('Create').factory("createService", function ($http, $q, $rootScope) {
    var userFieldsToDisplay = [
        {name: 'firstName', display: 'First Name'},
        {name: 'lastName', display: 'Last Name'},
        {name: 'email', display: 'Email'},
        {name: 'phone', display: 'Phone'},
        {name: 'organization', display: 'Organization'},
        {name: 'purpose', display: 'Purpose of Visit'}
    ];
    var user;
    var deliverMethod = ['NO_DELIVERY', 'EMAIL', 'SMS', 'EMAIL_AND_SMS'];
    init();

    function init() {
        user = {
            'firstName': '',
            'lastName': '',
            'email': '',
            'phone': '',
            'organization': '',
            'purpose': '',
            'groupId': 0,
            'policy': 'GUEST',
            'deliverMethod': 'NO_DELIVERY'
        };
    }

    function saveUser(user) {
        var canceller = $q.defer();
        var request = $http({
            url: "/api/identity/credentials",
            method: "POST",
            data: {hmCredentialsRequestVo: user},
            timeout: canceller.promise
        });
        var promise = request.then(
            function (response) {
                if (response.data.error) return response.data;
                else {
                    return response.data;
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
        getUser: function () {
            return user;
        },
        getUserFieldsToDisplay: function () {
            return userFieldsToDisplay;
        },
        getDeliverMethod: function () {
            return deliverMethod;
        },
        saveUser: saveUser,
        clear: init
    }
});
