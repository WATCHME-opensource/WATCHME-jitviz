var _epaTerms = ["tasks", "epas"];
var _piTerms = ["performance_indicators", "competencies"];

var _educations = {
    'example-school': {
        name: 'EXAMPLE SCHOOL',
        hasRoles: true,
        hasAverage: false,
        terminology: {
            epa: _epaTerms[0],
            pi: _piTerms[0]
        }
    }
};

var sub = function(group, idx) {
    var sp = subPalette[group];
    return sp[idx % sp.length];
}

var palette = [
    { 'class': 'color-one', 'primary': "#0072BC"},
    { 'class': 'color-two','primary': "#39B54A"},
    { 'class': 'color-three','primary': "#92278F"},
    { 'class': 'color-four','primary': "#9E0039"},
    { 'class': 'color-five','primary': "#D1AB14"}
];

var subPalette = [
    ["#6EBEF3", "#009AFE", "#0B5F96", "#063E62", "#0D3046"],
    ["#28F001", "#21CB00", "#23910D", "#27611B", "#0A3901"],
    ["#EF83FC", "#D002E8", "#941AA3", "#63266D" ,"#40024A"],
    ["#FE488A", "#AE325F", "#BC0245", "#8A0132", "#56001F"],
    ["#F7C600", "#CEA500", "#AD7A00", "#965501", "#783600"]
];


exports.palette = function(idx, subIdx) {
    var group = idx % palette.length;
    if (typeof subIdx === "undefined") {
        return palette[group];
    } else {
        return sub(group, subIdx);
    }
}

exports.hasAverage = function (education) {
    return _educations[education].hasAverage;
};

exports.hasRoles = function (education) {
    return _educations[education].hasRoles;
};

exports.terminology = function (education) {
    return _educations[education].terminology;
};
