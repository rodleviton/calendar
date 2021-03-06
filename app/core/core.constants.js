/* global gapi:false  */
export default appCore => {
  appCore
  .constant('gapi', gapi)
  .constant('DEFAULTS', {
    'MONTH_LABELS': [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December'
    ],
    'DAYS_OF_WEEK': [
      'Sunday',
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday'
    ]
  });
};
