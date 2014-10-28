angular.module('timesheetApp').config(function ($provide) {
    $provide.factory('urls', function () {
        var environment = "PRD";
        var urls = {
            customers: {
                all: "customers/all",
                trackedTimeAndCustomer: "customers/trackedTimeAndCustomer",
                updateCustomerForTrackedTime: "customers/updateCustomerForTrackedTime",
                copyReferencedTrackedTime: "customers/copyReferencedTrackedTime",
                deleteReferencedTrackedTime: "customers/deleteReferencedTrackedTime"
            },
            absencerights: {
                index: 'timeandwork/absencerights',
                detail: 'timeandwork/absencerights/'
            },
            holidays: {
                index: 'timeandwork/holidays',
                detail: 'timeandwork/holidays/'
            },
            activitylog: {
                last20: 'activitylog/last20',
                last12hours: 'activitylog/last12hours'
            },
            saldo: {
                index: 'timeandwork/saldo'
            },
            absences: {
                index: 'timeandwork/absences',
                detail: 'timeandwork/absences/'
            },
            timesheet: {
                info: 'timeandwork/timesheet',
                download: 'timeandwork/timesheet/download'
            },
            absencemanagement: {
                index: 'timeandwork/absencemanagement',
                detail: 'timeandwork/absencemanagement/',
                freeze: 'timeandwork/absencemanagement/freeze',
                getFrozen: 'timeandwork/absencemanagement/frozen'
            }
        };
        var domain = {
            DEV: "http://localhost:3000/",
            PRD: 'http://timesheetservice.herokuapp.com/'
        };
        var completeUrls = {};

        for (var prop in urls) {
            if (urls.hasOwnProperty(prop)) {
                var entity = urls[prop]
                completeUrls[prop] = {};
                for (var action in entity) {
                    if (entity.hasOwnProperty(action)) {
                        completeUrls[prop][action] = domain[environment] + urls[prop][action];
                    }
                }
            }
        }

        console.log(completeUrls);
        return completeUrls;
    });
});
