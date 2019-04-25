/*
todo single hover, a hover that doesn't bubble.
todo spawned from mouseenter mouseleave? works with touchstart, touchmove, touchend too?
todo we can't listen for mouse down in the elements, as this will cause 100 mousedown listeners.. which will spawn
todo 100 mousemove listeners. Horrible. we need a composed event, definitively!

todo make a touchhover over event. brush. stroke. that works on both touch and mouse.
todo when mouseenter, it is stroked. when it is touched, it is stroked. But we don't want to listen for all touchmoves, do we?



todo add a chapter about this article
https://stackoverflow.com/questions/3918842/how-to-find-out-the-actual-event-target-of-touchmove-javascript-event


 */

/**
 * Global event that is always activated on the document.
 * Will dispatch a "touchover" event when a single finger enters an element.
 * Will dispatch a "touchleave" event when the single finger leaves the element.
 */
(function () {

  var active = false;
  var prevTarget = undefined;
  var prevTouchoverParent = undefined;

  function findParentWithAttribute(node, attName) {
    for (var n = node; n; n = (n.parentNode || n.host)) {
      if (n.hasAttribute && n.hasAttribute(attName))
        return n;
    }
    return undefined;
  }

  function dispatchAfterthoughtEvent(target, eventName) {
    setTimeout(function () {
      target.dispatchEvent(new CustomEvent(eventName));
    });
  }

  function onTouchmove(e) {
    var pos = (e.touches && e.touches.length) ? e.touches[0] : e;
    var target = document.elementFromPoint(pos.clientX, pos.clientY);
    if (target === prevTarget)
      return;
    prevTarget = target;
    var touchoverParent = findParentWithAttribute(target, "touchover");
    if (touchoverParent === prevTouchoverParent)
      return;
    if (prevTouchoverParent)
      dispatchAfterthoughtEvent(prevTouchoverParent, "touchleave");
    if (touchoverParent)
      dispatchAfterthoughtEvent(touchoverParent, "touchover");
    prevTouchoverParent = touchoverParent;
  }

  function init(e) {
    e.touches.length === 1 ? start(e) : end(e);
  }

  function start(e) {
    document.addEventListener("touchmove", onTouchmove);
    active = true;
  }

  function end(e) {
    document.removeEventListener("touchmove", onTouchmove);
    active = false;
    prevTarget = undefined;
    if (prevTouchoverParent) {
      prevTouchoverParent.dispatchEvent(new CustomEvent("touchleave", {detail: {leaveOnTarget: true}}));
      prevTouchoverParent = undefined;
    }
  }

  document.addEventListener("touchend", init);
  document.addEventListener("touchstart", init);


  //mouse listeners

  var prevTarget = undefined;
  var nextTarget = undefined;

  var activated = false;

  function callEvents() {
    if (activated)
      return;
    activated = true;
    setTimeout(function () {
      activated = false;
      if (prevTarget)
        prevTarget.dispatchEvent(new CustomEvent("touchleave"));
      if (nextTarget)
        nextTarget.dispatchEvent(new CustomEvent("touchover"));
      prevTarget = nextTarget;
      nextTarget = undefined;
    }, 0);
  }

  function onMouseover(e) {
    if (nextTarget)
      return;
    if (e.target.hasAttribute("touchover")) {
      nextTarget = e.target;
      callEvents();
    }
  }

  function onMouseout(e) {
    if (!prevTarget)
      return;
    // if (prevTarget.contains(e.target))
    //   debugger;
    if (e.target === prevTarget) {
      callEvents();
    }
  }

  document.addEventListener("mouseover", onMouseover);
  document.addEventListener("mouseout", onMouseout);

})();