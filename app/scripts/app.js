(function () {
    'use strict';

    var _templateBase = './scripts';

    // if (window.location.host !== 'skiflab.ru') {
    //     return;
    // }

    angular.module('app', [
        'ngRoute',
        'ngMaterial',
        'ngAnimate',
        'ngFileSaver',
    ])
    .config(['$routeProvider','$httpProvider', function ($routeProvider, $httpProvider) {
            $httpProvider.defaults.timeout = 350;
            $routeProvider.when('/groupLoader', {
                templateUrl: _templateBase + '/groupLoader/groupLoader.html' ,
                controller: 'loaderController',
                controllerAs: '_ctrl'
            });
            $routeProvider.when('/liker', {
                templateUrl: _templateBase + '/liker/liker.html' ,
                controller: 'likerController',
                controllerAs: '_ctrl'
            });
            $routeProvider.when('/reader', {
                templateUrl: _templateBase + '/wallReader/wallReader.html' ,
                controller: 'wallReaderController',
                controllerAs: '_ctrl'
            });
            $routeProvider.when('/postLoader', {
                templateUrl: _templateBase + '/postLoader/postLoader.html' ,
                controller: 'postLoaderController',
                controllerAs: '_ctrl'
            });
            $routeProvider.otherwise({ redirectTo: '/groupLoader' });

            $httpProvider.interceptors.push( httpDelay );
            function httpDelay( $timeout, $q ) {
                    var delayInMilliseconds = 350;
                    // Return our interceptor configuration.
                    return({
                        response: response,
                        responseError: responseError
                    });
                    // PUBLIC METHODS.
                    // I intercept successful responses.
                    function response( response ) {
                        var deferred = $q.defer();
                        $timeout(
                            function() {
                                deferred.resolve( response );
                            },
                            delayInMilliseconds,
                            // There's no need to trigger a $digest - the view-model has
                            // not been changed.
                            false
                        );
                        return( deferred.promise );
                    }
                    // I intercept error responses.
                    function responseError( response ) {
                        var deferred = $q.defer();
                        $timeout(
                            function() {
                                deferred.reject( response );
                            },
                            delayInMilliseconds,
                            // There's no need to trigger a $digest - the view-model has
                            // not been changed.
                            false
                        );
                        return( deferred.promise );
                    }
                  }
        }
    ]);

})();
