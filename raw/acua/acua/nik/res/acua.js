
$(document).ready(function() {
    resaltarLink();
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
