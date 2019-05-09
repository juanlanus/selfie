  $(function() {

    var hb = hb || {};

    // create and display TOC
    $('#tocContainer').tocBuilder({ 
      type: 'headings', 
      backLinkText: 'TOC', 
      startLevel: 2, 
      endLevel: 6
    });

    // prevent TOC links from changing the location hash
    // TODO: anyway, should add the position changes to history
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

    // on scroll, make the top fixed heading dissapear
    $( window ).scroll(
      function(){
        // $( '.fixedHeader' ).css( 'opacity', '0.1' );
        if ($(this).scrollTop() > 60 ) {
          $('.fixedHeader').slideUp( 555 );
        } else {
          $('.fixedHeader').slideDown( 222 );
    }
      }
    );

    // build minimenu inside <div class="miniMenu">
    var mmItems = [
      { text:'index', href:'index.html' },
      { text:'notas', href:'notas.html' },
      { text:'descripción', href:'concepto.html' }
    ];
    var $mm = $( '<ul />' );
    for( var i = 0; i < mmItems.length; i++ ){
      console.log( mmItems[i].text + '\t' + mmItems[i].href );
      $mm.append( $( '<li><a href="' + mmItems[i].href + '">' + mmItems[i].text + '</a></li>' ) );
    };
    $( '.miniMenu' )
      .empty()
      .append( $mm );

    // display file timestamp
    hb.displayFileTimestamp = function() {
    };

    // add one leading zero
    function addLeadingZero( n ){
      if( n < 10 ){
        return '0' + n;
      } else {
        return '' + n;
      }
    };

    // display file timestamp
    // TODO: check if server is sending the date in the response headers, if it's not
    // then use the date stored by Amaya, if not available then show nothing
    var now = new Date();
    var t = new Date(Date.parse(document.lastModified));
    var tx = '' 
    tx += t.getFullYear() + '-' 
    tx += addLeadingZero( (t.getMonth() + 1) ) + '-' 
    tx += addLeadingZero( t.getDate() ) + ' ' 
    tx += t.getHours() - 3 + ':' 
    tx += addLeadingZero( t.getMinutes() );
    // don't overwrite Amaya's save date
    $('#fileTimestamp').text(tx);

    /*************************** USE CASES ********************************/
    // activate extensions toggler
    // The use-case extensions toggler:a button that hides/displays extensions
    // The extensions are the ol's in the main success scenario with type="a"
    if( $('.uc-mainSuccessScenario ol[type="a"]').length ){

      // create button
      $( '<div id="uc-extensionsToggler" />' )
      .append( '<button type="button">toggle<br>extensions</button>' )
      .insertAfter( $( '#uc-mainSuccessScenario > h5' ) );

      // bind action to button
      $('#uc-extensionsToggler button').on(
        'click', 
        function(event) {
          $('.uc-mainSuccessScenario ol[type="a"]').toggle(200);
        } 
      );
    };

    // show extension in a different color
    $('.uc- ol[type="a"]').css('color', 'rgb(80,80,80)'); 

    // display selected UC items
    var uc_itemsVisibility = [
      { itemId:'uc-brief', visible:true },
      { itemId:'uc-preconditions', visible:false },
      { itemId:'uc-primaryActor', visible:true },
      { itemId:'uc-level', visible:false },
      { itemId:'uc-trigger', visible:false },
      { itemId:'uc-successEnd', visible:false },
      { itemId:'uc-failedEnd', visible:false },
      { itemId:'uc-mainSuccessScenario', visible:true }
    ];
    for( var i = 0; i < uc_itemsVisibility.length; i++ ){
      var oneItem = uc_itemsVisibility[i];
      var $uc_element = $( '#' + oneItem.itemId );
      if( $uc_element.length ){
         $uc_element.css( 'display', oneItem.visible ? 'block' : 'none' );
      }
    };

    // set initial extensions visibility
    var uc_extensionsVisibility = false;
    $('.uc-mainSuccessScenario ol[type="a"]')
    .css( 'display', uc_extensionsVisibility ? 'block' : 'none' );

  });
