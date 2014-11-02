'use strict'

angular.module('timesheetApp')
    .directive('fetchicon', ['$http', function ($http) {

        function link(scope, element, attrs) {
            var xhr = new XMLHttpRequest();
            xhr.open('GET', '' + attrs.fetchicon, true);
            xhr.responseType = 'blob';
            xhr.onload = function (e) {
                var img = document.createElement('img');
                img.src = window.URL.createObjectURL(this.response);
                img.width = 32;
                element[0].appendChild(img);
            };

            xhr.send();
        }

        return {
            link: link
        };
    }]);
