  $(function() {

    // create and display TOC
    var $toc = $('#tocContainer');
    if( $toc.length ){ // the TOC container is present

      $('#tocContainer').tocBuilder({ 
        type: 'headings', 
        backLinkText: 'TOC', 
        startLevel: 2, 
        endLevel: 6
      });

      // prevent TOC links from changing the location hash
      $('#tocContainer a, .tocBackLink').on(
        'click',
        function(e) {
          e.preventDefault();
          // console.log('TOC link clicked ' + e.currentTarget.hash);
          $('body, html').animate({
              'scrollTop': $(e.currentTarget.hash).offset().top - 33
          }, 500);
        }
      )
    };

});
