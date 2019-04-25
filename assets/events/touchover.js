/**
 * Touchover (or 'brush' or 'stroke') event
 *
 * Mimics :hover that does not bubble. Usable for both mouse and touch.
 *
 * Elements with 'touchover' attribute will receive:
 * 1. "touchover" event when:
 *    a. a single touch enters an element or
 *    b. the mouse starts to hover over an element.
 *
 *
 * 2. "touchleave" event when the touch or mouse leaves the surface of the `touchover` element.
 *    If the "touchleave" event occurs as a result of a touchend over a `touchover` element,
 *    then this "touchleave" event will have a `.detail.leaveOnTarget === true` value.
 *
 * If a `touchover` element is nested inside another `touchover` element,
 * only the inner `touchover` element will react when the touch or mouse moves.
 *
 * ATT!! Very heavy, global composed event. Use with caution.
 * Once loaded it always listens for the touchend, touchstart, mouseover and mouseout events on the document.
 * But, to do this locally on every element would likely be worse, with 100 elements meaning 100 mouseover or touchstart
 * listeners.
 *
 * todo add a chapter about this article
 * Problem: TouchTarget
 * https://stackoverflow.com/questions/3918842/how-to-find-out-the-actual-event-target-of-touchmove-javascript-event
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