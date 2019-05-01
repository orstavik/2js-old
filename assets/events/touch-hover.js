/**
 * Touch-hover, mimics ':hover' that does not bubble.
 *
 * Elements with 'touch-hover' attribute will receive a "touch-hover" event when
 * a single touch pointer pressed to the screen enters or leaves the boundaries of an element.
 * The "touch-hover" event has two boolean details with a text string:
 *  detail.enter: true when the touch enters the element
 *  detail.leave: true when the touch leaves the element
 *
 * If the "touch-hover" attribute has the value "click", then the touch-hover event will
 * dispatch a "click" event on the element if the user lifts his touch finger on that element.
 *
 * Att!!
 * The "touch-hover" event listens for touchmove with "passive: false" globally. This is very heavy, use with caution.
 *
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

  function dispatchAfterthoughtEvent(target, eventName, enter) {
    const t = target;
    let ev = new CustomEvent(eventName, {
      bubbles: true,
      composed: true,
      detail: {enter: enter, leave: !enter}
    });
    setTimeout(function () {
      t.dispatchEvent(ev);
    });
  }

  function onTouchmove(e) {
    var pos = (e.touches && e.touches.length) ? e.touches[0] : e;
    var target = document.elementFromPoint(pos.clientX, pos.clientY);
    if (target === prevTarget)
      return;
    prevTarget = target;
    var touchoverParent = findParentWithAttribute(target, "touch-hover");
    if (touchoverParent === prevTouchoverParent)
      return;
    if (prevTouchoverParent)
      dispatchAfterthoughtEvent(prevTouchoverParent, "touch-hover", false);
    if (touchoverParent)
      dispatchAfterthoughtEvent(touchoverParent, "touch-hover", true);
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
      prevTouchoverParent.dispatchEvent(new CustomEvent("touch-hover", {
        bubbles: true,
        composed: true,
        detail: {enter: false, leave: true}
      }));
      if (prevTouchoverParent.getAttribute("touch-hover") === "click")
        prevTouchoverParent.click();
      prevTouchoverParent = undefined;
    }
  }

  document.addEventListener("touchend", init);
  document.addEventListener("touchstart", init);
})();