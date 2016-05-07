angular.module("CustomFilters", []);
angular.module('Monitor', []);
angular.module('Credentials', []);
angular.module("Create", []);
angular.module("Import", []);
var identity = angular.module("identity",
    ["ngRoute",
        'ui.bootstrap',
        'ngSanitize',
        'ngCsv',
        'ngMaterial',
        'ngMessages',
        'md.data.table',
        'CustomFilters',
        'Monitor',
        'Credentials',
        'Create',
        'Import']);

identity
    .config(function ($mdThemingProvider) {
        $mdThemingProvider.theme('default')
            .primaryPalette("blue")
            .accentPalette('green', {
                'default': '400' // by default use shade 400 from the pink palette for primary intentions
            });
    });


identity.factory("userTypesService", function () {
    var userTypes = [
        {name: "CLOUD_PPSK", selected: false},
        {name: "CLOUD_RADIUS", selected: false}
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

identity.factory("userGroupsService", function ($http, $q) {
    var enableEmailApproval;
    var userGroups;
    var isLoaded = false;
    var promise = null;

    function init() {
        userGroups = [];
    }

    init();

    function getUserGroups() {
        init();

        var canceller = $q.defer();
        var request = $http({
            url: "/api/identity/userGroup",
            method: "POST",
            timeout: canceller.promise
        });
        if (promise) promise.abort();
        promise = request.then(
            function (response) {
                if (response.data.error) return response.data;
                else {
                    enableEmailApproval = response.data.enableEmailApproval;
                    response.data.userGroups.forEach(function (group) {
                        group["selected"] = false;
                        userGroups.push(group);
                    });
                    isLoaded = true;
                    return {userGroups: userGroups, reqId: response.data.reqId};
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
        getUserGroups: getUserGroups,
        getEmailApprouval: function () {
            return enableEmailApproval;
        },
        getUserGroupName: function (groupId) {
            var groupName = "";
            userGroups.forEach(function (group) {
                if (group.id === groupId) groupName = group.name;
            });
            return groupName;
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

identity.factory("exportService", function () {
    var exportFields = [
        {name: 'userName', selected: true, display: "User Name"},
        {name: 'email', selected: true, display: "Email"},
        {name: 'phone', selected: true, display: "Phone"},
        {name: 'organization', selected: true, display: "Organization"},
        {name: 'groupId', selected: true, display: "Group ID"},
        {name: 'groupName', selected: true, display: "Group Name"},
        {name: 'credentialType', selected: true, display: "Credential Type"},
        {name: 'createTime', selected: true, display: "Create Time"},
        {name: 'activeTime', selected: true, display: "Active Time"},
        {name: 'expireTime', selected: true, display: "Expire Time"},
        {name: 'lifeTime', selected: true, display: "Life Time"},
        {name: 'ssids', selected: true, display: "SSIDs"},
        {name: 'visitPurpose', selected: true, display: "Visit Purpose"}
    ];
    return {
        getFields: function () {
            return exportFields;
        }
    }
});


identity.factory("deleteUser", function ($http, $q) {

    function deleteCredentials(ids) {

        var canceller = $q.defer();
        var request = $http({
            url: "/api/identity/credentials",
            method: "DELETE",
            params: {ids: ids},
            timeout: canceller.promise
        });
        var promise = request.then(
            function (response) {
                if (response && response.data && response.data.error) return response.data;
                else return response;
            },
            function (response) {
                if (response.status >= 0) {
                    console.log("error");
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
        deleteCredentials: deleteCredentials
    }
});


identity.controller("HeaderCtrl", function ($scope, $location) {
    $scope.appDetails = {};

    $scope.nav = {};
    $scope.nav.isActive = function (path) {
        if (path === $location.path().toString().split("/")[1]) return true;
        else return false;
    };
    $scope.subnav = {};
    $scope.subnav.isActive = function (path) {
        if (path === $location.path().toString().split("/")[2]) return true;
        else return false;
    }
});
identity.directive('fileChange', ['$parse', function ($parse) {
    return {
        require: 'ngModel',
        restrict: 'A',
        link: function ($scope, element, attrs, ngModel) {
            var attrHandler = $parse(attrs['fileChange']);
            var handler = function (e) {
                $scope.$apply(function () {
                    attrHandler($scope, {$event: e, files: e.target.files});
                });
            };
            element[0].addEventListener('change', handler, false);
        }
    }
}]);


identity.controller('ModalCtrl', function ($scope, $rootScope, $mdDialog) {
    $rootScope.displayed = false;
    $scope.$on('apiError', function (event, apiError) {
        if (!$rootScope.displayed) {
            $rootScope.displayed = true;
            $mdDialog.show({
                controller: 'DialogController',
                templateUrl: 'views/modalErrorContent.html',
                escapeToClose: false,
                locals: {
                    items: {
                        apiErrorStatus: apiError.status,
                        apiErrorMessage: apiError.message,
                        apiErrorCode: apiError.code
                    }
                }
            }).then(function () {
                $rootScope.displayed = false;
            });
        }
    });
    $scope.$on('apiWarning', function (event, apiWarning) {
        if (!$rootScope.displayed) {
            $rootScope.displayed = true;
            $mdDialog.show({
                controller: 'DialogController',
                templateUrl: 'views/modalWarningContent.html',
                escapeToClose: false,
                locals: {
                    items: {
                        apiWarningStatus: apiWarning.status,
                        apiWarningMessage: apiWarning.message,
                        apiWarningCode: apiWarning.code
                    }
                }
            }).then(function () {
                $rootScope.displayed = false;
            });
        }
    });
    $scope.$on('createSingle', function (event, account) {
        if (!$rootScope.displayed) {
            $rootScope.displayed = true;
            $mdDialog.show({
                controller: 'DialogController',
                templateUrl: 'views/modalSingleContent.html',
                locals: {
                    items: {
                        loginName: account.loginName,
                        password: account.password,
                        ssid: account.ssid,
                        startTime: account.startTime,
                        endTime: account.endTime,
                        authType: account.authType
                    }
                }
            }).then(function () {
                $rootScope.displayed = false;
            });
        }
    });

    $scope.open = function (template, items) {
        var modalTemplateUrl = "";
        var controller = "";
        switch (template) {
            case 'about':
                controller = "DialogController";
                modalTemplateUrl = 'modalAboutContent.html';
                break;
            case 'export':
                controller = 'DialogExportController';
                modalTemplateUrl = 'views/modalExportContent.html';
                break;
            case 'exportBulk':
                controller = "DialogExportController";
                modalTemplateUrl = 'views/modalBulkContent.html';
                break;
        }
        $mdDialog.show({
            controller: controller,
            templateUrl: modalTemplateUrl,
            escapeToClose: false,
            locals: {
                items: items
            }
        });
    };
});


identity.controller('DialogController', function ($scope, $mdDialog, items) {
    // items is injected in the controller, not its scope!
    $scope.items = items;
    $scope.close = function () {
        // Easily hides most recent dialog shown...
        // no specific instance reference is needed.
        $mdDialog.hide();
    };
});

identity.controller('DialogExportController', function ($scope, $mdDialog, items) {
    // items is injected in the controller, not its scope!
    $scope.credentials = items.credentials;
    $scope.exportFields = items.exportFields;
    $scope.close = function () {
        // Easily hides most recent dialog shown...
        // no specific instance reference is needed.
        $mdDialog.hide();
    };
    $scope.getExportHeader = function () {
        var header = [];
        $scope.exportFields.forEach(function (field) {
            if (field.selected) header.push(field.name);
        });
        header[0] = '#' + header[0];
        return header;
    };
    $scope.export = function () {
        if ($scope.credentials) {
            var exportData = [];
            $scope.credentials.forEach(function (credential) {
                var user = {};
                $scope.exportFields.forEach(function (field) {
                    if (field.selected) user[field.name] = credential[field.name];
                });
                exportData.push(user);
            });
            return exportData;
        }
    };


    $scope.getExportHeaderBulk = function () {
        $scope.exportFields[0] = '#' + $scope.exportFields[0];
        return $scope.exportFields;
    };
    $scope.exportBulk = function () {
        if ($scope.credentials) {
            return $scope.credentials;
        }
    };
});