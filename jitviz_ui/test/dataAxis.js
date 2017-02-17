var common = require('../lib/widgets/common');
var graph = require('./helpers/data.helpers').graph;

describe('The data axis calculator', function ()
{
    it('should exist', function ()
    {
        expect(common.dateAxis).toBeDefined();
    });
});

describe('range is less than a week', function() {
    it('should return true when min date is 2015-03-01 and max date is 2015-03-06', function() {
        expect(common.dateAxis.rangeIsLessThanAWeek(new Date('2015-03-01'), new Date('2015-03-06'))).toBe(true);
    });

    it('should return true when min date and max date are the same', function() {
        expect(common.dateAxis.rangeIsLessThanAWeek(new Date('2015-03-01'), new Date('2015-03-01'))).toBe(true);
    });

    it('should return false when difference is exactly a week', function() {
        expect(common.dateAxis.rangeIsLessThanAWeek(graph.getEarliestDate(), graph.getEarliestDatePlusAWeek())).toBe(false);
    });
});

describe('range is less than a month', function(){
    it('should return true when difference is exactly a week', function() {
        expect(common.dateAxis.rangeIsLessThanAMonth(graph.getEarliestDate(), graph.getEarliestDatePlusAWeek())).toBe(true);
    });

    it('should return true when difference is exactly a short month', function() {
        expect(common.dateAxis.rangeIsLessThanAMonth(graph.getEarliestDate(), graph.getEarliestDatePlusAShortMonth())).toBe(true);
    });
    it('should return false when difference is exactly a long month', function() {
        expect(common.dateAxis.rangeIsLessThanAMonth(graph.getEarliestDate(), graph.getEarliestDatePlusALongMonth())).toBe(false);
    });
});

describe('range is less than six month', function(){
    it('should return true when difference is exactly a long month', function() {
        expect(common.dateAxis.rangeIsLessThanSixMonths(graph.getEarliestDate(), graph.getEarliestDatePlusALongMonth())).toBe(true);
    });

    it('should return false when difference is exactly six month', function() {
        expect(common.dateAxis.rangeIsLessThanSixMonths(graph.getEarliestDate(), graph.getEarliestDatePlusSixMonths())).toBe(false);
    });
});

describe('Week tick values', function() {
    it('should start with a date less than the earliest date', function() {
        var firstTickValue = common.dateAxis.createWeekTickValues(graph.getEarliestDate())[0];

        expect(new Date(firstTickValue)).toBeLessThan(new Date(graph.getEarliestDate()));
    });

    it('should end with a date equal to the earliest date plus one week', function() {
        var tickValues = common.dateAxis.createWeekTickValues(graph.getEarliestDate());
        var lastTickValue = tickValues[tickValues.length -1];

        expect(new Date(lastTickValue)).toEqual(new Date(graph.getEarliestDatePlusAWeek()));
    });
});

describe('Month tick values', function() {
    it('should start with a date less than the earliest date', function(){
        var firstTickValue = common.dateAxis.createMonthTickValues(graph.getEarliestDate())[0];

        expect(new Date(firstTickValue)).toBeLessThan(new Date(graph.getEarliestDate()));
    });

    it('should end with a date later than the earliest date plus a month', function() {
        var tickValues = common.dateAxis.createMonthTickValues(graph.getEarliestDate());
        var lastTickValue = tickValues[tickValues.length -1];

        expect(new Date(lastTickValue)).toBeGreaterThan(new Date(graph.getEarliestDatePlusALongMonth()));
    });
});

describe('Half year tick values', function() {
    it('should start with a date less than the earliest date', function() {
        var firstTickValue = common.dateAxis.createHalfYearTickValues(graph.getEarliestDate())[0];

        expect(new Date(firstTickValue)).toBeLessThan(new Date(graph.getEarliestDate()));
    });

    it('should end with a date equal to the earliest date plus six months', function() {
        var tickValues = common.dateAxis.createHalfYearTickValues(graph.getEarliestDate());
        var lastTickValue = tickValues[tickValues.length -1];

        expect(new Date(lastTickValue)).toEqual(new Date(graph.getEarliestDatePlusSixMonths()));
    });
});

describe('All time tick values', function() {
    it('should start with a date less than the earliest date', function() {
        var firstTickValue = common.dateAxis.createAllTimeTickValues(graph.getEarliestDate(), graph.getLatestDate())[0];

        expect(new Date(firstTickValue)).toBeLessThan(new Date(graph.getEarliestDate()));
    });

    it('should end with a date later than the latest date', function() {
        var tickValues = common.dateAxis.createAllTimeTickValues(graph.getEarliestDate(), graph.getLatestDate());
        var lastTickValue = tickValues[tickValues.length -1];

        expect(new Date(lastTickValue)).toBeGreaterThan(graph.getLatestDate());
    });
});

describe('calculate min date', function() {
    it('should find the earliest date in the data structure', function() {
        expect(common.dateAxis.calculateMinDate(graph.withMinDateInFirstColumn())).toEqual(graph.getEarliestDate());
    });

    it('should find the earliest date in the data structure even if it is not in the first column', function() {
        expect(common.dateAxis.calculateMinDate(graph.withMinDateInLastColumn())).toEqual(graph.getEarliestDate());
    });
});

describe('calculate max date', function() {
    it('should find the latest date in the data structure', function() {
        expect(common.dateAxis.calculateMaxDate(graph.withMaxDateInFirstColumn())).toEqual(graph.getLatestDate());
    });

    it('should find the latest date in the data structure even if it is not in the first column', function() {
        expect(common.dateAxis.calculateMaxDate(graph.withMaxDateInLastColumn())).toEqual(graph.getLatestDate());
    });
});
