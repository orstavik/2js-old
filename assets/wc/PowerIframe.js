/**
 * attributes "srcdoc", "base", "sandbox"
 */
let iframeIDs = 1;

class PowerIframe extends HTMLElement {

  constructor() {
    super();
    this.attachShadow({mode: "open"});
    this.shadowRoot.innerHTML = `<iframe width="100%" style="padding: 0;" frameborder="0"></iframe>`;
    this._iframe = this.shadowRoot.childNodes[0];
    this._toUpdate = false;
    this._uniqueID = "power-iframe-" + iframeIDs++;
    window.addEventListener("message", this.onMessage.bind(this));
    this._skipAttributeChange = true;
  }

  static get observedAttributes() {
    return ["srcdoc", "base", "sandbox"];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === "srcdoc" || name === "base" || name === "sandbox") {
      if (this._toUpdate)
        return;
      this._toUpdate = true;
      Promise.resolve().then(this.updateIframe.bind(this));
    }
  }

  updateIframe() {
    this._toUpdate = false;
    if (this._skipAttributeChange)
      return this._skipAttributeChange = false;
    //1. sandboxing
    let sandbox = this.getAttribute("sandbox") || "allow-scripts";    //todo sandbox defaults to "everything but allow-same-origin"??
    let code = this.getAttribute("srcdoc");
    let base = this.getAttribute("base");
    this.updateInnerIframe(sandbox, code, base);
  }

  updateInnerIframe(sandbox, code, base) {
    this._iframe.setAttribute("sandbox", sandbox);
    if (base)
      code = "<base href='" + base + "'>" + code;

    //adding base to srcdoc //todo this can also maybe be done by setting src to "about: _blank", sandbox to nothing, then
    //altering the baseURI of the document, and then updating.
    //but, using the base tag at the end allows the template to itself set the baseURI before,
    //and, by adding a baseURI at the beginning will overwrite any and all base uri in the template.
    //both are useable. the base tag has serious benefits.

    //3. polling script for uniqueID::heightPx::widthPx

    const postMessageScript = this.getInnerIframePoller();

    this._iframe.setAttribute("srcdoc", code + postMessageScript);
  }

  getInnerIframePoller() {
    return `
<script>
  parent.postMessage("${this._uniqueID}::"+ document.body.scrollHeight +"::"+ document.body.scrollWidth, "*");
  setInterval(function() {
    parent.postMessage("${this._uniqueID}::"+ document.body.scrollHeight +"::"+ document.body.scrollWidth, "*");
  }, 500);
</script>`;
  }

  setDocument(base, src) {
    this._skipAttributeChange = true;
    this.removeAttribute("srcdoc");
    this.removeAttribute("base");
    this.updateInnerIframe(this.getAttribute("sandbox"), src, base);
  }

  onMessage(e) {
    // debugger;
    const parts = e.data.split("::");
    if (parts[0] !== this._uniqueID)
      return;
    this._iframe.setAttribute("height", parts[1] + "px");
    // this._iframe.setAttribute("width", parts[2] + "px");
  }
}

customElements.define("power-iframe", PowerIframe);