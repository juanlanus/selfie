/********************************************************************************/
/* Reading Tools:
    Aids for reading with the browser. It will never be like reading on paper, but
    instead leverage the strengths of the HTML media. 
*/
/********************************************************************************/
/* Change log 
2010-07-15 New by Juan Lanus to be used in congresointeractivo.org
2010-09-06 Clicking a TOC link expands its target before linking
2010-09-08 Works in IE7, reasonabily
*/
/********************************************************************************/
/* TOC
    Build a TOC and insert it in a div with id "pageTOC" when the page is loaded.
    Accept optional parameters headingLevelFrom (assume h1) and headingLevelTo
    (assume h999), taking them from the div stored as properties, comments, or 
    some other way. 
    NTH: in a multi-page work enable integration of all the page TOCs in a way 
    that I don't know yet. May be building an independent TOC page integrating
    all the TOCs of the contained pages of the hierarchy. 
*/
/********************************************************************************/
/*
    Recursively loop over all the heading tags in the page and output ULs, OLs 
    and LIs reproducing the (hopefully) tree-shaped hierarchy of the page. 
    Add a class to each TOC element to allow CSS to impact it: rt_TOC_H1, rt_TOC_H2 ...
    Allow parameters or something to specify the type of list (OL, UL) to use 
    for each level, the type of OL (and the starting numbers?). 
*/
    function buildPageTOC() {

        var TOCId = 'rt_pageTOC';  // let the user tell what the id is, in a parameter
        // var indentEms = 2;      // indentation of each new heading level

        // get a DIV for the TOC
        var theTOC = document.getElementById(TOCId);

        // get all the elements and separate the headings
        var allElements = document.getElementsByTagName('*');
        var headings = [];
        for (var i = 0; i < allElements.length; i++) {
            if (allElements[i].tagName.substr(0, 1) == 'H'
            && !isNaN(allElements[i].tagName.substr(1)))
                // tagName starts with H and ends with digits
                headings.push(allElements[i]);
            }

        // build an ul of the heading texts and link each li to its heading
        var theList = document.createElement('ul');
        var theLastShowHideHeading = null;

        // theNewButton.className = (isShowHide) ? 'rt_showButton' : 'rt_hideButton';

        theTOC.appendChild(theList);
        for (var i = 0; i < headings.length; i++) {
            var aTOCItem = document.createElement('li');
            var theLink = document.createElement('a');
            if (headings[i].id == "") {
                headings[i].id = makeUniqueId(headings[i]);
            }
            theLink.href = '#' + headings[i].id;

            // take note of the last collapsible element, used to expand it upon click
            // on the TOC link before scrolling to it
            if(/rt_showHide|rt_hideShow/.test(headings[i].className)) {
                theLastShowHideHeading = headings[i];
            }
            if(theLastShowHideHeading) {
                // add an onclick handler that will toggle the last collapsible group before
                // this heading, the one that hopefully contains it
                theLink.setAttribute('onclick', 'expandTarget(\'' + theLastShowHideHeading.id + '\')');
            }
            aTOCItem.appendChild(theLink);
            if (headings[i].textContent) {
                theLink.textContent = headings[i].textContent;
            } else {
                theLink.innerText = headings[i].innerText;
            }
            aTOCItem.headingLevel = headings[i].nodeName;
            aTOCItem.className = 'rt_TOC_H' + headings[i].nodeName.substr(1);
            // replace this by appropriate CSS styles for each H level
            // aTOCItem.style.paddingLeft = (headings[i].nodeName.substr(1) * indentEms) + 'rem';
            theList.appendChild(aTOCItem);
        }
    }


    function makeUniqueId(theElement) {
    // build an id for this element using the text it contains if possible, 
    // and check that it's unique
        if (theElement.textContent && theElement.textContent.length > 0) {
            var theNewId = theElement.textContent.replace(/[. -:]/g, '_');
            var theNewId = '_' + theNewId.replace(/[^a-zA-Z0-9_]/g, '').substr(0,100);
        } else if (theElement.innerText && theElement.innerText.length > 0) {
            var theNewId = theElement.innerText.replace(/[. -:]/g, '_');
            var theNewId = '_' + theNewId.replace(/[^a-zA-Z0-9_]/g, '').substr(0,100);
        } else {
            var theNewId = '_id';
            var theNewId = '_id';
        }
        if (document.getElementById(theNewId)) {
            // the id already exists: add a number until uniqueness
            var n = 1;
            while (document.getElementById(theNewId + '_' + n)) {
                n = n + 1;
            }
            theNewId = theNewId + '_' + n;
        }
        return theNewId;
    }
