/* Close button:
 * Add a close button at the upper right corner of the page
 * that closes it when clicked. 
 * Self contained: the script, the CSS and the "x" image are
 * all defined in this single file. 
 */

$(document).ready(function () {
  
  // set close button if window is script-closable
  if ( window.opener ){
    $( '<div>' )
    .addClass( 'closeButton' )
    .attr( 'title', 'close this window\nand return' )
    .click( function( event ){
      if( event.which === 1 ){
        window.close();
      }
    })
    .prependTo( $( 'body' ) );

    const closeButtonDataURL = 'url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAMAAACdt4HsAAAAA3NCSVQICAjb4U/gAAAACXBIWXMAAC2SAAAtkgFnQ8SbAAAAGXRFWHRTb2Z0d2FyZQB3d3cuaW5rc2NhcGUub3Jnm+48GgAAADxQTFRF////AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAKNcQVgAAABN0Uk5TAHBxcnN0dXZ3eIeIiYqLjI2Oj9yYE0oAAAFbSURBVFjDpdXbcsIwDIRhhxzsqqVA9v3ftRcMxRittBlyifT9MIOTlPK89qlIVzP/8x2QCg0w4qVCA9zCDkiFet8z4tNCfewZ8UmhPveM+LCw9XtGfFDYXveMeFpYxz0jnhTW9z0j3i2s3p4R7xQWf8/KBKlAPL6KVpi5lwqhFwqJTwunzCcFwYcFyQeFSfO8oPqDBccfKrj+QIF4uUC9WAi8VAi9UEh8Wkh9UhB8WJB8UBA9DzTNs/tXLQReKoQeqJmfgY8KqU8Kggc27hfFBwXRA6vvV9WTwgHvFg55YBn9Rhbpi2XR/Ikfzbn3lXupEHqhULOFOf6Clv/EsCD4sMD88DexYz4Vkzwt3IpfUI/qrRS3oN4s1/vEJO8Uro/JUKAPjOHAX54Tk/xQuPSTrhA+NLtD+/s6Mcl3hfM4Mcn/F87vEwOkV1cDgB9vYuLLswHf/sTE13fr/R+daqFXuzNwZQAAAABJRU5ErkJggg==);';

    $( 'head' )
    .append( `<style>.closeButton { background-size:cover; background-image:${ closeButtonDataURL }
      background-repeat:no-repeat; border:6px solid transparent; border-radius:6px;
      background-color:rgb(240,240,240); height:32px; width:32px;
      position:fixed; top:0; right:0; opacity:0.4; z-index:999; } 
    .closeButton:hover { opacity:1; }</style>` );

  }
});
