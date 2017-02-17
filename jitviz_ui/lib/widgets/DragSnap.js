var Pop = require('../widgets/Popup');
var i18n = require("../i18n");
var DH = require('../widgets/DataHandler');

var dist = function (x, y, x0, y0) {
    var X = x - x0;
    var Y = y - y0;
    return Math.sqrt(X * X + Y * Y);
}

exports.dragBehavior = function (data, jitRequester) {
    var classname = ".radar-chart-serie" + (data.numberOfSeries - 1);
    $.each(data.PIs, function (idx, value) {
        var element = $(classname + "[data-id='" + value.name + "']");
        element.mousedown(function (e) { handle_mousedown(e, idx, value.name, value.recommendation); }).css('cursor', 'pointer');
    });
    var showing = false;

    function handle_mousedown(e, idx, name, recommendation) {
        e.preventDefault();
        var that = $(classname + "[data-id='" + name + "']");
        //var originalStyle = that.next().attr('style');
        //that.next().attr('style', originalStyle + " display:none; ");
        var dragging = {};
        dragging.pageX0 = e.pageX;
        dragging.pageY0 = e.pageY;
        dragging.elem = that;
        dragging.offset0 = { 'x': Number(that.attr('cx')) };
        dragging.offset0.y = Number(that.attr('cy'));


        var axis = $('g.axis line')[idx];
        var p1 = { x: Number($(axis).attr('x1')), y: Number($(axis).attr('y1')) };
        var p2 = { x: Number($(axis).attr('x2')), y: Number($(axis).attr('y2')) };
        var dx = p2.x - p1.x;
        var dy = p2.y - p1.y;
        var m = dy / dx;
        var d = Math.sqrt(dx * dx + dy * dy) / 4;
        // line in negative direction
        var d_directed = p2.x < p1.x ? -d : d;

        var minDist = dist(p1.x, p1.y, dragging.offset0.x, dragging.offset0.y);
        var snapPoints = [dragging.offset0];
        for (var i = 1; i < 5; i++) {
            if (i * d > minDist) {
                var sp = calcSnappoint(i, d_directed, m, p1);
                snapPoints.push(sp);
                // draw snappoint
                var circle = makeSVG('circle', { id: 'snap-' + sp.level, cx: sp.x, cy: sp.y, r: 3, stroke: '#FF0000', 'stroke-width': 1, fill: '#BDBDBD' });
                that.after(circle);
                break;
            }
        }

        function handle_dragging(e) {
            var cx = dragging.offset0.x + (e.pageX - dragging.pageX0);
            var cy = dragging.offset0.y + (e.pageY - dragging.pageY0);
            var closestSnapPoint = { idx: 0, dist: dist(dragging.offset0.x, dragging.offset0.y, cx, cy) };
            $.each(snapPoints, function (idx, point) {
                var current = dist(cx, cy, point.x, point.y);
                if (current < closestSnapPoint.dist) {
                    closestSnapPoint = { idx: idx, dist: current };
                }
            });
            var snap = snapPoints[closestSnapPoint.idx];
            $(dragging.elem).attr('cx', snap.x);
            $(dragging.elem).attr('cy', snap.y);
            if (snap.level) {
                // show popup
                Pop.showPopup(e, name + " " + i18n.tr(DH.requester.getLanguage(), "title_jit_feedback"), recommendation);
                showing = true;
                jitRequester(DH.requester.getEPAMap()[name], function(feedback){
                    if ( feedback.epas.length > 0 ) {
                        var message = "";
                        $.each( feedback.epas[0].feedback, function(idx, messages){
                            message += messages.messages[0].text + "<br>";
                        });
                        Pop.setPopupText("JIT Feedback", message);
                    } else {
                        Pop.setPopupText("JIT Feedback", "Currently no feedback is available");
                    }
                });
            } else {
                Pop.hidePopup();
                showing = false;
            }
        }
        function handle_mouseup(e) {
            if (showing) {
                Pop.stick(clear);
            } else {
                Pop.hidePopup();
                clear();
            }
            $('body').off('mousemove', handle_dragging).off('mouseup', handle_mouseup);
        }
        function clear() {
            $(dragging.elem).attr('cx', dragging.offset0.x);
            $(dragging.elem).attr('cy', dragging.offset0.y);
            // set back to original
            $.each(snapPoints, function (idx, sp) {
                if (sp.level) {
                    $('#snap-' + sp.level).remove();
                }
            });
            showing = false;
        }
        $('body').on('mouseup', handle_mouseup).on('mousemove', handle_dragging);
    }
}


var makeSVG = function (tag, attrs) {
    var el = document.createElementNS('http://www.w3.org/2000/svg', tag);
    for (var k in attrs)
        el.setAttribute(k, attrs[k]);
    return el;
}

var calcSnappoint = function (level, d, m, offset) {
    var point = { level: level };
    if (isFinite(m)) {
        point.x = (level * d / Math.sqrt(m * m + 1));
        point.y = m * point.x + offset.y;
        point.x += offset.x;
    } else {
        //vertical axis
        point.x = offset.x;
        point.y = offset.y - level * d;
    }
    return point;
}
