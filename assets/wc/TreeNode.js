import {SlotchangeMixin} from "https://unpkg.com/joicomponents@1.2.27/src/slot/SlotChildMixin.js";

/**
 * no button is an attribute noButton
 */

class TreeNode extends SlotchangeMixin(HTMLElement) {
  constructor() {
    super();
    this.attachShadow({mode: "open"});
    this.shadowRoot.innerHTML = `
        <style>
          span#header {
            cursor: pointer;
          }
          span#defaultButton::before {
            content: "+";
          }
          :host([open]:not([_empty])) span#defaultButton::before {
            content: "x";
          }
          :host([_empty]) span#defaultButton::before {
            content: "\\26AC";
          }
        </style>
        <span id="header">
          <slot id="button" name="button">
            <span id="defaultButton"></span>
          </slot>
          <slot id="title" name="title"></slot>
        </span>
        <slot id="content"></slot>`;
    this.shadowRoot.children[1].addEventListener("click", this.onClick.bind(this));
    this.__selected = false;
    this.__empty = null;
    this.__childTreeNodes = [];
  }

  static get observedAttributes() {
    return ["open", "selected", "_empty"];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === "open") {
      newValue === null ? this.closeChildren() : this.openParent();
    } else if (name === "_empty") {
      if (this.__empty !== newValue)
        this.__empty === null ? this.removeAttribute("_empty") : this.setAttribute("_empty", this.__empty);
    } else if (name === "selected" && newValue !== this.__selected) {
      this.__selected = newValue;
      this.deSelectTheOthers(this);
    }
  }

  closeChildren() {
    for (let child of this.__childTreeNodes)
      child.hasAttribute("open") && child.removeAttribute("open");
  }

  openParent() {
    const parent = this.parentNode;
    if (parent.tagName && parent.tagName === "TREE-NODE" && !parent.hasAttribute("open"))
      parent.setAttribute("open", "");
  }

  deSelectTheOthers(skipElement) {
    let parent = this.parentNode;
    if (parent.tagName && parent.tagName === "TREE-NODE" && parent !== skipElement)
      parent.deSelectNoCallback(this);
    for (let childTreeNode of this.__childTreeNodes)
      childTreeNode !== skipElement && childTreeNode.deSelectNoCallback(this);
  }

  deSelectNoCallback(skipElement) {
    this.__selected = null;
    this.removeAttribute("selected");
    this.deSelectTheOthers(skipElement);
  }

  onClick(e) {
    this.hasAttribute("open") ? this.removeAttribute("open") : this.setAttribute("open", "");
    this.hasAttribute("selected") || this.setAttribute("selected", "");
  }

  slotCallback(slot) {
    if (slot.name === "") {
      this.__childTreeNodes = Array.from(this.children).filter(child => child.tagName === "TREE-NODE");
      if (this.__childTreeNodes.length === 0) {
        this.__empty = "";
        !this.hasAttribute("_empty") && this.setAttribute("_empty", "");
      } else {
        this.__empty = null;
        this.removeAttribute("_empty");
      }
    }
  }
}

customElements.define("tree-node", TreeNode);
