var touchStartTime, touchStartPosY;
var touchCurrentTime, touchCurrentPosY;
var touchEndTime, touchEndPosY;
var touchSpeed, touchDistance, touchDirection;
var rotation, rotationOffset;
var opacityBase;

var isTransitioning = false;            // true when CSS transitions are in progress
var transitioningToNewPage = isTransitioning;
var whereToTransitionTo;        // up or down
var transitionStartingFrom;     // up or down
var pageCurrent = 0;                // paging counter
var vh;                         // viewport height

var flip;
var cards = [];
var overlays = [];

var classNameFlipUp;
var classNameFlipDown;
var classNameHasTransition;
var classNameHasTouch;
var up;
var down;

var M = Math;
var D = document;
var body = D.body;

var documentGetElementById;
var setOpacity;
var addEventListener;
var changeClass;

documentGetElementById = function(id){
  return D.getElementById(id);
};

setOpacity = function(element, opacity) {
    element.style.opacity = opacity;
};

addEventListener = function(element, event, handler) {
    element.addEventListener(event, handler, false);
};

changeClass = function(classname, add) {
    if (add == true) {
        body.classList.add(classname);
    } else {
        body.classList.remove(classname);
    }
};

// set some default values
vh = window.innerHeight;

up = classNameFlipUp = 'u';
down = classNameFlipDown = 'd';
classNameHasTransition = 't';
classNameHasTouch = 'x';

// get all the elements needed
flip = documentGetElementById('Z');
cards[0] = documentGetElementById(classNameFlipUp);
cards[1] = documentGetElementById(classNameFlipDown);
cards[2] = documentGetElementById(classNameHasTransition);
cards[3] = documentGetElementById(classNameHasTouch);
overlays[0] = documentGetElementById('E');
overlays[1] = documentGetElementById('F');
overlays[2] = documentGetElementById('G');
overlays[3] = documentGetElementById('H');

movePageIndex(0);

// Handler for touchstart
addEventListener(body, "touchstart", function(e) {
    var touch = e.changedTouches[0];

    // set the timestamp and position of the first touch
    touchStartTime = new Date().getTime();
    touchStartPosY = touch.pageY;
    touchEndPosY = touch.pageY;
});



// Handler for touchend
addEventListener(body, "touchend", function(e) {

    isTransitioning = true;

    // Calculate the speed/velocity of the touchgesture
    // in px per millisecond
    touchSpeed = M.abs(touchEndPosY - touchStartPosY)/(touchEndTime - touchStartTime) || 0;

    if (touchSpeed == 0) {
        touchEndPosY = touchStartPosY - 100;
        handleTouchMove();
    }

    // remove the rotation set during touchmove
    flip.style.transform = '';

    // remove the opacity set during touchmove
    for(i=4;i--;){
        setOpacity(overlays[i],'');
    }

    // determine wether to finish the flip rotation via animation
    // based on the rotation degree or velocity
    // classes are added to the flip container and overlays
    // that tell the elements how and where to transition to

    transitioningToNewPage = true;
    whereToTransitionTo = up;
    if (touchSpeed > 0.4) {
        whereToTransitionTo = touchDirection;
    } else {
        if (rotation >= 90) {
            if (transitionStartingFrom == up) {
                transitioningToNewPage = false;
            }
        } else {
            whereToTransitionTo = down;
            if (transitionStartingFrom == down) {
                transitioningToNewPage = false;
            }
        }
    }

    if (touchSpeed != 0) {
        // add this class to the flip container and the overlay
        // in order to have a smooth transition
        changeClass(classNameHasTransition,true);
        changeClass(classNameHasTouch,false);

        if (whereToTransitionTo == up) {
            changeClass(classNameFlipUp,true);
        } else {
            changeClass(classNameFlipDown,true);
        }
    }
});



// Handle touchmove
addEventListener(body, "touchmove", function(e) {
    e.preventDefault();

    touchCurrentPosY = e.changedTouches[0].pageY;

    // only allow user touch input when no transition is happening
    if (isTransitioning == false) {
        handleTouchMove();
    }
});







// When the transition of the flipping ends, remove all classes
// and shift the content offset.
//
// The event listener is attached to one page because if we'd
// attach it to the .flip container, it would be triggered
// three times, since the two overlays are children of .flip
addEventListener(overlays[2], "transitionend", function() {
    changeClass(classNameHasTransition,false);
    changeClass(classNameFlipUp,false);
    changeClass(classNameFlipDown,false);
    isTransitioning = false;


    if (transitioningToNewPage == true) {
        if (whereToTransitionTo == up) {
            pageCurrent++;
            movePageIndex(0);
        } else {
            movePageIndex(2);
            pageCurrent--;
        }
    } else {
        movePageIndex(0);
    }
    changeClass(classNameHasTouch,true);
});

var handleTouchMove = function() {
    // calculate how many pixels the user has swiped since
    // the touching started
    touchDistance = touchStartPosY - touchCurrentPosY;

    // if the touchDistance is negative, add the viewport height
    // to it. That way the flip container flips by 180deg, as if
    // the user flipped it up

    if (touchDistance < 0) {
        rotationOffset = vh + touchDistance;
        movePageIndex(2);
        transitionStartingFrom = up;
    } else {
        rotationOffset = touchDistance;
        movePageIndex(0);
        transitionStartingFrom = down;
    }

    // Calculate the rotation with magic math shit
    // and allow only values between 0 and 180
    rotation = M.max(M.min((((vh - (vh - (rotationOffset))) / vh) * 180), 180), 0);

    // rotate the flip container based on the calculated rotation
    flip.style.transform = 'rotateX('+ rotation +'deg)';

    // calculate a base opacity value 
    opacityBase = (((vh - (vh - (rotationOffset))) / vh) * 1);

    // calculate the individual opacity values for the overlays
    // set opacity values
    setOpacity(overlays[0],opacityBase - 0.5);
    setOpacity(overlays[1],opacityBase);
    setOpacity(overlays[2],1-opacityBase);
    setOpacity(overlays[3],0.5 - opacityBase);

    if (M.abs(touchCurrentPosY - touchEndPosY) > 5) {
        if (touchCurrentPosY > touchEndPosY) {
            touchDirection = down;
        } else {
            touchDirection = up;
        }
        // save current touch info for touchEnd
        touchEndTime = new Date().getTime();
        touchEndPosY = touchCurrentPosY;
    }
};

var movePageIndex = function(a) {
    for(i=4;i--;){
        cards[i].style.backgroundPosition = "0 -" + (200 * pageCurrent + (i - a) * 100) + "%";
    }
};