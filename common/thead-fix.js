/**
 * Created by wangyg on 2018/5/1.
 *
 * depending on jQuery.
 * ref: https://embed.plnkr.co/k7ipmtXkpL0MDT9KGZbc/
 */

$( document ).ready(function() {
    $("table").wrap("<div id='table-auto-wrapper'></div>");

    var targetHeight = document.documentElement.clientHeight - $($("thead")[0]).offset().top;

    //add css
    $("#table-auto-wrapper").css({
        "max-height": targetHeight+"px",
        "overflow":"auto"
    });

    // add srcoll handler
    var tableCont = document.querySelector('#table-auto-wrapper');
    function scrollHandle (e){
        var scrollTop = this.scrollTop;
        this.querySelector('thead').style.transform = 'translateY(' + scrollTop + 'px)';
    }
    tableCont.addEventListener('scroll',scrollHandle)
});