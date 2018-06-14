
$(document).ready(function() {
    resaltarLink();
});

$(document).ready(function() { 
/* redondea las esquinas de los elementos img metiéndolas en un wrapper
div con esquinas transparentes (no anda en IE6, hay que modificar el 
script para que cuando es IE6 use unos gif en vez de png) */
    $('img.rounded').one('load',function () {
        var img = $(this);
        var img_width = img.width();
        var img_height = img.height();
        
        // build wrapper
        var wrapper = $('<div class="rounded_wrapper"></div>');
        wrapper.width(img_width);
        wrapper.height(img_height);
        
        // move CSS properties from img to wrapper
        wrapper.css('float', img.css('float'));
        img.css('float', 'none')
        
        wrapper.css('margin-right', img.css('margin-right'));
        img.css('margin-right', '0')

        wrapper.css('margin-left', img.css('margin-left'));
        img.css('margin-left', '0')

        wrapper.css('margin-bottom', img.css('margin-bottom'));
        img.css('margin-bottom', '0')

        wrapper.css('margin-top', img.css('margin-top'));
        img.css('margin-top', '0')

        wrapper.css('display', 'block');
        img.css('display', 'block')

        // wrap image
        img.wrap(wrapper);
        
        // add rounded corners
        img.after('<div class="tl"></div>');
        img.after('<div class="tr"></div>');
        img.after('<div class="bl"></div>');
        img.after('<div class="br"></div>');
    }).each(function(){
        if(this.complete) $(this).trigger("load");
    });
    
});


function resaltarLink() {
/* Identifica el elemento de la barra de navegacion que apunta a esta
pagina y lo desactiva, le agrega una class linkActivo que lo resalte y
le cambia el cursor */

    // obtiene el nombre del html de esta pagina
    var URIParts = window.location.pathname.split( '/' );
    var linkLocal = URIParts[URIParts.length - 1];

    // quita la class linkActivo a todos los elementos (hay dos al hacer reload)
    $('#nav a').removeClass('linkActivo'); 

    // aplica la class linkActivo al elemento que apunta a esta pagina
    $('#nav a[href=\"' + linkLocal + '\"]').addClass('linkActivo'); 

/* lo de abajo debe hacerse mostrando u ocultando el submenu cuando
el parent tiene la clase linkActivo, asi es automatico */ 
    // si es el muestrario de colores despliega el sub-menu
    if(linkLocal == 'muestrario.html') {
        $('#navColores').slideDown('slow');
    } else {
        $('#navColores').hide();
    };

    // si son las tablas de medidas despliega el sub-menu
    if(linkLocal == 'medidas.html') {
        $('#navMedidas').slideDown('slow');
    } else {
        $('#navMedidas').hide();
    };
};
