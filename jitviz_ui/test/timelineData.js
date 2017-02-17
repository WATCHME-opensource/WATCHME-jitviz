var DH = require('../lib/widgets/DataHandler');
var testData = require('./helpers/data.helpers');

describe('Timeline data handler', function ()
{
    it('should exist', function ()
    {
        expect(DH.timeline).toBeDefined();
    });

    it("can set data", function() {
        DH.timeline.setData(testData.timeline._data);
        expect(DH.timeline.isDataAvailable()).toBe(true);
    });

    it("has data with 6 roles", function() {
        expect(DH.timeline.getRoles().length).toBe(6);
    });

    it("can parse EPA data", function() {
        DH.timeline._selectedRoleIndex = 0;
        var epas = DH.timeline.getEPAs();
        expect(Object.keys(epas).length).toBe(4);
        expect(epas['EPA 4'].description).toBe('Pathological examination');

    });

    it("can sort EPA levels", function(){
        var epas = DH.timeline.getEPAs();
        var sorted = DH.timeline.getEpaLevelsSortedByDate();
        expect(sorted.length).toBe(Object.keys(epas).length);
    });

    it("can get chart data with colors", function(){
        var data = DH.timeline.getChartData();
        $.each(Object.keys(data.xs), function(idx,val){
            expect(data.colors[val]).toBeDefined();
        });
    });

});


describe('Current Performance data handler', function ()
{
    it('should exist', function (){
        expect(DH.currentPerformance).toBeDefined();
    });

    it("can set data", function(){
        DH.currentPerformance.setData(testData.currentPerformance._data);
        expect(DH.currentPerformance.isDataAvailable()).toBe(true);
    });

    it("can format data for charts", function(){
        DH.currentPerformance._selectedRoleIndex = 1;
        var data = DH.currentPerformance.getChartData();
        expect(data.categories.length).toBe(data.personalScores.length);
    });
});

