// means that it is already displayed and sticks to the screen
var sticky = false;
var delta = 10;
var pop;
var close;

var forceHidePopup = function() {
    pop.hide();
    if ( sticky ) {
        close();
    }
};

exports.initialize = function() {
    var headline = $('<div>');
    headline.append($('<h3 id="pop-headline" style="float:left;width:80%;margin-bottom: 0">')).append($('<h3 class="popup-close" style="float:right;width:20%;text-align:right;margin-bottom: 0">[X]</p>'));
    pop = $('<div id="pop-up">').append(headline).append($('<div id="pop-content" style="clear:both">'));
    pop.hide();
    var container = $('.viz-component');
    container.append( pop );
    pop.on('mousedown', function(e){
        e.stopPropagation();
    });
    container.on('mousedown', function() {
        if(pop.is(":visible")) {
            forceHidePopup();
        }
    });
};

exports.showPopup = function( e, title, content ) {
    if ( sticky ) return;
    exports.setPopupText(title, content);

    // check for line width crossing
    var left = e.offsetX +100;
    var top = e.offsetY;

    var containerWidth = pop.parent().width();

    if((left + pop.width()) + delta > containerWidth ) {
        left = e.offsetX - pop.width() - 20 - delta;
    }

    pop.css('top', top).css('left', left).show();
};

exports.setPopupText = function( title, content ) {
    pop.find('#pop-headline').text( title );
    pop.find('#pop-content').html( content );
};

exports.hidePopup = function() {
    if ( !sticky ) {
        forceHidePopup();
    }
};

exports.stick = function(whenClose) {
    if ( sticky ) return;
    sticky = true;
    close = function() {
        sticky = false;
        $('.popup-close').unbind('click.close');
        $('div#pop-up').hide();
        if ( whenClose ) {
            whenClose();
        }
    };
    $('.popup-close').bind('click.close', close).css('cursor', 'pointer');
};
