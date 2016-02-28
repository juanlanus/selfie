
  $(document).ready(function () {
    
    // set close button
    $( '<div>' )
    .addClass( 'closeButton' )
    .attr( 'title', 'close this window and return to the index' )
    .click( function( event ){
      if( event.which === 1 ){
        window.close();
      }
    })
    .prependTo( $( 'body' ) );

  });
