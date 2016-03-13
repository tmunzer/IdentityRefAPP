var identity = angular.module("identity", ["ngRoute", 'ui.bootstrap', 'smart-table', 'ngSanitize', 'ngCsv']);

identity.config(function ($routeProvider) {
    $routeProvider
        .when("/credentials", {
            templateUrl: "/web-app/views/credentials.html",
            controller: "CredentialsCtrl"
        })
        .when("/create/:type", {
            templateUrl: "/web-app/views/create.html",
            controller: "NewCtrl"
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

identity.factory("userGroupsService", function ($http) {
    var enableEmailApproval;
    var userGroups = [];
    var isLoaded = false;

    return {
        getUserGroups: function () {
            userGroups = userGroups.slice(0, 0);
            return $http
                .post("/api/identity/userGroup", {cache: true})
                .then(function (response) {
                    if (response.data.error) return response.data;
                    else {
                        enableEmailApproval = response.data.enableEmailApproval;
                        response.data.userGroups.forEach(function (group) {
                            group["selected"] = false;
                            userGroups.push(group);
                        });
                        isLoaded = true;
                        return userGroups;
                    }
                });
        },
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

identity.factory("newUser", function ($http, $q) {
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

identity.factory("credentialsService", function ($http, $q, userTypesService, userGroupsService) {
    var dataLoaded = false;

    function getCredentials() {
        var params = {
            credentialType: userTypesService.getArrayForRequest(),
            userGroup: userGroupsService.getArrayForRequest()
        };
        dataLoaded = false;

        var canceller = $q.defer();
        var request = $http({
            url: "/api/identity/credentials",
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
        getCredentials: getCredentials,
        isLoaded: function isLoaded() {
            return dataLoaded;
        }
    }
});


identity.controller("CredentialsCtrl", function ($scope, userTypesService, userGroupsService, credentialsService, exportService) {
    var requestForCredentials = null;
    var initialized = false;
    $scope.exportFields = exportService.getFields();
    $scope.userTypes = userTypesService.getUserTypes();
    $scope.itemsByPage=10;

    userGroupsService.getUserGroups().then(function (promise) {
        if (promise && promise.error) $scope.$broadcast("apiError", promise.error);
        else {
            $scope.userGroups = promise;
            requestForCredentials = credentialsService.getCredentials();
            requestForCredentials.then(function (promise) {
                initialized = true;
                if (promise && promise.error) $scope.$broadcast("apiError", promise.error);
                else {
                    $scope.credentials = promise;
                    $scope.credentialsMaster = promise;

                }
            });
        }
    });

    $scope.page = function(num){
        $scope.itemsByPage = num;
    };
    $scope.isCurPage = function(num){
        return num === $scope.itemsByPage;
    };

    $scope.$watch('userTypes', function () {
        $scope.refresh();
    }, true);
    $scope.$watch('userGroups', function () {
        $scope.refresh();
    }, true);
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
    $scope.refresh = function () {
        if (initialized) {
            requestForCredentials.abort();
            requestForCredentials = credentialsService.getCredentials();
            requestForCredentials.then(function (promise) {
                if (promise && promise.error) $scope.$broadcast("apiError", promise.error);
                else $scope.credentials = promise;
            });
        }
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

});

identity.controller("NewCtrl", function ($scope, $rootScope, $location, userGroupsService, newUser) {

    userGroupsService.getUserGroups().then(function (promise) {
        if (promise && promise.error) $scope.$broadcast("apiError", promise.error);
        else {
            $scope.userGroups = promise;
        }
    });

    var master = newUser.getUser();
    $scope.userFields = newUser.getUserFieldsToDisplay();
    $scope.deliverMethod = newUser.getDeliverMethod();
    $scope.username = {
        name: false,
        email: true,
        phone: false
    };
    $scope.disableEmail = false;
    $scope.disablePhone = false;
    $scope.selectedUserGroup = function (id) {
        if ($scope.user.groupId === id) return true;
        else return false;
    };
    $scope.selectUserGroup = function (id) {
        if ($scope.user.groupId === id) $scope.user.groupId = 0;
        else $scope.user.groupId = id;
    };

    $scope.displayUserDetails = function (path) {
        if ((path === $location.path().toString().split("/")[2]) && $scope.user.groupId !== 0) return true;
        else return false;
    };

    $scope.$watch("user.deliverMethod", function(newVal){
        $scope.disableEmail = false;
        $scope.disablePhone = false;
        if (newVal.toString() === "EMAIL"){
            $scope.usernameField('email');
            $scope.username.email = true;
            $scope.disableEmail = true;
        } else if (newVal.toString() === "SMS"){
            $scope.usernameField('phone');
            $scope.username.phone = true;
            $scope.disablePhone = true;
        } else if (newVal.toString() === "EMAIL_AND_SMS"){
            $scope.usernameField('phone');
            $scope.username.email = true;
            $scope.username.phone = true;
            $scope.disableEmail = true;
            $scope.disablePhone = true;
        } else {
            $scope.deliverMethod = false;
        }
    });

    $scope.isNotValid = function(){
      if ($scope.username.email || $scope.username.phone) return false;
        else return true;
    };

    $scope.usernameField = function (field){
        $scope.username[field] = true;
    };
    $scope.reset = function () {
        if ($scope.user && $scope.user.groupId > 0) {
            var groupId = $scope.user.groupId;
            $scope.user = angular.copy(master);
            $scope.user.groupId = groupId;
        } else {
            $scope.user = angular.copy(master);
        }
    };
    $scope.save = function () {
        newUser.saveUser($scope.user).then(function (promise) {
            if (promise && promise.error) {
                $rootScope.$broadcast("apiWarning", promise.error);
            } else {
                console.log(promise);
                $rootScope.$broadcast('newSingle', promise);
            }
        });
    };
    $scope.reset();
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
identity.filter("deliverMethod", function () {
    return function (input) {
        var string = input.replace(/_/g, " ");
        return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
    }
});

identity.directive("sub-create", function () {

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


identity.controller('ModalCtrl', function ($scope, $uibModal) {

    $scope.animationsEnabled = true;
    $scope.$on('apiError', function (event, apiError) {
        $scope.apiErrorStatus = apiError.status;
        $scope.apiErrorMessage = apiError.message;
        $scope.apiErrorCode = apiError.code;
        var modaleTemplateUrl = 'views/modalErrorContent.html';
        displayModel(modaleTemplateUrl);

    });
    $scope.$on('apiWarning', function (event, apiWarning) {
        $scope.apiErrorStatus = apiWarning.status;
        $scope.apiErrorMessage = apiWarning.message;
        $scope.apiErrorCode = apiWarning.code;
        var modaleTemplateUrl = 'views/modalWarningContent.html';
        displayModel(modaleTemplateUrl);

    });
    $scope.$on('newSingle', function (event, account) {
        $scope.loginName = account.loginName;
        $scope.password = account.password;
        $scope.ssid = account.ssid;
        $scope.startTime = account.startTime;
        $scope.endTime = account.endTime;
        $scope.authType = account.authType;
        var modaleTemplateUrl = 'views/modalSingleContent.html';
        displayModel(modaleTemplateUrl);

    });
    $scope.open = function (template, size) {
        var modaleTemplateUrl = "";
        switch (template) {
            case 'about':
                modaleTemplateUrl = 'modalAboutContent.html';
                break;
            case 'export':
                modaleTemplateUrl = 'views/modalExportContent.html';
                break;
        }
        displayModel(modaleTemplateUrl, size);

    };
    function displayModel(modaleTemplateUrl, size) {
        var modalInstance = $uibModal.open({
            animation: $scope.animationsEnabled,
            templateUrl: modaleTemplateUrl,
            controller: 'ModalInstanceCtrl',
            scope: $scope,
            size: size
        });
    }

});

// Please note that $uibModalInstance represents a modal window (instance) dependency.
// It is not the same as the $uibModal service used above.

identity.controller('ModalInstanceCtrl', function ($scope, $uibModalInstance) {

    $scope.close = function () {
        $uibModalInstance.close('cancel');

    };
});
