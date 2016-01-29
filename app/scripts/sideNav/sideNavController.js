(function () {
    'use strict';

    angular.module('app')
        .controller('sideNavController', ['$scope','$mdDialog', SideNavController])
        .config(function($mdThemingProvider) {
            // Configure a dark theme with primary foreground yellow
            $mdThemingProvider.theme('docs-dark', 'default')
            .primaryPalette('yellow')
            .dark();
          });

    function SideNavController($scope, $mdDialog) {
        var self = this;
        self.client = {
          uid: 'Задачка',
          name: 'alex@ya.ru',
          subscribe: false,
          avaLink: ''
        };
        self.user = {
            firstName: '',
            lastName: '',
            isLogged: false
        }

        self.authUpdate = function (response) {
            var sessionUser = null;
            if (response) {
                sessionUser = response.session.user;
                console.log(response.session);
                self.user.firstName = sessionUser.first_name;
                self.user.lastName = sessionUser.last_name;
                self.user.isLogged = true;
                $scope.$apply();
            } else {
                console.log('No Login');
            }
        }

        self.vkLogin = function () {
            VK.Auth.login(self.authUpdate);
        }

        self.showGroups = function(ev) {
          $mdDialog.show({
            controller: DialogController,
            templateUrl: './scripts/sideNav/friendsDialog.html',
            parent: angular.element(document.body),
            targetEvent: ev,
            clickOutsideToClose:true
          })
          .then(function(answer) {
            $scope.status = 'You said the information was "' + answer + '".';
          }, function() {
            $scope.status = 'You cancelled the dialog.';
          });
        };

      }

    function DialogController($scope, $mdDialog) {
        $scope.friends = [
          {
            name: 'QiMart',
            group_uid:'qimart',
            photo: 'https://cs7063.vk.me/c629430/v629430899/1ac06/Vd-hDcJddKU.jpg',
            info: 'QiMart — интернет-магазин беспроводных зарядных устройств.',
          },
          {
            name: 'SKIF',
            group_uid: 'ru.skif',
            photo: 'https://pp.vk.me/c627729/v627729899/d87e/6tkW6zC39iM.jpg',
            info: 'SKIF | Комиксы, Игры, Юмор',
          },
          {
            name: 'Sherwoood',
            group_uid: 'sherwoood_club',
            photo: 'https://pp.vk.me/c621816/v621816458/39788/9ZF2JpdbeI4.jpg',
            info: 'SHERWOOOD Кальянный клуб (м.Дубровка) Шервуд',
          },
          {
            name: 'YakYaks',
            group_uid: 'yakyaks',
            photo: 'https://pp.vk.me/c624317/v624317860/ed16/cB1AjO-FBaY.jpg',
            info: 'Yakyak.ru - Непальская одежда из шерсти яка',
          }
        ];
        $scope.hide = function() {
          $mdDialog.hide();
        };
        $scope.cancel = function() {
          $mdDialog.cancel();
        };
        $scope.answer = function(answer) {
          $mdDialog.hide(answer);
        };
    }


})();
