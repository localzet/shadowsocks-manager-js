/*
 * @package     ShadosSocks Manager
 * @link        https://github.com/localzet/shadowsocks-manager-js
 * @link        https://github.com/shadowsocks/shadowsocks-manager
 *
 * @author      Ivan Zorin <creator@localzet.com>
 * @copyright   Copyright (c) 2018-2024 Zorin Projects S.P.
 * @license     https://www.gnu.org/licenses/agpl-3.0 GNU Affero General Public License v3.0
 *
 *              This program is free software: you can redistribute it and/or modify
 *              it under the terms of the GNU Affero General Public License as published
 *              by the Free Software Foundation, either version 3 of the License, or
 *              (at your option) any later version.
 *
 *              This program is distributed in the hope that it will be useful,
 *              but WITHOUT ANY WARRANTY; without even the implied warranty of
 *              MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *              GNU Affero General Public License for more details.
 *
 *              You should have received a copy of the GNU Affero General Public License
 *              along with this program.  If not, see <https://www.gnu.org/licenses/>.
 *
 *              For any questions, please contact <creator@localzet.com>
 */

const app = angular.module('app');

app.directive('focusMe', ['$timeout', $timeout => {
  return {
    restrict: 'A',
    link: ($scope, $element) => {
      $timeout(() => {
        $element[0].focus();
      });
    }
  };
}]);

app.directive('scroll', [() => {
  return {
    restrict: 'A',
    link: () => {
      const targetMove = () => {
        const fabNumberElement = angular.element(document.querySelector('.md-fab-number'));
        if(!fabNumberElement.hasClass('md-fab-number-scroll')) {
          fabNumberElement.addClass('md-fab-number-scroll');
          setTimeout(() => {
            fabNumberElement.removeClass('md-fab-number-scroll');
          }, 5500);
        }
      };
      angular.element(document.querySelector('.scroll-container'))
      .bind('mousewheel', () => { targetMove(); })
      .bind('touchmove', () => { targetMove(); });
    }
  };
}]);

app.directive('ga', () => {
  return {
    restrict: 'E',
    scope: {
      adClient: '@',
      adSlot: '@',
      adFormat: '@',
    },
    template: `
      <span ng-if="show">
      <script async src="//pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"></script>
      <ins class="adsbygoogle"
        style="display:block"
        data-ad-client="{{ adClient || 'ca-pub-5143063449426529' }}"
        data-ad-slot="{{ adSlot || '4410958191' }}"
        data-ad-format="{{ adFormat || 'auto' }}"
        data-full-width-responsive="true"></ins>
      </span>
    `,
    controller: ['$scope', '$timeout', ($scope, $timeout) => {
      $scope.show = Math.random() >= 0.95;
      if($scope.show) {
        $timeout(function () {
          (window.adsbygoogle = window.adsbygoogle || []).push({});
        });
      }
    }]
  };
});
