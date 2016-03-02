var identity = angular.module("identity", ["ngRoute", 'ui.bootstrap', 'smart-table']);

identity.config(function ($routeProvider) {
    $routeProvider
        .when("/credentials", {
            templateUrl: "/web-app/views/credentials.html",
            controller: "CredentialsCtrl"
        })
        .when("/create/account", {
            templateUrl: "/web-app/views/create.html",
            controller: "NewCtrl"
        })
        .when("/create/bulk", {
            templateUrl: "/web-app/views/create.html",
            controller: "BulkCtrl"
        })
        .when("/import", {
            templateUrl: "/web-app/views/import.html",
            controller: "ImportCtrl"
        })
        .otherwise({
            redirectTo: "/credentials/"
        })
});


identity.factory("userTypesService", function () {
    var userTypes = [
        {name: "CLOUD_PPSK", selected: true},
        {name: "CLOUD_RADIUS", selected: true}
    ];
    return {
        getUserTypes: function () {
            return userTypes;
        },
        getArrayForRequest: function () {
            var arrayForRequest = [];
            userTypes.forEach(function (userType) {
                if (userType.selected) arrayForRequest.push(userType.name);
            });
            if (arrayForRequest.length === userTypes.length) return [];
            else return arrayForRequest;
        }
    }
});

identity.factory("userGroupsService", function ($http) {
    var enableEmailApproval;
    var userGroups = [];
    var isLoaded = false;

    return {
        init: function () {
            return $http
                .post("/api/userGroup")
                .then(function (response) {
                    enableEmailApproval = response.data.enableEmailApproval;
                    response.data.userGroups.forEach(function (group) {
                        group["selected"] = true;
                        userGroups.push(group);
                    });
                    isLoaded = true;
                    return userGroups;
                });
        },
        getUserGroups: function () {
            return userGroups;
        },
        getEmailApprouval: function () {
            return enableEmailApproval;
        },
        isLoaded: function () {
            return isLoaded;
        },
        getArrayForRequest: function () {
            var arrayForRequest = [];
            userGroups.forEach(function (userGroup) {
                if (userGroup.selected) arrayForRequest.push(userGroup.id);
            });
            if (arrayForRequest.length === userGroups.length) return [];
            else return arrayForRequest;
        }
    }
});

identity.factory("credentialsService", function ($http, $rootScope, userTypesService, userGroupsService) {
    var isLoaded = false;

    return {
        getCredentials: function () {
            var params = {
                'credentialType': userTypesService.getArrayForRequest(),
                'userGroup': userGroupsService.getArrayForRequest()
            };

            isLoaded = false;

            return $http({
                url: "/api/credentials",
                method: "POST",
                data: params
            })
                .then(function (response) {
                    var credentials = [];

                    response.data.forEach(function (credential) {
                        credentials.push(credential);
                    });
                    isLoaded = true;
                    return credentials;
                });
        },
        isLoaded: function () {
            return isLoaded;
        }
    };
});

identity.controller("credentialsRefreshCtrl", function ($scope, credentialsService) {
    $scope.click = function () {
        credentialsService.getCredentials();
    }
});
identity.controller("CredentialsCtrl", function ($scope, userTypesService, userGroupsService, credentialsService) {

    $scope.userTypes = userTypesService.getUserTypes();

    userGroupsService.init().then(function (promise) {
        $scope.userGroups = promise;
        credentialsService.getCredentials().then(function (promise) {
            $scope.credentials = promise;
            $scope.$watch('userTypes', function () {
                credentialsService.getCredentials().then(function (promise) {
                    $scope.credentials = promise;
                });
            }, true);
            $scope.$watch('userGroups', function () {
                credentialsService.getCredentials().then(function (promise) {
                    $scope.credentials = promise;
                });
            }, true);
        });
    });

    $scope.$watch("userGroups", function () {
        $scope.userGroupsLoaded = function () {
            return userGroupsService.isLoaded();
        };
    });
    $scope.$watch("credentials", function () {
        $scope.credentialsLoaded = function () {
            return credentialsService.isLoaded()
        };
    });



});
identity.filter("ssidStringFromArray", function () {
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
identity.filter("userType", function () {
    return function (input) {
        if (input === "CLOUD_PPSK") return "PPSK";
        else if (input === "CLOUD_RADIUS") return "RADIUS";
        else return "";
    }
});
identity.filter("userGroup", function (userGroupsService) {
    return function (input) {
        var groups = userGroupsService.getUserGroups();
        var groupName = "";
        groups.forEach(function (group) {
            if (group.id === input) groupName = group.name;
        });
        return groupName;
    }
});


identity.directive("sub-create", function () {

});

identity.controller("HeaderCtrl", function ($scope, $location) {
    $scope.appDetails = {};

    $scope.nav = {};
    $scope.nav.isActive = function (path) {
        if (path === $location.path()) return true;
        else return false;
    }
});


identity.controller('ModalAboutCtrl', function ($scope, $uibModal) {

    $scope.animationsEnabled = true;

    $scope.open = function (size) {

        var modalInstance = $uibModal.open({
            animation: $scope.animationsEnabled,
            templateUrl: 'modalAboutContent.html',
            controller: 'ModalInstanceCtrl',
            size: size
        });

    };


});

// Please note that $uibModalInstance represents a modal window (instance) dependency.
// It is not the same as the $uibModal service used above.

identity.controller('ModalInstanceCtrl', function ($scope, $uibModalInstance) {

    $scope.close = function () {
        $uibModalInstance.close('cancel');

    };
});
