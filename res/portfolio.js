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

    // on scroll, make the top fixed heading dissapear
    $( window ).scroll(
      function(){

        var position = $(this).scrollTop();
        var opacity;
        if( position > 200 ) {
          opacity = 0;
        } else if( position < 10 ) {
          opacity = 1;
        } else {
          opacity = 1 / ( position * position / 8000 );
        };
        $( '.fixedHeader' ).css( 'opacity', opacity );
        if( opacity === 0 ){ // move it out of the way
          $( '.fixedHeader' ).css( 'margin-top', -1000 );
        } else {
          $( '.fixedHeader' ).css( 'margin-top', 0 );
        };
      }
    );

    // activate zoom of certificate thumbnails
    $( '.certifThumbnail' ).on(
      'click',
      function( event ){
        var $theCertificate = $( event.target ).parent();
        $theCertificate.toggleClass( 'active' );
        if( $theCertificate.hasClass( 'active' ) ) {
          $theCertificate.css( 'max-height', $(window).height() + 'px' );
          $( 'body' ).css( 'background-color', 'rgba(80,80,80,.5)' );
          $theCertificate.attr( 'title', 'click again to close' );
        } else {
          $theCertificate.css( 'max-height', '' );
          $( 'body' ).css( 'background-color', '' );
          $theCertificate.attr( 'title', 'click to see the certificate' );
        };
      }
    );
    

});
