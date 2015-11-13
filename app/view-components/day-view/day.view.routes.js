export default dayViewComponent => {

  dayViewComponent.run(appRun);

  appRun.$inject = ['routerHelper'];

  /* @ngInject */
  function appRun(routerHelper) {
    routerHelper.configureStates(getStates());
  }

  function getStates() {
    return [
    {
      state: 'calendar.month.day',
      config: {
        url: '/:day',
        template: '<day-view></day-view>'
      }
    }];
  }
};