(function () {
    'use strict';

    angular.module('app')
        .controller('oauthClientController', ['$mdDialog', OAuthClientController])
        .config(function($mdThemingProvider) {
            // Configure a dark theme with primary foreground yellow
            $mdThemingProvider.theme('docs-dark', 'default')
            .primaryPalette('yellow')
            .dark();
          });

    function OAuthClientController($mdDialog) {
        var self = this;
        self.client = {
          uid: 'Задачка',
          name: 'alex@ya.ru',
          subscribe: false,
          avaLink: ''
        };
      }

})();
