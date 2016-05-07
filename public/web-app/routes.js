angular.module('identity').config(function ($routeProvider) {
    $routeProvider
        .when("/monitor", {
            templateUrl: "/web-app/monitor/monitor.html",
            module: "Monitor",
            controller: "MonitorCtrl"
        })
        .when("/credentials", {
            templateUrl: "/web-app/credentials/credentials.html",
            module: "Credentials",
            controller: "CredentialsCtrl"
        })
        .when("/create/:type", {
            templateUrl: "/web-app/create/create.html",
            module: "Create",
            controller: "CreateCtrl"
        })
        .when("/import", {
            templateUrl: "/web-app/import/import.html",
            module: "Import",
            controller: "ImportCtrl"
        })
        .otherwise({
            redirectTo: "/monitor/"
        });
});