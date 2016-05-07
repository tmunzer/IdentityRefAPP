angular.module('Create').controller("CreateCtrl", function ($scope, $rootScope, $location, userGroupsService, createService, credentialsService) {
    var requestForUserGroups = null;
    var initialized = false;

    if (initialized) requestForUserGroups.abort();
    requestForUserGroups = userGroupsService.getUserGroups();
    requestForUserGroups.then(function (promise) {
        initialized = true;
        if (promise && promise.error) $scope.$broadcast("apiError", promise.error);
        else {
            $scope.userGroups = angular.copy(promise.userGroups);
        }
    });

    var masterBulk = {
        prefix: "",
        prefixIsNotValid: true,
        domain: "",
        domainIsNotValid: true,
        result: false,
        numberOfAccounts: 0,
        maxNumberOfAccounts: 1000
    };
    $scope.bulk = angular.copy(masterBulk);

    $scope.bulkResultHeaders = [];
    $scope.bulkResult = [];
    $scope.bulkError = [];
    var masterUser = newUser.getUser();

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
        return $scope.user.groupId === id;
    };
    $scope.selectUserGroup = function (id) {
        if ($scope.user.groupId === id) $scope.user.groupId = 0;
        else $scope.user.groupId = id;
    };

    $scope.displayUserDetails = function (path) {
        //return !!((path === $location.path().toString().split("/")[2]) && $scope.user.groupId !== 0);
        return !!((path === $location.path().toString().split("/")[2]));
    };

    $scope.displayBulkResult = function () {
        return ($scope.bulk && $scope.bulk.result);
    };
    $scope.displayBulkError = function () {
        return $scope.bulkError.length > 0;
    };
    $scope.$watch("user.deliverMethod", function (newVal) {
        $scope.disableEmail = false;
        $scope.disablePhone = false;
        if (newVal.toString() === "EMAIL") {
            $scope.usernameField('email');
            $scope.username.email = true;
            $scope.disableEmail = true;
        } else if (newVal.toString() === "SMS") {
            $scope.usernameField('phone');
            $scope.username.phone = true;
            $scope.disablePhone = true;
        } else if (newVal.toString() === "EMAIL_AND_SMS") {
            $scope.usernameField('phone');
            $scope.username.email = true;
            $scope.username.phone = true;
            $scope.disableEmail = true;
            $scope.disablePhone = true;
        } else {
            $scope.deliverMethod = false;
        }
    });

    $scope.$watch("bulk.prefix", function () {
        var re = /^([0-9a-zA-Z_\-.]{2,})$/i;
        $scope.bulk.prefixIsNotValid = !(re.test($scope.bulk.prefix));
    });
    $scope.$watch("bulk.domain", function () {
        var re = /^(?!:\/\/)([a-zA-Z0-9]+\.)?[a-zA-Z0-9][a-zA-Z0-9-]+\.[a-zA-Z]{2,6}?$/i;
        $scope.bulk.domainIsNotValid = !(re.test($scope.bulk.domain));
    });

    $scope.isNotValid = function (creationType) {
        if (creationType === "single") {
            if ($scope.user.deliverMethod == "EMAIL") return $scope.user.email == "";
            if ($scope.user.deliverMethod == "SMS") return $scope.user.phone == "";
            if ($scope.user.deliverMethod == "EMAIL_AND_SMS") return ($scope.user.email == "" && $scope.user.phone == "");
            else return ($scope.user.email == "" && $scope.user.phone == "");
        }
        else if (creationType === "bulk") {
            return (
            $scope.bulk.prefixIsNotValid ||
            $scope.bulk.domainIsNotValid);
        }
    };

    $scope.usernameField = function (field) {
        $scope.username[field] = true;
    };
    $scope.reset = function (creationType) {
        if (creationType === "single" || !creationType) {
            if ($scope.user && $scope.user.groupId > 0) {
                var groupId = $scope.user.groupId;
                $scope.user = angular.copy(masterUser);
                $scope.user.groupId = groupId;
            } else {
                $scope.user = angular.copy(masterUser);
            }
        } else if (creationType === 'bulk' || !creationType) {
            $scope.bulk = angular.copy(masterBulk);
        }
    };
    $scope.save = function (creationType) {
        if (creationType === "single") {
            newUser.saveUser($scope.user).then(function (promise) {
                if (promise && promise.error) {
                    $rootScope.$broadcast("apiWarning", promise.error);
                } else {
                    console.log(promise);
                    $rootScope.$broadcast('newSingle', promise);
                }
            });
        } else if (creationType === "bulk") {
            $scope.bulk.result = true;
            var requestForCredentials = credentialsService.getCredentials();
            requestForCredentials.then(function (promise) {
                if (promise && promise.error) $scope.$broadcast("apiError", promise.error);
                else {
                    var credentials = promise;
                    var createdAccountsInitiated = 0;
                    $scope.createdAccountsFinished = 0;
                    var currentAccount = 1;
                    var stringAccount = "";
                    var alreadyExists;
                    while (createdAccountsInitiated < $scope.bulk.numberOfAccounts) {
                        alreadyExists = false;
                        var fillingNumber = "";
                        for (var j = 5; j > currentAccount.toString().length; j--) {
                            fillingNumber += "0";
                        }
                        stringAccount = $scope.bulk.prefix + '_' + fillingNumber + currentAccount + '@' + $scope.bulk.domain;
                        credentials.forEach(function (credential) {
                            if (credential.userName === stringAccount) alreadyExists = true;
                        });
                        if (!alreadyExists) {
                            createdAccountsInitiated++;
                            newUser.saveUser({
                                groupId: $scope.user.groupId,
                                email: stringAccount,
                                policy: "GUEST",
                                'deliverMethod': 'NO_DELIVERY'
                            }).then(function (promise2) {
                                if (promise2 && promise2.error) {
                                    $scope.bulkError.push(promise2.error);
                                } else {
                                    if ($scope.bulkResultHeaders.length == 0) {
                                        for (var key in promise2) {
                                            $scope.bulkResultHeaders.push(key);
                                        }
                                    }
                                    $scope.bulkResult.push(promise2);
                                    $scope.createdAccountsFinished++;

                                }
                            });
                        }
                        currentAccount++;

                    }
                }
            });
        }
    };
    $scope.getBulkExportHeader = function () {
        return $scope.bulkResultHeaders;
    };
    $scope.bulkExport = function () {
        if ($scope.bulkResult) {
            return $scope.bulkResult;
        }
    };
    $scope.reset();
});
