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

var flip, A, B, C, D;
var overlayA, overlayB, overlayC, overlayD;

var classNameFlipUp = 'u';
var classNameFlipDown = 'd';
var classNameHasTransition = 't';
var classNameHasTouch = 'x';
var up = 'up';
var down = 'down';

var M = Math;

var documentGetElementById = function(id){
  return document.getElementById(id);
}

function handleStart(e) {
    e.preventDefault();
    var touch = e.changedTouches[0];

    // set the timestamp and position of the first touch
    touchStartTime = new Date().getTime();
    touchStartPosY = touch.pageY;
    touchEndPosY = touch.pageY;
}

function handleMove(e) {
    e.preventDefault();

    touchCurrentPosY = e.changedTouches[0].pageY;

    // only allow user touch input when no transition is happening
    if (isTransitioning == false) {
        handleTouchMove();
    }
}

function handleCancel(e) {
    
}

function handleEnd(e) {
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
    overlayA.style.opacity = '0';
    overlayB.style.opacity = '0';
    overlayC.style.opacity = '0';
    overlayD.style.opacity = '0';

    // determine wether to finish the flip rotation via animation
    // based on the rotation degree or velocity
    // classes are added to the flip container and overlays
    // that tell the elements how and where to transition to


    if (touchSpeed > 0.4) {
        whereToTransitionTo = touchDirection;
        transitioningToNewPage = true;
    } else if (touchSpeed == 0) {
        whereToTransitionTo = up;
        transitioningToNewPage = true;
    } else {
        if (rotation >= 90) {
            if (transitionStartingFrom === up) {
                whereToTransitionTo = up;
                transitioningToNewPage = false;
            }
            if (transitionStartingFrom === down) {
                whereToTransitionTo = up;
                transitioningToNewPage = true;
            }
        } else {
            if (transitionStartingFrom === up) {
                whereToTransitionTo = down;
                transitioningToNewPage = true;
            }
            if (transitionStartingFrom === down) {
                whereToTransitionTo = down;
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
}

// When the transition of the flipping ends, remove all classes
// and shift the content offset.
//
// The event listener is attached to one page because if we'd
// attach it to the .flip container, it would be triggered
// three times, since the two overlays are children of .flip
function handleTransitionend(e) {
    // e.preventDefault;
    restorePagePosition();
}



function init() {
    // set some default values
    vh = window.innerHeight;
    isTransitioning = false;
    transitioningToNewPage = false;
    pageCurrent = 0;

    body = document.body;

    // get all the elements needed
    flip = documentGetElementById('Z');
    A = documentGetElementById('A');
    B = documentGetElementById('B');
    C = documentGetElementById('C');
    D = documentGetElementById('D');
    overlayA = documentGetElementById('E');
    overlayB = documentGetElementById('F');
    overlayC = documentGetElementById('G');
    overlayD = documentGetElementById('H');


    A.style.backgroundPositionY = '-0%';
    B.style.backgroundPositionY = '-100%';
    C.style.backgroundPositionY = '-200%';
    D.style.backgroundPositionY = '-300%';



    body.addEventListener("touchstart", handleStart, false);
    body.addEventListener("touchend", handleEnd, false);
    body.addEventListener("touchcancel", handleCancel, false);
    body.addEventListener("touchmove", handleMove, false);
    overlayC.addEventListener("transitionend", handleTransitionend, false);
}

function restorePagePosition() {
    body.classList.remove(classNameHasTransition);
    body.classList.remove(classNameFlipUp);
    body.classList.remove(classNameFlipDown);
    isTransitioning = false;


    if (transitioningToNewPage === true) {
        if (whereToTransitionTo === up) {
            pageCurrent++;
            movePageIndexForward();
        } else {
            movePageIndexBack();
            pageCurrent--;
        }
    } else {
        movePageIndexForward();
    }
    body.classList.add(classNameHasTouch);
}

function handleTouchMove() {
    // calculate how many pixels the user has swiped since
    // the touching started
    touchDistance = touchStartPosY - touchCurrentPosY;

    // if the touchDistance is negative, add the viewport height
    // to it. That way the flip container flips by 180deg, as if
    // the user flipped it up

    if (touchDistance < 0) {
        rotationOffset = vh + touchDistance;
        movePageIndexBack();
        transitionStartingFrom = up;
    } else {
        rotationOffset = touchDistance;
        movePageIndexForward();
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

    overlayA.style.opacity = opacityA;
    overlayB.style.opacity = opacityB;
    overlayC.style.opacity = opacityC;
    overlayD.style.opacity = opacityD;

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
}

function movePageIndexForward() {
    A.style.backgroundPositionY = -(((pageCurrent * 2) * 100) +   0) + '%';
    B.style.backgroundPositionY = -(((pageCurrent * 2) * 100) + 100) + '%';
    C.style.backgroundPositionY = -(((pageCurrent * 2) * 100) + 200) + '%';
    D.style.backgroundPositionY = -(((pageCurrent * 2) * 100) + 300) + '%';
}

function movePageIndexBack() {
    A.style.backgroundPositionY = -(((pageCurrent * 2) * 100) - 200) + '%';
    B.style.backgroundPositionY = -(((pageCurrent * 2) * 100) - 100) + '%';
    C.style.backgroundPositionY = -(((pageCurrent * 2) * 100)      ) + '%';
    D.style.backgroundPositionY = -(((pageCurrent * 2) * 100) + 100) + '%';
}
window['init'] = init;