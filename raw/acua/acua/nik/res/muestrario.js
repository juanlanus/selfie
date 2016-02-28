 $(document).ready(function() {
   M.hookPopups();
 });


/* funcionalidad del muestrario */ 
var M = {

/*
    Datos de cada color: 
    código        Identificación del color, por ejemplo "44F"
    imagen        Nombre del archivo, sin path, ej: "44f.jpg"
    nombre        Un texto que describa el color y la superficie
    tipo          Transparente, translúcido, pleno
    tono          Oscuro o "claro", para determinar el color del texto que va sobre la muestra,
                  ej: el n° del color negro debe ir en blanco, y viceversa
    observaciones Cualquier información adicional que el cliente debería ver en el momento de
                  elegir un color, como limitaciones en las medidas, plazos de entrega especiales, etc... 
    grupo         Número de fila de muestras 1, 2, 3, ... donde aparece
    orden         Ordenamiento en su fila de muestras, número no necesariamente consecutivo
    elegido       El programa anota si este color esta entre los elegidos
*/
    codigo: 0,
    imagen: 1,
    nombre: 2,
    tipo: 3,
    tono: 4,
    observaciones: 5,
    grupo: 6,
    orden: 7,
    elegido: 8,

    datosDeLosColores: {
        color_1: ["1", "1.jpg", "Naranja cartel", "pleno", "claro", "", 3, 4500 ],
        color_2: ["2", "2.jpg", "Marron cartel oscuro", "pleno", "oscuro", "", 3, 4000 ],
        color_3: ["3", "3.jpg", "Marron cartel claro", "pleno", "oscuro", "", 3, 3900 ],
        color_4: ["4", "4.jpg", "Amarillo taxi cartel", "pleno", "claro", "", 3, 4400 ],
        color_5: ["5", "5.jpg", "Amarillo McDonald's cartel", "pleno", "claro", "", 3, 4300 ],
        color_6: ["6", "6.jpg", "Bordó cartel", "translúcido", "oscuro", "", 2, 1500 ],
        color_7: ["7", "7.jpg", "Rojo Coca-Cola cartel", "pleno", "claro", "", 3, 4600 ],
        color_8: ["8", "8.jpg", "Verde claro cartel", "pleno", "oscuro", "", 3, 5100 ],
        color_9: ["9", "9.jpg", "Naranja claro", "transparente", "claro", "", 1, 2700 ],
        color_10: ["10", "10.jpg", "Celeste cartel", "pleno", "oscuro", "", 3, 5000 ],
        color_11: ["11", "11.jpg", "Amarillo ambar", "transparente", "claro", "", 1, 2600 ],
        color_12: ["12", "12.jpg", "Azul claro", "transparente", "claro", "", 1, 2300 ],
        color_13: ["13", "13.jpg", "Azul oscuro  ", "transparente", "oscuro", "", 1, 3300 ],
        color_14: ["14", "14.jpg", "Azul oscuro cartel", "pleno", "oscuro", "", 3, 4800 ],
        color_15: ["15", "15.jpg", "Gris cartel", "pleno", "claro", "", 3, 3800 ],
        color_16: ["16", "16.jpg", "Rojo  ", "transparente", "oscuro", "", 1, 2900 ],
        color_17: ["17", "17.jpg", "Blanco iluminación", "translúcido", "claro", "", 2, 100 ],
        color_18: ["18", "18.jpg", "Blanco opal cartel", "pleno", "claro", "", 3, 3700 ],
        color_19: ["19", "19.jpg", "Rubí", "transparente", "oscuro", "", 1, 3000 ],
        color_20: ["20", "20.jpg", "Naranja", "transparente", "claro", "", 1, 2800 ],
        color_21: ["21", "21.jpg", "Negro fijo", "pleno", "oscuro", "", 3, 4100 ],
        color_22: ["22", "22.jpg", "Marrón claro mampara", "translúcido", "claro", "", 2, 400 ],
        color_23: ["23", "23.jpg", "Marrón mampara", "translúcido", "claro", "", 2, 600 ],
        color_24: ["24", "24.jpg", "Gris mampara", "translúcido", "claro", "", 2, 300 ],
        color_25: ["25", "25.jpg", "Rosa mampara", "translúcido", "claro", "", 2, 500 ],
        color_26: ["26", "26.jpg", "Celeste mampara", "translúcido", "claro", "", 2, 1000 ],
        color_27: ["27", "27.jpg", "Verde mampara", "translúcido", "claro", "", 2, 900 ],
        color_28: ["28", "28.jpg", "Marrón oscuro mampara", "translúcido", "oscuro", "", 2, 700 ],
        color_29: ["29", "29.jpg", "Violeta mampara", "translúcido", "claro", "", 2, 1400 ],
        color_30: ["30", "30.jpg", "Amarillo mampara", "translúcido", "claro", "", 2, 800 ],
        color_31: ["31", "31.jpg", "Jazmín mampara", "translúcido", "claro", "", 2, 200 ],
        color_32: ["32", "32.jpg", "Humo tenue", "transparente", "claro", "", 1, 2000 ],
        color_33: ["33", "33.jpg", "Humo claro", "transparente", "oscuro", "", 1, 2100 ],
        color_34: ["34", "34.jpg", "Humo oscuro", "transparente", "oscuro", "", 1, 2200 ],
        color_35: ["35", "35.jpg", "Habano tenue", "transparente", "claro", "", 1, 1900 ],
        color_36: ["36", "36.jpg", "Habano claro", "transparente", "oscuro", "", 1, 1800 ],
        color_37: ["37", "37.jpg", "Habano oscuro", "transparente", "oscuro", "", 1, 1700 ],
        color_38: ["38", "38.jpg", "Tonalidad verde", "transparente", "claro", "", 1, 3400 ],
        color_39: ["39", "39.jpg", "Fantasía cristal", "transparente", "claro", "", 1, 3600 ],
        color_40: ["40", "40.jpg", "Cristal", "transparente", "claro", "", 1, 3500 ],
        color_41: ["41", "41.jpg", "Verde oscuro", "transparente", "oscuro", "", 1, 2500 ],
        color_42: ["42", "42.jpg", "Verde claro  ", "transparente", "oscuro", "", 1, 2400 ],
        color_48: ["48", "48.jpg", "Marfil opal", "pleno", "claro", "", 3, 4200 ],
        color_49: ["49", "49.jpg", "Violeta rojizo opal", "pleno", "oscuro", "", 3, 4700 ],
        color_50: ["50", "50.jpg", "Verde cartel", "pleno", "oscuro", "", 3, 5200 ],
        color_51: ["51", "51.jpg", "Azul opal", "pleno", "oscuro", "", 3, 4900 ],
        color_52: ["52", "52.jpg", "Azul mampara", "translúcido", "claro", "", 2, 1100 ],
        color_53: ["53", "53.jpg", "Violeta", "transparente", "oscuro", "", 1, 3200 ],
        color_54: ["54", "54.jpg", "Rojo cartel", "translúcido", "oscuro", "", 2, 1600 ],
        color_55: ["55", "55.jpg", "Violeta claro", "transparente", "claro", "", 1, 3100 ],
        color_56: ["56", "56.jpg", "Magenta cartel", "translúcido", "oscuro", "", 2, 1300 ],
        color_57: ["57", "57.jpg", "Violeta cartel", "translúcido", "oscuro", "", 2, 1200 ],
        color_117: ["117", "117.jpg", "Blanco iluminación esmerilado", "satinado", "claro", "", 5, 6300 ],
        color_122: ["122", "122.jpg", "Marfil miel esmerilado", "satinado", "claro", "", 5, 6200 ],
        color_125: ["125", "125.jpg", "Rosa esmerilado", "fantasía", "claro", "", 5, 6100 ],
        color_126: ["126", "126.jpg", "Celeste esmerilado", "satinado", "claro", "", 5, 6500 ],
        color_132: ["132", "132.jpg", "Humo tenue esmerilado", "satinado", "claro", "", 5, 6400 ],
        color_138: ["138", "138.jpg", "Verde claro", "satinado", "claro", "", 5, 6600 ],
        color_217: ["217", "217.jpg", "Blanco", "fantasía", "claro", "", 5, 6700 ],
        color_222: ["222", "222.jpg", "Marfin miel", "fantasía", "claro", "", 5, 5800 ],
        color_226: ["226", "226.jpg", "Celeste", "fantasía", "claro", "", 5, 5900 ],
        color_232: ["232", "232.jpg", "Humo tenue", "fantasía", "claro", "", 5, 6000 ],
        color_43F: ["43F", "43F.jpg", "?", "fluorescente", "claro", "", 4, 5300 ],
        color_44F: ["44F", "44F.jpg", "?", "fluorescente", "claro", "", 4, 5400 ],
        color_45F: ["45F", "45F.jpg", "?", "fluorescente", "claro", "", 4, 5500 ],
        color_46F: ["46F", "46F.jpg", "?", "fluorescente", "claro", "", 4, 5600 ],
        color_47F: ["47F", "47F.jpg", "?", "fluorescente", "claro", "", 4, 5700 ],
        color_1001: ["1001", "1001.jpg", "?", "bijouterie", "claro", "", 8, 8100 ],
        color_1002: ["1002", "1002.jpg", "?", "bijouterie", "claro", "", 8, 8100 ],
        color_1003: ["1003", "1003.jpg", "?", "bijouterie", "claro", "", 8, 8100 ],
        color_1004: ["1004", "1004.jpg", "?", "bijouterie", "claro", "", 8, 8100 ],
        color_1005: ["1005", "1005.jpg", "?", "bijouterie", "claro", "", 8, 8100 ],
        color_1006: ["1006", "1006.jpg", "?", "bijouterie", "claro", "", 8, 8100 ],
        color_1056: ["1056", "1056.jpg", "?", "bijouterie", "claro", "", 8, 8100 ],
        color_58:   ["58", "58.jpg", "?", "bijouterie", "claro", "", 8, 8100 ]  
    },

    /* eleccion de un color: el usuario pica sobre una muestrita y el color elegido
    se muestra mas grande, con todos sus datos, en la barra de la derecha */
    elegirUnColor: function (colorId) {

        // referencia a los datos del color en datosDeLosColores
        var $datosDelColor = M.datosDeLosColores['color_' + colorId];

        // mostrar el encabezado de la columna de colores elegidos
        $('#MTodosLosColores').css('margin-right', 180);
        $('#MCEColoresElegidos').removeClass('MOculto');

        // si ya esta elegido ...
        var $unColorElegido = $('#color_elegido_' + colorId);
        if($unColorElegido.length > 0) {
            // ya esta elegido: elimina la version anterior para poderlo agregar de nuevo
            $unColorElegido.remove();
        }

        // crea un elemento DIV con la info del nuevo color elegido y lo agrega
        $unColorElegido = $('#MCETemplate').clone(true);
        var $unColorElegidoId = 'color_elegido_' + colorId;
        $unColorElegido.get()[0].id = $unColorElegidoId;
        // add the new sample to the selected colors list
        $unColorElegido.insertAfter($('#MCEEncab'));
        if ($datosDelColor[M.tono] == 'claro') {
            $unColorElegido.addClass('MColorClaro');

// $("#color_elegido_38 div.MCEColorElegidoClose")

            $('#' + $unColorElegidoId + ' div.MCEColorElegidoClose').addClass("MColorClaro"); 
        } else {
            $unColorElegido.addClass('MColorOscuro');
            $('#' + $unColorElegidoId + ' div.MCEColorElegidoClose').removeClass("MColorOscuro"); 
        }

        var $theSampleImage = 'url(\"./imag/' + $datosDelColor[M.imagen] + '\")';
        // var $theSampleImage = 'url(./imag/' +  $datosDelColor[M.imagen]));
        $unColorElegido.css('backgroundImage', $theSampleImage);
        $unColorElegido.css('display', 'none');
        $unColorElegido.attr('title', 'color código ' + $datosDelColor[M.codigo] + ' ' + $datosDelColor[M.nombre]
        + ' - ' + $datosDelColor[M.tipo]);

        // arma un IMG para la impresion de los colores elegidos
        var $elIMG = $('#color_elegido_' + colorId).children('.MCEColorElegidoImg');
        $elIMG.attr('src', './imag/' +  $datosDelColor[M.imagen]);

        // arma un P con los datos del color
        var $elP = $('#color_elegido_' + colorId).children('.MCEColorElegidoBlah');
        var $paraText = 'Color ' + $datosDelColor[M.codigo] 
        + ' ' + $datosDelColor[M.nombre] 
        + ' - ' + $datosDelColor[M.tipo]  
        + ' ' + $datosDelColor[M.observaciones];
        $elP.text($paraText);

        // show the newly created sample
        $unColorElegido.slideDown('slow');

        var a = 777;
         
    },

    closeColorElegido: function (unColorElegido) {
        var $unColorElegido = $(unColorElegido.parentNode);
        $unColorElegido.slideUp(
            333, 
            function() {
                $unColorElegido.remove();
            }
        );
        // $unColorElegido.remove();
/*      $unColorElegido.hide(1000, function () {
            $unColorElegido.remove();
        });  */
    },

    
    hookPopups: function(unColor) {
    // en el hover de las muestritas de colores, mostrar un popup con la imagen 
    // completa y toda la info disponible de los colores
        $('.MUnColor').mouseenter(function() {
            M.mostrarElPopup(this);
        }); 
    },

    mostrarElPopup: function(unColor) {
        // alert('mouse sobre el color ' + unColor.id);
    },

    MLastItem: 'zzz'
}
