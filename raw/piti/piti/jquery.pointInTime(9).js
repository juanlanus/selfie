// piti: point-in-time input
//
// Usage example:
//
//      $('#dateInput').pointInTime( {
//        fieldsActive: ['month', 'date', 'year'], // , 'hour', 'minute', 'second', 'millisecond'],
//        value: new Date(), // initial value: current date (not working yet)
//        formats: { 
//          date: { separator: '/' },
//          year: { minValue:1990, maxValue:2030, separator: '' }
//        }
//      });
//
// This displays a control with month, date and year, leaving out the other elements (time).
// It is possible to choose any combination in any order, including the most ridiculous.
// It also tells to show a "/" after the date (instead of the default two spaces), to show
// an empty separator after the year, and that the year value must be between 1990 and 2030
// inclusive.
// All the properties of the formats object of the defaults can be modified. 
// The control tries to build a JavaScript Date object with the uer input and the defaults,
// the validate function returns it if it's valid else it returns false. 
// The absolute min value id the UNIX epoch, Jan 01, 1970 @00:00:00.000. If only time is
// displayed then the Date object returned will have a usable milliseconds value.
//
// You can access all the plugin properties via the jQuery usual method, like: 
//    $('#dateInput').data('pointInTime').value
// will return the Date object built with the user input, and
//    $('#dateInput').data('pointInTime').validate()
// should return the Date if it's OK else false. 
//
// based on jQuery Plugin Boilerplate version 1.1, May 14th, 2011 by Stefan Gabos
//

