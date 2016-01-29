(function () {
    'use strict';

    var globalTimeOut = 10000;

    var app = angular.module('app');

    app.service('saveDataService', function ($http, $timeout, Blob, FileSaver) {
        var self = this;
        self.saveProfilesUids = function(profiles) {
            console.log('saveAll');

            var text = '';
            var index, length, profile, uid;
            
            length = profiles.length;
            for (index = 0; index < length; index += 1) {
                uid = profiles[index];
                text +=  uid + '\n';
            }

            var data = new Blob([text], { type: 'text/plain;charset=utf-8' });
            $timeout(FileSaver.saveAs.bind(FileSaver, data, 'profiles.csv'), 100);
        }
        
    })
})();


