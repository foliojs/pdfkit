$(function() {
    
    var sections = $("a[name]");
    
    window.onhashchange = function() {
        $("a.selected").removeClass("selected");
        $("a[href=" + location.hash + "]").addClass('selected');
    }
    
    $(window).bind("mousewheel DOMMouseScroll", function() {
        var scrollTop = $(window).scrollTop() + document.documentElement.clientHeight / 3,
            section = null,
            link = null;
            
        for(var i = 0, len = sections.length; i < len; i++) {
            var top = sections.eq(i).offset().top;
                
            if(i < len - 1) {
                var nextTop = sections.eq(i + 1).offset().top;
                if(scrollTop > top && scrollTop < nextTop) {
                    var section = sections[i].name;
                    break;
                }
            }
        }
        
        if(!section) {
            section = sections[len - 1].name;
        }
        
        link = $("a[href$=#" + section + "]");
        if(!link.hasClass('selected')) {
            $("a.selected").removeClass('selected');
            link.addClass('selected');
        }
    });
    
});