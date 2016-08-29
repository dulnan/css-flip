var touchStartTime, touchStartPosY;
var touchCurrentTime, touchCurrentPosY;
var touchEndTime, touchEndPosY;
var touchSpeed, touchDistance, touchDirection;
var rotation, rotationOffset;
var opacityBase, opacityA, opacityB, opacityC, opacityD;

var isTransitioning;            // true when CSS transitions are in progress
var transitioningToNewPage;     // true when it's transitioning to a new page
var whereToTransitionTo;        // up or down
var transitionStartingFrom;     // up or down
var pageCurrent;                // paging counter
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

var documentGetElementById;

var handleStart = function(e) {
    e.preventDefault();
    var touch = e.changedTouches[0];

    // set the timestamp and position of the first touch
    touchStartTime = new Date().getTime();
    touchStartPosY = touch.pageY;
    touchEndPosY = touch.pageY;
};

var handleMove = function(e) {
    e.preventDefault();

    touchCurrentPosY = e.changedTouches[0].pageY;

    // only allow user touch input when no transition is happening
    if (isTransitioning == false) {
        handleTouchMove();
    }
};

var handleEnd = function(e) {
    e.preventDefault();
    
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
    overlays[0].style.opacity = '0';
    overlays[1].style.opacity = '0';
    overlays[2].style.opacity = '0';
    overlays[3].style.opacity = '0';

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
            if (transitionStartingFrom === up) {
                transitioningToNewPage = false;
            }
        } else {
            whereToTransitionTo = down;
            if (transitionStartingFrom === down) {
                transitioningToNewPage = false;
            }
        }
    }

    if (touchSpeed != 0) {
        // add this class to the flip container and the overlay
        // in order to have a smooth transition
        body.classList.add(classNameHasTransition);
        body.classList.remove(classNameHasTouch);

        if (whereToTransitionTo === up) {
            body.classList.add(classNameFlipUp);
        } else {
            body.classList.add(classNameFlipDown);
        }
    }
};

// When the transition of the flipping ends, remove all classes
// and shift the content offset.
//
// The event listener is attached to one page because if we'd
// attach it to the .flip container, it would be triggered
// three times, since the two overlays are children of .flip
var handleTransitionend = function(e) {
    restorePagePosition();
};



var init = function() {
    documentGetElementById = function(id){
      return D.getElementById(id);
    }
    // set some default values
    vh = window.innerHeight;
    isTransitioning = false;
    transitioningToNewPage = false;
    pageCurrent = 0;

    up = classNameFlipUp = 'u';
    down = classNameFlipDown = 'd';
    classNameHasTransition = 't';
    classNameHasTouch = 'x';

    body = D.body;

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

    body.addEventListener("touchstart", handleStart, false);
    body.addEventListener("touchend", handleEnd, false);
    //body.addEventListener("touchcancel", handleCancel, false);
    body.addEventListener("touchmove", handleMove, false);
    overlays[2].addEventListener("transitionend", handleTransitionend, false);
};

var restorePagePosition = function() {
    body.classList.remove(classNameHasTransition);
    body.classList.remove(classNameFlipUp);
    body.classList.remove(classNameFlipDown);
    isTransitioning = false;


    if (transitioningToNewPage === true) {
        if (whereToTransitionTo === up) {
            pageCurrent++;
            movePageIndex(0);
        } else {
            movePageIndex(2);
            pageCurrent--;
        }
    } else {
        movePageIndex(0);
    }
    body.classList.add(classNameHasTouch);
};

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
    rotation = (((vh - (vh - (rotationOffset))) / vh) * 180);
    rotation = M.max(M.min(rotation, 180), 0);

    // rotate the flip container based on the calculated rotation
    flip.style.transform = 'rotateX('+ rotation +'deg)';

    // calculate a base opacity value 
    opacityBase = (((vh - (vh - (rotationOffset))) / vh) * 1);

    // calculate the individual opacity values for the overlays
    opacityA = M.max(M.min((opacityBase - 0.5) * 2, 0.75), 0);
    opacityD = M.max(M.min((0.5 - opacityBase) * 2, 0.75), 0);
    opacityB = M.max(M.min((opacityBase * 0.5), 0.25), 0);
    opacityC = M.max(M.min((0.5 - (opacityBase * 0.5)), 0.25), 0);

    // set opacity values

    overlays[0].style.opacity = opacityA;
    overlays[1].style.opacity = opacityB;
    overlays[2].style.opacity = opacityC;
    overlays[3].style.opacity = opacityD;

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




window['init'] = init;