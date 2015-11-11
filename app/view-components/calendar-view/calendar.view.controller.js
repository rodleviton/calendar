export default calendarViewComponent => {

  calendarViewComponent.controller('CalendarController', CalendarController);

  CalendarController.$inject = ['$log', '$stateParams', '$timeout', 'ChartService'];

  /* @ngInject */
  function CalendarController($log, $stateParams, $timeout, ChartService) {
    var vm = this;
    var DAYS_OF_WEEK = [1, 2, 3, 4, 5, 6, 0];

    vm.activeYear = $stateParams.year || 2015;
    vm.activate = activate;
    vm.getCalendar = getCalendar;
    vm.getHolidays = getHolidays;
    vm.getStartDay = getStartDay;
    vm.getDaysInFebruary = getDaysInFebruary;
    vm.getCurrentDay = getCurrentDay;

    vm.activate();

    /////////////////////////////////////

    function getDaysInFebruary(year) {
      return new Date(year, 2, 0).getDate();
    }

    function getStartDay(month, year) {
      return new Date(year, month, 0).getDay();
    }

    function getCurrentDay() {
      var today = new Date();
      var dd = today.getDate();
      var mm = today.getMonth() + 1;
      var yyyy = today.getFullYear();

      return (yyyy + '-' + mm + '-' + dd);
    }

    function getCalendar() {
      var calendar = require('./config/calendar.json');

      // Calculate start day index of month
      angular.forEach(calendar, function (item, index) {
        item.startIndex = vm.getStartDay(index, vm.activeYear);
      });

      // Calculate days in February
      calendar[1].days = vm.getDaysInFebruary(vm.activeYear);

      return calendar;
    }

    function getHolidays() {
      return require('./config/events.json');
    }

    function activate() {
      vm.config = {
        calendar: vm.getCalendar(),
        year: vm.activeYear,
        events: vm.getHolidays(),
        currentDate: vm.getCurrentDay()
      };

      // $timeout(function() {
      //   vm.config.events = require('./config/events-02.json');
      //   ChartService.markEvents();
      // }, 5000);
    }

  }
};