/********************************************************************************/
/* folding text
    Instructions: add a class rt_showHide or rt_hideShow at the heading level and all
    the elements below the heading up to but excluding the next heading with the
    same level, will be toggled on-off or off-on depending on the class.
    Example:
        <h3 class="rt_showHide" id="L626">1.9. CMMI Acronyms</h3>
    This file has to be linked to the page, for example in the ./res folder: 
    <script language="javascript" type="text/javascript" src="./res/readingTools.js"></script>
    Also the button icons [+] and [-] are expected in the ./res folder. 

    NTH: allow specifying the button location before or after, now is always after.
*/
/********************************************************************************/
    /*
    The elements (usually headings) wearing classes rt_showHide or rt_hideShow are
    awarded with a toggle button to show and hide, or hide and show, the content
    of the elements below them until the next sibling (same level heading,
    usually) or the end of the document. 
    The (heading) element is not hidden. 
    Adding the rt_showHide class to an element means that it will show the first
    time its button is clicked, and hidden the second time, in that order: first
    show then hide. The rt_hideShow class reverses the order. 
    The addToggleVisibilityButtons() function sets the page at load time. 
    The added buttons invoke toggleBlockVisibility() to effect the show and hide
    actions. 
    Elements under the control of a heading with rt_showHide class are hidden at
    load time, while elements under the control of rt_hideShow are left unmodified.
    Thus, adding one of the two classes to the heading is all you need to do. 
    */

    var buttonsLocation = './res/';
    var showButtonSrc = 'rt_expand_icon.gif';
    var hideButtonSrc = 'rt_collapse_icon.gif';
    var showButtonAlt = 'show hidden content';
    var hideButtonAlt = 'hidde content';
    var idSequence = 0; 

    function addToggleVisibilityButtons() {

        // handle rt_showHide 
        var selected = document.getElementsByClassName('rt_showHide');
        for(var i = 0; i < selected.length; i++) {
            addOneToggleVisibilityButton(selected[i]);
        }
        // handle rt_hideShow 
        selected = document.getElementsByClassName('rt_hideShow');
        for(var i = 0; i < selected.length; i++) {
            addOneToggleVisibilityButton(selected[i]);
        }
    }


    function addOneToggleVisibilityButton(aSelectedOne) {
    // aSelectedOne is the heading of a block to be toggled, it gets
    // a toggle button and all its siblings up to the next element with
    // the same tag (i.e., if aSelectedOne is H3 up to the next H3) are
    // tagged by a generated class name so they can be toggled as a herd

        // check if it is rt_showHide or rt_hideShow (if both then rt_showHide)
        // handle differences using (isShowHide) ? <rt_showHide value> : <rt_hideShow value>
        var isShowHide = /\brt_showHide\b/.test(aSelectedOne.className);

        // build an unique class name for this section
        idSequence = idSequence + 1;
        timeNow = new Date();
        var newClass = 'cls' + timeNow.getHours() + '' + timeNow.getMinutes()
        + '' + timeNow.getSeconds() + '_' + idSequence;

        // build and add an img and make it clickable
        var theNewButton = document.createElement('img'); 
        theNewButton.src = (isShowHide) ? buttonsLocation + showButtonSrc : buttonsLocation + hideButtonSrc;
        theNewButton.className = (isShowHide) ? 'rt_showButton' : 'rt_hideButton';
        theNewButton.alt = (isShowHide) ? 'show hidden content' : 'hide content';
        theNewButton.title = (isShowHide) ? 'show hidden content' : 'hide content';
        theNewButton.style.cursor = 'pointer';
        theNewButton.border = '0';
        theNewButton.relatedClass = newClass;
        theNewButton.onclick = function(){toggleBlockVisibility(this);};
        // aSelectedOne.appendChild(theNewButton); 
        aSelectedOne.insertBefore(theNewButton, aSelectedOne.firstChild);

        // add the generated class name to all "contained" elements
        var p = aSelectedOne.nextSibling;
        while(p) {
            if(p && p.tagName == aSelectedOne.tagName) {
                break;
            }
            // filter by brute force those type 1 nodes that don't have to be
            // toggled, like style and script: I didn't find a better way, and
            // I'm not sure that these are all the tags to filter.
            // .nodetype: 1= Node.ELEMENT_NODE , 2=ATTRIBUTE_NODE, 3=TEXT_NODE
            if(p && p.nodeType == 1 && p.tagName != 'STYLE'
                && p.tagName != 'SCRIPT') {
                if(p.className) {
                    p.className += (' ' + newClass);
                } else {
                    p.className = newClass;
                }
                p.style.display = (isShowHide) ? 'none' : p.style.display;
            }
            p = p.nextSibling;
        }
    }

    function toggleBlockVisibility(theButton) {
        if(theButton.src.lastIndexOf(showButtonSrc) > 0) {
            makeBlockVisible(theButton);
        } else {
            makeBlockHidden(theButton);
        }
    }


    function makeBlockVisible(theButton) {
        var theElements = document.getElementsByClassName(theButton.relatedClass);
        // toggle button
        theButton.src = buttonsLocation + hideButtonSrc;
        theButton.alt = 'hide content';
        theButton.title = 'hide content';

        // set all visible
        if(theElements.length > 0) {
            for(var i = 0; i < theElements.length; i++) {
                theElements[i].style.display = 'block';
            }
        }
    }

    function makeBlockHidden(theButton) {
        var theElements = document.getElementsByClassName(theButton.relatedClass);
        // toggle button
        theButton.src = buttonsLocation + showButtonSrc;
        theButton.alt = 'show hidden content';
        theButton.title = 'show hidden content';

        // hide all
        if(theElements.length > 0) {
            for(var i = 0; i < theElements.length; i++) {
                theElements[i].style.display = 'none';
            }
        }
    }

    function expandTarget(theTargetId) {
    // Used by the links in the TOC to expand their targets, else the user
    // clicks a lower level TOC element and nothing happens
        var theTarget = document.getElementById(theTargetId);
        if(theTarget) {
            var theButton = theTarget.children[0];
            if(theButton) {
                makeBlockVisible(theButton); 
            }
        }
    }


    /*Kentaromiura 1.0 version*/
    document.getElementsByClassName = function(searchClass,tag,node){
        var p = function(){
        if([].push)return function(a,b){a.push(b)};
            return function(a,b){a[a.length]=b}
        }();

        node = node || document;
        tag = tag || '*';

        if(document.evaluate){
            var xpr = document.evaluate([".//",tag,"[contains(concat(' ',@class,' '),' ",searchClass," ')]"].join(''),node, null, 0, null),
            t = true,
            els = new Array();
            while(t=xpr.iterateNext()){
                p(els,t);
            }
        return els;
        }


        var els = node.getElementsByTagName(tag),
        pattern = new RegExp(["(^|\\s)",searchClass,"(\\s|$)"].join('')), 
        ce = new Array();

        for (var i = 0, max = els.length; i < max; i++) {
            if(pattern.test(els[i].className))
            p(ce,els[i]);
        }
        return ce;
    }















