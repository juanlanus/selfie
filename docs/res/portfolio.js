$(function() {

  // create and display TOC
  var $toc = $('#tocContainer');
  if( $toc.length ){ // the TOC container is present

    $('#tocContainer').tocBuilder({ 
      type: 'headings', 
      backLinkText: false, 
      startLevel: 2, 
      endLevel: 3
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
    );
  }

  // on scroll, make the top fixed heading dissapear
  $( window ).scroll(
    function(){

      var position = $(this).scrollTop();
      const $fixedHeader = $( '.fixedHeader' );
      var opacity;
      if( position > 200 ) {
        opacity = 0;
        $fixedHeader.css( 'display', 'none' );
      } else if( position < 10 ) {
        $fixedHeader.css( 'display', 'block' );
        opacity = 1;
      } else {
        opacity = 1 / ( position * position / 8000 );
      }
      $fixedHeader.css( 'opacity', opacity );
      if( opacity === 0 ){ // move it out of the way
        $fixedHeader.css( 'margin-top', -1000 );
      } else {
        $fixedHeader.css( 'margin-top', 0 );
      }
    }
  );

  // activate zoom of certificate thumbnails
  $( '.certifThumbnail' ).on(
    'click',
    function( event ){
      // get a ref to the div containing the certif img
      var $theCertificate = $( event.target );
      event.target.tagName === 'IMG' && ( $theCertificate = $theCertificate.parent() );
      // display as already visited
      $theCertificate.parent().find( 'h4' ).addClass( 'certifAlreadyVisited' );
      // make it focusable
      $theCertificate.attr( 'tab-index', -1 ).focus();
      // show or hide
      $theCertificate.toggleClass( 'active' );
      if( $theCertificate.hasClass( 'active' ) ) {
        // show
        $( 'body' ).css( 'background-color', 'rgba(80,80,80,.5)' );
        $theCertificate.attr( 'title', 'click again to close' );

        // enable closing with esc or enter
        $( document ).on(
          'keyup',
          function( event ){
            var $theCertificate = $( '.certifThumbnail.active' );
            if ( event.keyCode === 27 || event.keyCode === 13 ) {
              // hide
              $theCertificate.toggleClass( 'active' );
              $theCertificate.css( 'max-height', '' );
              $( 'body' ).css( 'background-color', '' );
              $theCertificate.attr( 'title', 'click to see the certificate' );
            }
          }
        );
      } else {
        // hide
        $theCertificate.css( 'max-height', '' );
        $( 'body' ).css( 'background-color', '' );
        $theCertificate.attr( 'title', 'click to see the certificate' );
        $theCertificate.off( 'keyup' );

      }
    }
  );
  


});