;(function ( $, window, document, undefined ) {
  'use strict';

  //==========================================================================================
  // part 1: definition of the plugin constructor
  $.Piti = function( theElement, options ) {

    // to avoid confusion, use "piti" to reference the current instance of the object
    var piti = this;
    // the piti object collects all the plugin members, and will be attached to each
    // target element's .data property; it is passed to the event handlers too

    // plugin's default options
    var defaults = {
      // fields to enable: in any order, omit starting from the less significant
      // (millisecond,  millisecond and second, millisecond second and minute, ...)
      // or omit all date parts (year, month, day) for time-only instances
      // Provide the fields list in fieldsActive, leaving fieldsAll untouched
      fieldsAll: ['year', 'month', 'date', 'hour', 'minute', 'second', 'millisecond', 'picker'],
      // fieldsActive: ['year', 'month', 'date'],
      omittedFieldsDefault: 'low-value',  // fill ommited parts with low or high values
      clsOutOfRange: 'piti_outOfRange',   // values out of range are thus highlighted
      dayOfWeekNames: [ 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday' ], 
      value: undefined,
      beepOnError: false,
      errorMsgHandler: function( errText ) { window.console.log( errText ); }, 
      formats: {
        year:        { length:4, numeric:true, separator:'/', placeholder:'Y     ', minValue:1970, maxValue:9999 },
        month:       { length:2, numeric:true, separator:'/', placeholder:'M   ', minValue:1, maxValue:12 },
        date:        { length:2, numeric:true, separator:'  ', placeholder:'D   ', minValue:1, maxValue:31 },
        hour:        { length:2, numeric:true, separator:':', placeholder:'h', minValue:0, maxValue:23 },
        minute:      { length:2, numeric:true, separator:':', placeholder:'m', minValue:0, maxValue:59 },
        second:      { length:2, numeric:true, separator:'.', placeholder:'s', minValue:0, maxValue:59 },
        millisecond: { length:3, numeric:true, separator:'', placeholder:'ms ', minValue:0, maxValue:999 },
        // formats for not-yet-implemented fields
        ampm:        { length:2, numeric:false, separator:' ', placeholder:'AP', values:['AM','PM'] },
        timezone:    { length:5, numeric:false, separator:' ', placeholder:'tz',
                       values:['ART','CDT','CST','EDT','EST','HADT','HAST','MDT','MST','PDT','PST','Z'] },
        picker:      { numeric:false, defaultValue:true, separator:' ' }
      },
      pitiPickerOptions: {
        hoursList: ['12 am', '01 am', '02 am', '03 am', '04 am', '05 am', '06 am',
        '07 am', '08 am', '09 am', '10 am', '11 am', '12 pm', '01 pm', '02 pm',
        '03 pm', '04 pm', '05 pm', '06 pm', '07 pm', '08 pm', '09 pm', '10 pm',
        '11 pm'],
        // show time picker in addition to date
        showTimePicker: true, // TODO: the false option is not yet implemented
        // the date and time to show initially
        defaultDate: null // set by the constructor
      }
    };

    // inside: piti.settings.propName, outside: element.data('pointInTime').settings.propName
    piti.settings = {};

    piti.element = theElement;
    var $element = $(theElement); // reference to the jQuery version of DOM element

    piti.clicking = false; // used to skip some focus events when clicking the up/down arrows
    piti.wasControlChar = false; // the last keydown event was about a non-printable character
    piti.fieldName = ''; // name of the currently focused input
    piti.format = {}; // format of the currently focused input
    piti.errorText = ''; // last error detected

    piti.value = {}; // object containing the values of each of the datetime parts (month: 1~12)

    piti.setValue = function( dateValue ) {
    // load a date value from a Date object into the control
      if( dateValue instanceof Date ) {
        // it's local time, isn't it?
        piti.value.year = dateValue.getFullYear();
        piti.value.month = dateValue.getMonth() + 1; // month:1~12
        piti.value.date = dateValue.getDate();
        piti.value.hour = dateValue.getHours();
        piti.value.minute = dateValue.getMinutes();
        piti.value.second = dateValue.getSeconds();
        piti.value.millisecond = dateValue.getMilliseconds();
        piti.value.picker = true; // for the validate function
        piti.displayValues();
      } else {
        piti.complain( 'the date value must be a JS Date object, got: ' +
        dateValue.toString() );
      }
    };

    piti.setValueInInput = function( theName, theValue ) {
    // load a (numeric) value into an input control
      // before displaying check that it's visible
      var $theInput = $element.find( 'input.piti_' + theName );
      if( $theInput.length ) {
        $theInput.prop( 'value', theValue );
        piti.leftZeroPad( $theInput[0] );
      }
    };

    piti.displayValues = function() {
    // set all internal values on their own input controls
      var fieldName;
      for( var i = 0; i < piti.settings.fieldsAll.length; i++ ) {
        fieldName = piti.settings.fieldsAll[i];
        piti.setValueInInput( fieldName, piti.value[ fieldName ] );
      }
    };

    // list of keycodes for non-character keystrokes
    piti.controlCharacters = [
        0, // Null
        8, // Backspace
        9, // Tab
       13, // Enter
       16, // Shift
       17, // Control
       18, // Alt
       19, // Pause
       20, // ShiftLock
       27, // esc
       33, // PageUp
       34, // PageDown
       35, // End
       36, // Home
       37, // LeftArrow
       38, // UpArrow
       39, // RightArrow
       40, // DownArrow
       44, // SysReq
       45, // Insert
       46, // Delete
       91, // Windows
       92, // Properties
      112, // F1
      113, // F2
      114, // F3
      115, // F4
      116, // F5
      117, // F6
      118, // F7
      119, // F8
      120, // F9
      121, // F10
      122, // F11
      123, // F12
      144, // NumBlock
      145  // ScrollLock
    ];
    piti.controlCharsMap = [];
    piti.isAControlCharacter = false; // last char seen is not a printable one

    piti.isControlCharacter = function( keyCode ){
    // returns true if the keyCode is among the control characters roster
      if( ! piti.controlCharsMap.length ) {
          piti.controlCharsMap = [];
          for( var icc = 0; icc < piti.controlCharacters.length; icc++ ) {
            piti.controlCharsMap[ piti.controlCharacters[icc] ] = true;
          }
      }
      return !! piti.controlCharsMap[ keyCode ];
    };

    piti.beep = function() {
      var beepSound = new Audio('data:audio/wav;base64,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' +
          'iiFXK///qpoiDXrOgqDR38JB0bw7SoL+ZB9o1RCkQjQ2CBYZKd/+VJxZRRZlqSkKiws0WFxUyCwsKiMy7hUVFhIa' +
          'CrNQsKkTIsLivwKKigsj8XYlwt/WKi2N4d//uQRCSAAjURNIHpMZBGYiaQPSYyAAABLAAAAAAAACWAAAAApUF/Mg' +
          '+0aohSIRobBAsMlO//Kk4soosy1JSFRYWaLC4qZBYWFRGZdwqKiwkNBVmoWFSJkWFxX4FFRQWR+LsS4W/rFRb///' +
          '////////////////////////////////////////////////////////////////////////////////////////' +
          '////////////////////////////////////////////////////////////////////////////////////////' +
          '////////////////////////////////////////////////////////////////////////////////////////' +
          '////////////////////////////////////////////////////////////////////////////////////////' +
          '//////////////////////////////////////////////////////////////VEFHAAAAAAAAAAAAAAAAAAAAAA' +
          'AAAAAAAAAAAAAAAAAAU291bmRib3kuZGUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA' +
          'AAAAAAAAAAMjAwNGh0dHA6Ly93d3cuc291bmRib3kuZGUAAAAAAAAAACU=');
      // These lines are suspected to raise an error in ff:
      // cancel any ongoing beep just before shooting a new one
      // if( ! beepSound.paused ){
      //   beepSound.pause();
      //   beepSound.currentTime = 0;
      // }
      beepSound.play();
    };

    piti.getFormat = function( theInputField ){
    // returns the format object for the given field (element, $element or name)
      var tof = typeof theInputField;
      var fieldName;
      if( tof === 'string' ) {
        // the arg is the input name
        fieldName = theInputField;
      } else if( tof === 'object' ) {
        if( theInputField instanceof jQuery ){
          // is a jQuery object
          fieldName = theInputField.attr( 'content' );
        } else {
          // is a DOM element
          fieldName = theInputField.getAttribute( 'content' );
        }
      }
      return piti.settings.formats[ fieldName ];
    };

    piti.getName = function( theInputField ){
    // returns the name for the given field (element, $element or name)
      var tof = typeof theInputField;
      if( tof === 'string' ) {
        // the arg is the input name
        return theInputField;
      } else if( tof === 'object' ) {
        if( theInputField instanceof jQuery ){
          // is a jQuery object
          return theInputField.attr( 'content' );
        } else {
          // is a DOM element
          return theInputField.getAttribute( 'content' );
        }
      }
      return '';
    };

    piti.leftZeroPad = function( thisInput ){
      var f = piti.getFormat( thisInput );
      while( thisInput.value.length < f.length ) {
        thisInput.value = '0' + thisInput.value;
      }
    };

    piti.buildFakeInput = function( $theInput ) {
    // Builds a span with the desired number of digits and the same
    // styles as the original, in order to find out its width
      var fieldName = piti.getName( $theInput );

      // create the element, detached
      var $theFakeInput = $( '<span style="position:absolute; top:0; left:0;">' +
      new Array( piti.getFormat( fieldName ).length + 1).join( '0' ) + '</span>' );

      // apply the same styles as the input its faking
      var theFontStyles = [
        // all box models: 8 styles
        'font-family',
        'font-size',
        'font-stretch',
        'font-style',
        'font-variant',
        'font-weight',
        'letter-spacing',
        'box-sizing',
        // border-box: a few more styles
        'padding-left',
        'padding-right',
        'border-left-width',
        'border-right-width'
      ];
      // TODO: wrap in try/catch
      var n = ( $theInput.css( 'box-sizing' ) !== 'border-box' ) ? 8 : theFontStyles.length;
      for( var i = 0; i < n; i++ ) {
        $theFakeInput.css( theFontStyles[i], $theInput.css( theFontStyles[i] )); 
      }
      return $theFakeInput;
    };

    piti.getStyle = function(elem, cssStyle){
    // returns the value of a computed CSS style given its name
      var strValue = '';
      if(window.getComputedStyle){
        strValue = getComputedStyle(elem).getPropertyValue(cssStyle);
      } else if (elem.currentStyle){  //IE
        try {
          strValue = elem.currentStyle[cssStyle];
        } catch (e) {}
      }
      return strValue;
    };

    piti.removeErrorHightlight = function( $input ) {
      if( ! $input ) {
        // if no argument then clear all
        $input = $( piti.element ).find( 'input' );
      }
      $input.removeClass( piti.settings.clsOutOfRange );
    };

    piti.hasClass = function( $elem, className1, className2 ) {
    // returns true if $elem has one of the classes in arg2 or optional arg3
      var classes = ' ' + $elem.className.replace( /\s/g, ' ') + ' ';
      if( classes.indexOf( ' ' + className1 + ' ' ) > -1 ||
      ( className2 && classes.indexOf( ' ' + className2 + ' ' ) > -1 ) ) {
        return true;
      } else {
        return false;
      }
    };

    piti.getValue = function( ) {
    // return the Date object if it's OK else false
      piti.validate();
      return piti.date;
    };

    piti.daysInMonth = function(m, y) { // m is 1-base indexed: 1~12
    // returns the number of days in month m of year y
      if( ! m || ! y ) {
        return 31;
      }
      switch ( m ) {
        case 2 : // Feb
          return (y % 4 === 0 && y % 100) || y % 400 === 0 ? 29 : 28;
        case 4 : case 6 : case 9 : case 11 : // Apr Jun Sep Nov
          return 30;
        default :
          return 31;
      }
    };

    piti.fillWithDefault = function fl( theField ) {
    // assign its default value to a field that is not displayed
      theField = piti.getName( theField );
      var f = piti.getFormat( theField );
      // if there is an explicit defaultValue, use it
      if( f.defaultValue !== undefined ) {
        piti.value[ theField ] = f.defaultValue;
      } else {
        // use max or min value
      if( piti.settings.omittedFieldsDefault === 'high-value' ) {
          if( theField === 'date' ) { // calculate max value = number of days in month
          piti.value[ theField ] = piti.daysInMonth( piti.value.month, piti.value.year );
        } else {
          piti.value[ theField ] = f.maxValue;
        }
      } else {
        piti.value[ theField ] = f.minValue;
      }
      }
    };

    piti.validate = function( $input ) {
    // Without argument validate all the inputs and the date as a whole,
    // padding the non-displayed values with low- or high-values as
    // specified and return a date object with the data if OK, else false
    // With argument (reference to one sub-field input) check only the
    // referenced field, return false if the field is in error
      piti.errorText = '';
      piti.settings.errorMsgHandler( '' ); 
      var
        isFullDateCheck = false,
        theFields = [ piti.getName( $input ) ],
        n = 1, i,
        theField,
        theValue,
        f,
        isOK = true
      ;
      if( ! $input ) { // then this one is a full check
        isFullDateCheck = true;
        theFields = piti.settings.fieldsAll;
        n = piti.settings.fieldsAll.length;

        // loop over the full fields list and assign default vals to those not displayed
        for( i = 0; i < n; i++ ) {
          theField = piti.settings.fieldsAll[i];
          f = piti.getFormat( theField );
          if( $.inArray( theField, piti.settings.fieldsActive ) < 0 ){
            // not found = not displayed, assign the default value
            piti.fillWithDefault( theField );
            f.hidden = true;
          }
        }
      }

      // loop over the featured fields and ensure that all have values, the
      // numeric fields are numeric and all are within bounds
      piti.removeErrorHightlight();
      for( i = 0; i < n; i++ ) {
        theField = theFields[i];
        f = piti.getFormat( theField );
        if( f.hidden || theField === 'picker' ) {
          // use the internal value
          theValue = piti.value[ theField ];
        } else {
          // the visible value rulez
          theValue = $element.find( 'input.piti_' + theField ).val();
          piti.value[ theField ] = theValue;
        }

        if( theValue === undefined || theValue === null || theValue === '' ){
          // this item is missing 
          piti.complain( theField + ' is missing' );
          isOK = false;
        } else {
          f = piti.getFormat( theField );
          if( f.numeric ) {
            // check numeric value
            if( ! $.isNumeric( theValue ) ) {
              piti.complain( theField + ' must be numeric but has "' + theValue + '"' );
              isOK = false;
            } else {
              // check range
              if( theValue < f.minValue || theValue > f.maxValue ) {
                piti.complain( theField + ' = ' + theValue + ' is  out of range (' +
                f.minValue + '~' + f.maxValue + ')' );
                isOK = false;
              }
              // TODO: chech value length
              // check number of days if month and year are available
              // TODO: move the code below with last value processing
              if( isOK ) { // only if there is no previous error
                if( piti.value.date > piti.daysInMonth( piti.value.month, piti.value.year ) ) {
                  piti.complain( 'date ' + piti.value.date + ' exceeds month end (' +
                  piti.daysInMonth( piti.value.month, piti.value.year ) + ')' );
                  isOK = false;
                }
              }
            }
          // } else {
            // check non-numeric (enumerated) values
          }
        }
      }
      if( isFullDateCheck ) {
        if( isOK ) {
          // the date is OK, export and return it
          piti.date = new Date( piti.value.year, piti.value.month - 1, piti.value.date,
          piti.value.hour, piti.value.minute, piti.value.second, piti.value.millisecond );
          return piti.date;
        } else {
          piti.date = undefined;
          return false;
        }
      } else {
        return isOK;
      }
    };

    // spinners action
    piti.incrementValue = function( theInput ){
      var v = theInput.value || 0;
      if( $.isNumeric( v )){
        var f = piti.getFormat( theInput );
        if( v < f.maxValue ){
          if( theInput.value === '' ){
            theInput.value = f.minValue.toString();
          } else {
            theInput.value = ( +v + 1 ).toString();
          }
          piti.leftZeroPad( theInput );
        } else {
          piti.complain( piti.getName( theInput ) +
          ': result value would be greater than top value ' + f.maxValue );
        }
      }
    };
    piti.decrementValue = function( theInput ){
      var v = theInput.value || 0;
      if( $.isNumeric( v )){
        var f = piti.getFormat( theInput );
        if( v > f.minValue ){
          theInput.value = ( +v - 1 ).toString();
          piti.leftZeroPad( theInput );
        } else {
          piti.complain(  piti.getName( theInput ) +
          ': result value would be less than min value ' + f.minValue );
        }
      }
    };

    // post an error message, beep
    piti.complain = function( blah ) {
      piti.settings.errorMsgHandler( blah ); 
      piti.errorText = blah;
      if( piti.settings.beepOnError ) {
        piti.beep();
      }
    };


    // ==========================================================================================

    // the "constructor" method that gets called when the object is created
    piti.init = function() {

      piti.settings = $.extend( true, {}, defaults, options );

      piti.value = {};
      if( piti.settings.value instanceof Date ) {
        piti.setValue( piti.settings.value );
      }

      // build the element's UI
      var inputFieldTemplates = {
        container:  '<fieldset class="piti" />',
        year:       '<input type="text" class="piti_year" content="year" />',
        month:      '<input type="text" class="piti_month" content="month" />',
        date:       '<input type="text" class="piti_date" content="date" />',
        hour:       '<input type="text" class="piti_hour" content="hour" />',
        minute:     '<input type="text" class="piti_minute" content="minute" />',
        second:     '<input type="text" class="piti_second" content="second" />',
        millisecond:'<input type="text" class="piti_millisecond" content="millisecond" />',
        timezone:   '<input type="text" class="piti_timezone" content="timezone" />',
        picker:     '<div class="piti_picker" content="picker" />'
      };

      // up/down arrows to increment/decrement numeric values
      var upDownArrows = $(
        // TODO: compute height = the height of the <input> elements
        '<div class="piti_incDec">' +
          '<div class="piti_valueUp" title="click to increment value or use \nthe up arrow or the + keys"></div>' +
          '<div class="piti_valueDown" title="click to decrement value or use \nthe down arrow or the - keys"></div>' +
        '</div>'
      );

      // "picker" subfield: create a button to pop the mouse date and time picker
      function createPickerButton( $newField ){
        $newField.attr( 'title', 'pick from a calendar' );
        piti.value.picker = true; // for the validate function
        $newField.on(
          'click',
          piti,
          function( $e ){
            $e.originalEvent.stopPropagation();
            $e.originalEvent.preventDefault();
            if( ! piti.pitiPicker ) { // the popup is not up
              piti.displayDateAndTimePicker( piti );
            } else {
              piti.complain( 'the time picker is already displayed' );
            }
          }
        );
      }

      // build the container, add a document-unique id
      var $dateContainer = $( inputFieldTemplates.container );
      for(
        var uniqueIdNum = 1;
        piti.id = 'piti_picker_' + uniqueIdNum, document.getElementById( piti.id );
        uniqueIdNum++
      ){}
      $dateContainer.attr( 'id', piti.id );

      // add the requested fields according to the "fieldsActive" option
      if( ! piti.settings.hasOwnProperty( 'fieldsActive' )){
        window.alert( 'this plugin requires a "piti.settings.fieldsActive" array with ' +
        'the names of the featured fields, a subset of the piti.settings.fieldsAll array');
        return false;
      }
      var n = piti.settings.fieldsActive.length;
      var fieldName;
      for (var i = 0; i < n; i++ ) {
        fieldName = piti.settings.fieldsActive[i];

        // create the field
        var $newField = $( inputFieldTemplates[fieldName] );
        var f = piti.getFormat( fieldName );
        $newField.prop( 'size', f.length );
        if( f.numeric ) {
          // numeric input
          $newField.prop( 'placeholder', f.placeholder );
          if( piti.value[ fieldName ] ) {
            $newField.prop( 'value', piti.value[ fieldName ] );
            piti.leftZeroPad( $newField[0] );
          }
        } else if( fieldName === 'picker' ){
          // create a button to show the mouse date and time picker
          createPickerButton( $newField );
        }
        $dateContainer.append( $newField );

        // the separator
        $dateContainer.append( '<span class="piti_sep" style="position:relative;"><span class="piti_sepChar">' +
        f.separator.replace( / /g, '&nbsp;' ) +
        '</span></span>' );

        if( i === (n - 1) ) { // then it's the last field
          f.lastField = true;
        }
      }

      // add all the inputs to the set and nail its width
      $element.empty().append( $dateContainer );
      $dateContainer.css( 'width', $dateContainer.css( 'width' ));

      // add the (hidden) up-down arrows artifact
      $dateContainer.append( upDownArrows.clone( true ) );
      $dateContainer.find( '.piti_incDec' ).css( 'visibility', 'hidden' );

      // recalculate the input field widths
      $dateContainer.prop( 'position', 'relative' );
      var $allInputs = $dateContainer.find( 'input' );
      n = $allInputs.length;
/*    This calculates the exact width needed for each input element to contain
 *    its number of digits. It's disabled because it doesn't work when the 
 *    plugin is used from within the application.
 *    Instead of this, the widths are set witn CSS.
      for ( i = 0; i < n; i++ ) {
        var $theField = $( $allInputs[i] );
        // build a fake input and use it to calculate the exact input width
        var $theFakeInput = piti.buildFakeInput( $theField );
        $theFakeInput.appendTo( $dateContainer );
        $theField.css( 'width', +$theFakeInput.width() + 'px' );
        $theFakeInput.remove();
      }
*/
      $dateContainer.css( 'width', '' );
      $dateContainer.prop( 'position', '' );

      //================================== set event handlers ====================================
      // .on( event [, selector ] [, data = piti ], handler )  pass a reference to the piti object

      // handler: on keydown focusing a numeric input filter the allowed
      // input characters and control codes
      $element.find( 'input' ).on(
        'keydown',
        piti,
        function( $e ){
          var e = $e.originalEvent;
          var theKeyCode = e.keyCode;

          // take note of shift held down (to be able to detect back tab)
          piti.shifting = $e.shiftKey;

          if( ! piti.format.numeric ) {
            // not a numeric input: let go
            return true;
          }

          // check up and down arrows to increment/decrement the value
          if( theKeyCode === 38 ) { // up arrow 38
            piti.incrementValue( this );
            e.preventDefault();
            e.stopPropagation();
            return;
            }
          if( theKeyCode === 40 ) { // down arrow 40
            piti.decrementValue( this );
            e.preventDefault();
            e.stopPropagation();
            return;
            }

          // find out if it's a character or a functional key
          piti.isAControlCharacter = piti.isControlCharacter( theKeyCode );

          // any other chars will be handled in keypress

          return true;
        }
      );

      //  handler: on keypress check for numeric input or +/- keys
      $element.find( 'input' ).on(
        'keypress',
        piti,
        function( $e ){
          var e = $e.originalEvent;
          var theWhich = e.which || e.keyCode; // not jQuery's

          // if the focused field is not a numeric one, let go
          if( ! piti.format.numeric ) {
            return true; 
          }

          // allow control characters
          if( piti.isAControlCharacter ) {
            return true;
          }
          
          // don't do nothing special with modified characters
          if( e.ctrlKey || e.metaKey || e.altKey ) {
            return true;
          }

          // allow plus=43 and minus=45 to increment/decrement the value
          if( theWhich === 43 ) { // plus
            piti.incrementValue( this );
            e.preventDefault();
            e.stopPropagation();
            return;
          }
          if( theWhich === 45 ) { // minus (dash)
            piti.decrementValue( this );
            e.preventDefault();
            e.stopPropagation();
            return;
          }

          // if not a digit complain and seize it
          if( theWhich < 48 || theWhich > 57 ) {
            piti.complain( 'only digits allowed in this field' );
            e.preventDefault();
            e.stopPropagation();
          }

          // at this point the only thing left should be the digits
          return true;
        }
      );

      //  handler: on keyup take note of the shift state
      $element.find( 'input' ).on(
        'keyup',
        piti,
        function( $e ){
          // take note of shift being released
          if( $e.originalEvent.keyCode === 16 ){ // 16 = Shift
            piti.shifting = $e.shiftKey;
          }
        }
      );

      // handler: on input change check the input length
      $element.find( 'input' ).on(
        'input',
        piti,
        function( $e ){
          var $this = $( this );
          // autotab
          if( $e.target.value.length === piti.format.length && ! piti.format.lastField ) {
            $this.nextAll( 'input' )[0].focus();
          } else {
            // if the length is too much complain and stay in this field
            if( $e.target.value.length > piti.format.length ) {
              $this.addClass( piti.settings.clsOutOfRange );
              piti.complain( 'max length for ' + piti.fieldName + ' is ' + piti.format.length +
              ' characters, but it contains ' + $e.target.value.length );
            }
          }
        }
      );

      // when the control gains focus make the spinner visible
      $element.on(
        'focusin',
        piti,
        function( ){
          var $this = $( this );
          $this.find( 'div.piti_incDec' ).css( 'visibility', 'visible' );
        }
      );

      // when the control loses focus hide the spinner and raise a blur-like event
      $element.on(
        'focusout',
        piti,
        function( ){
          var $this = $( this );
          // hide the up-down arrows artifact
          $this.find( 'div.piti_incDec' ).css( 'visibility', 'hidden' );
          // fire the dateReady event
          // TBD
        }
      );

      // handler: on gained focus ...
      $element.find( 'input' ).on(
        'focus',
        piti,
        function( ){
          var $this = $( this );
          $this.removeClass( piti.settings.clsOutOfRange );

          piti.fieldName = this.attributes.content.nodeValue; // TODO: nodeValue is deprecated
          piti.format = piti.getFormat( piti.fieldName );
          if( piti.format.numeric ) {
            piti.spinnerTarget = this;
          }
        }
      );

      $element.find( 'input' ).on(
        'blur',
        piti,
        function( $e ){
          if( $e === null ) { return; }
          // console.log( 'input blur ' + this.attributes.content.nodeValue );
          // don't trigger blur if the click was on an arrow
          if( piti.clicking ) { return false; }

          var $this = $( this );
          // store the current input value
          var fieldName = this.attributes.content.nodeValue; // TODO: nodeValue is deprecated
          piti.value[ fieldName ] = this.value;

          piti.removeErrorHightlight( $this );

          // if the value is empty assign the default value
          if( this.value.length === 0 ) {
            piti.fillWithDefault( $this );
            this.value = piti.value[ fieldName ];
          }

          // validate this field and the full date if this field is the last
          if( piti.validate( $this ) ) {
            piti.leftZeroPad( this );
          } else {
            $this.addClass( piti.settings.clsOutOfRange );
          }
          // tab to outside: check all fields
          if( piti.format.lastField && ! piti.shifting ) {
            piti.validate();
          }
          // piti.format = {};
        }
      );

      // handler: on mousedown in the arrows disable input blur and focus
      $element.on(
        'mousedown',
        function( $e ) {
          piti.clicking = piti.hasClass( $e.target, 'valueUp', 'valueDown' );
        });

      // handler: on mouseup on the arrows re-enable input blur and focus
      $element.on(
        'mouseup',
        function() {
          piti.clicking = false;
          // piti.clicking = ! piti.hasClass( $e.target, 'valueUp', 'valueDown' );
        });

      // handler: click on the up and down arrows to increment/decrement num values
      $element.find( '.piti_incDec' ).on(
        'mousedown',
        function( $e ){
          // skip if not a numeric input
          if( ! piti.format.numeric ) {
            return true; 
          }
          // increase/decrease the active input value
          var $theAssociatedInput = $( piti.spinnerTarget );
          if( piti.hasClass( $e.target, 'piti_valueUp' )) {
              piti.incrementValue( $theAssociatedInput[0] );
              $e.preventDefault();
              $e.stopPropagation();
              $theAssociatedInput.focus(); 
          }
          if( piti.hasClass( $e.target, 'piti_valueDown' )) {
              piti.decrementValue( $theAssociatedInput[0] );
              $e.preventDefault();
              $e.stopPropagation();
              $theAssociatedInput.focus(); 
          }
        }
      );

    };

    piti.displayDateAndTimePicker = function( piti ) {
      // build the popup options object
      // TODO: extend using values from the piti options
      var defaultDate = piti.validate();

      // ref to the piti fieldset that owns this popup
      piti.settings.pitiPickerOptions.piti = piti.id; // the fieldset's id, auto-generated by piti         THIS IS UNDEFINED HERE

      if( defaultDate ) {
        piti.settings.pitiPickerOptions.defaultDate = defaultDate;
      }

      // disable the piti controls and the calendar button
      $( piti.element ).find( 'input' ).prop( 'disabled', 'disabled' );
      // bring up the popup
      piti.pitiPicker = piti.PitiPicker( piti, piti.settings.pitiPickerOptions );
      piti.pitiPicker.init();
    };



    // the PitiPicker class ==============================================================
    piti.PitiPicker = function( piti, pitiPickerOptions ) {

      var pp = {};
      pp.time = new Date( 0 ); // Thu, 01 Jan 1970 00:00:00 GMT

      // all the options come as parameters, no defaults
      pp.config = pitiPickerOptions;
      // quick local ref to the piti control fieldset
      var $piti = $( '#' + pp.config.piti );

      // constructor:
      pp.init = function() {
        // build the popup HTML structure, append to the piti caller
        buildHTML();
        // set the drag and drop time selector
        setDragNDrop();
        // enable selection of a time by clicking the mouse on it
        enableDirectTimeSelection();
        // activate OK and cancel buttons
        activateButtons();
        // enable the mouse wheel for time selection
        enableMouseWheelTime();
        // store a ref to the newly created picker object
        piti.pitiPicker = pp;
        // make it visible
        showCurrentDateTime( pp.config.defaultDate );
        $piti.find( '.piti_pickerDialog' ).slideDown( 150 );
      };

      // display the currently selected date and time in the popup
      var showCurrentDateTime = function( theDate, theTime ) {
        if( theTime ) {
          theDate = new Date( theDate.getDate() + theTime.getDate() );
        }
        // TODO: has to edit the date under control of a parameter
        $piti.find( '.piti_pickerDateDisplay' ).text( theDate.toLocaleString() );
      };

      // build the popup HTML structure, append to the piti caller
      var buildHTML = function() {
        var thePopupHTML = 
        '<div class="piti_pickerDialog">' +
        '  <div class="piti_pickerHeader">' +
        '    <span>Column name - filter reference<\/span>' +
        '  <\/div>' +
        // THE DATE PICKER
        '  <div class="piti_datePicker" />' +
        // THE FEEDBACK DATA
        '  <div class="piti_pickerDateDisplay" />' +
        // THE TIME PICKER
        '  <div class="piti_timePicker" style="display:inline-block; margin-left:10px;">' +
        '    <div  class="piti_timePointer ui-widget-content"><\/div>' +
        '    <ul class="piti_allHours">' +
        // build the hours list after the hoursList config parameter
        (function(){
          var lis = '';
          var h = pp.config.hoursList;
          for( var i = 0; i < h.length; i++ ){
            lis += '<li class="piti_time">' + h[i] + '<\/li>';
          }
          return lis;
        })() +
        '    <\/ul>' +
        '  <\/div>' +
        // THE OK AND CANCEL BUTTONS
        '  <div class="piti_buttons" style="text-align:right;">' +
        '    <button type="button" class="piti_doCancel">Cancel<\/button>' +
        '    <button type="button" class="piti_doOK">Done<\/button>' +
        '  <\/div>' +
        '<\/div>';
        ////////////////////////////////////////// $piti.append( $( thePopupHTML ) );
        $( piti.element ).append(  $( thePopupHTML ) ); //append to the fieldset

        // set the jQuery UI date picker in place
        $piti.find( '.piti_datePicker').datepicker({
          autoSize: true,
          changeMonth: true,
          changeYear: true,
          onSelect: function( theDate, thePicker ) { 
            showCurrentDateTime( theDate );
            thePicker = thePicker; // for JSHint sake
           },
          dateFormat: 'mm/dd/yy',
          defaultDate: pp.config.defaultDate, // inject the date currently in piti control, if any
          gotoCurrent: true,
          maxDate: '12/31/2045', // TODO: express the top date in piti (pass it in the options)
          minDate: '01/01/1930', // TODO: express the bottom date in piti (pass it in the options)
          yearRange: '1990:2030' // TODO: calculate from maxDate and minDate (this is for the years dropdown)
        });
      };


      // set the drag and drop time selector
      var setDragNDrop = function() {

        // position the time cursor in a position proportional to the time,
        // expressed in a Date object with no days
        pp.positionTimeCursor = function( $piti, theTime ) {
          // compute the position like the total height of the slider track
          // divided by total seconds times the time seconds number
          var h = $piti.find( '.piti_allHours' ).height(); // total height in px
          var a = theTime.getTime() / 1000;                // seconds to plot
          var p = h / ( 24 * 60 * 60 ) * a;
          window.console.log( p );
        };

        pp.handleDrag = function( eventTarget, positionTop ) {
          var h = $(eventTarget).parent().find('ul.piti_allHours li').height();
          var i = Math.floor( positionTop / h );
          var $timeCell = $( $( '.piti_allHours li' )[ i ] );
          $piti.find( '.piti_allHours li' ).removeClass( 'piti_timeSelected' );
          $timeCell.addClass( 'piti_timeSelected' );
          // TODO: publish new time value
        };
     
        var hSlider = $( '.piti_timePointer' ).height();
        var h = $( '.piti_allHours li' ).height();
        $( '.piti_timePicker' ).css( 'height', ( 24 * h + ( hSlider / 2 - h ) + 'px' ) );

        // helper    Type: jQuery The jQuery object representing the helper that's being dragged
        // position  Type: Object Current CSS position of the helper as { top, left } object
        // offset    Type: Object Current offset position of the helper as { top, left } object
        $( '.piti_timePointer' ).draggable({
          axis: 'y',
          grid: [ 20, h ],
          containment: 'parent',
          drag: function( event, ui ) {
            pp.handleDrag( event.target, ui.position.top );
          }
        });
      };

      // enable selection of a time by clicking the mouse on it
      var enableDirectTimeSelection = function() {
        $piti.find( '.piti_allHours li' ).on(
          'click',
          function( $e ) {
            // select the clicked time
            var $timeCell = $( $e.target );
            $( '.piti_allHours li' ).removeClass( 'piti_timeSelected' );
            $timeCell.addClass( 'piti_timeSelected' );
            $( '#timeSelected' ).text( $timeCell.text() );
            // reposition the slider: top of the clicked li - top of the ul
            var t = $timeCell[0].offsetTop - $timeCell.parent()[0].offsetTop - 4; // $timeCell.height() / 2;
            // var y = $( '.piti_timePointer' ).position().top;
            $( '.piti_timePointer' ).css( 'top', t );
          }
        );
      };

      // activate OK and cancel buttons
      var activateButtons = function() {
        $piti.find( '.piti_doOK' ).on(
          'click',
          function( $e ) {
            // re-enable the piti controls
            $( piti.element ).find( 'input' ).removeProp( 'disabled' );
            // TODO: pass the current values to the owner piti control
            var datePicked = $piti.find( '.piti_datePicker' ).datepicker( 'getDate' );
            if( datePicked ) {
              $piti.find( '.piti_pickerDateDisplay' ).text( datePicked.toLocaleString() );
            }
            // jQUI-datapicker-whatever.getDate() returns a Date object or null
            // $( '#dateInput' ).data('pointInTime').setValue( new Date( Date.parse( datePicked ) ) );
            // hide and destroy this popup
            $( $e.target ).closest( '.piti_pickerDialog' ).slideUp( 100 ).detach().remove();
            piti.pitiPicker = false;
          }
        );

        $piti.find( '.piti_doCancel' ).on(
          'click',
          function( $e ) {
            // hide this popup
            $( $e.target ).closest( '.piti_pickerDialog' ).slideUp( 100 );
          }
        );

        $( document ).on(
          'keydown',
          function( e ) {
            if ( e.keyCode === 13 ) {
              $piti.find( '.piti_doOK' ).click();
              return false;
            }
            if ( e.keyCode === 27 ) {
              $piti.find( '.piti_doCancel' ).click();
              return false;
            }
          }
        );
      };

      // enable the mouse wheel response
      var enableMouseWheelTime = function(){
        pp.addWheelListener = function( elem ) {
          if (elem.addEventListener) {
            // IE9, Chrome, Safari, Opera
            elem.addEventListener('mousewheel', mouseWheelHandler, false);
            // Firefox
            elem.addEventListener('DOMMouseScroll', mouseWheelHandler, false);
          }
          else {
            // IE 6/7/8
            elem.attachEvent('onmousewheel', mouseWheelHandler);
          }

          function mouseWheelHandler( event ) {
            // cross-browser wheel delta, doubled
            var e = window.event || event; // old IE support
            var delta = 2 * Math.max(-1, Math.min(1, (e.wheelDelta || -e.detail)));

            // move the time picker handle as of delta
            var $theHandle = $piti.find( '.piti_timePointer' );
            var m;
            if( delta > 0 ) {
              // move pointer up decreasing time
              m = $theHandle.position().top - delta;
              if( m < 0 ){
                m = 0;
              } else {
                m = $theHandle.position().top - delta;
              }
            }
            if( delta < 0 ) {
              // move pointer down increasing time
              m = $theHandle.position().top + delta;
              if( m > $theHandle.parent().height() ){
                m = $theHandle.parent().height();
              } else {
                m = $theHandle.position().top - delta;
              }
            }
            $theHandle.css( 'top', m.toString() + 'px');
            pp.handleDrag( $theHandle[0], m );

            e.stopPropagation();
            e.preventDefault();
            return false;
          }
        };

        var $piti = $( '#' + pp.config.piti );
        pp.addWheelListener( $piti.find( '.piti_timePicker' )[0] );
        // pp.addWheelListener( $( piti.element ).find( '.piti_timePicker' )[0] );
      };
      
      //======================================= closure ==========================================
      return pp;
      //==========================================================================================
    };

    // public methods
    // these methods can be called like:
    // piti.methodName(arg1, arg2, ... argn) from inside the plugin or
    // element.data('pointInTime').publicMethod(arg1, arg2, ... argn) from outside 
    // the plugin, where "element" is the element the plugin is attached to;

    // a public method. for demonstration purposes only - remove it!
    // piti.foo_public_method = function() {
        // code goes here
    // };

    // private methods  [ .on( events [, selector ] [, data ], handler ) ]
    // these methods can be called only from inside the plugin like:
    // methodName(arg1, arg2, ... argn)

    // a private method. for demonstration purposes only - remove it!
    // var foo_private_method = function() {
        // code goes here
    // };

    // fire up the plugin!
    // call the "constructor" method
    piti.init();

  };

  //==========================================================================================
  // part 2: add the plugin to the jQuery.fn object and create an instance attached to each
  // of the selected DOM elements (usually only one) that are point-in-time inputs
  $.fn.pointInTime = function( options ) {

    // iterate through the DOM elements we are attaching the plugin to
    return this.each(function() {

      // if plugin has not already been attached to the element
      if ( $(this).data('pointInTime') === undefined ) {

        // create a new instance of the plugin attached to the current DOM element
        var piti = new $.Piti( this, options );

        // in the jQuery version of the element
        // store a reference to the piti object
        // you can later access the piti and its methods and properties like
        // element.data('pointInTime').publicMethod(arg1, arg2, ... argn) or
        // element.data('pointInTime').settings.propertyName
        $(this).data('pointInTime', piti);
      }
    });
  };
})( jQuery, window, document );
