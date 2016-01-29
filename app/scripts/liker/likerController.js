(function () {
    'use strict';

    angular.module('app')
        .controller('likerController', ['$mdDialog','$http', '$timeout', 'FileSaver', 'Blob', LikerController])
        .config(function($mdThemingProvider) {
            // Configure a dark theme with primary foreground yellow
            $mdThemingProvider.theme('docs-dark', 'default')
            .primaryPalette('yellow')
            .dark();
          });

    function LikerController($mdDialog, $http, $timeout) {
        var self = this;
        self.task = {
          title: 'Задачка',
          email: 'Пиши Максу!',
        };
      }

})();
