// import {StyleCallbackMixin} from "https://unpkg.com/joicomponents@1.2.27/src/style/StyleCallbackMixin.js";

function pathsToTree(mdFiles) {
  const chapters2 = mdFiles.map(path => path[0].substr(1).split("/"));
  const chapters3 = chapters2.filter(arr => arr.length === 3);
  const paths = chapters3.map(arr => [arr[1], arr[2], "/" + arr.join("/")]);

  const book = {};
  for (let chp of paths)
    (book[chp[0]] || (book[chp[0]] = {}))[chp[1]] = chp[2];
  return book;
}

const treeNode = document.createElement("template");
treeNode.innerHTML = `<tree-node><a slot="title">sunshine</a>`;

function makeTreeNode(title, href) {
  let node = treeNode.content.cloneNode(true).children[0];
  node.children[0].innerText = title;
  href && node.children[0].setAttribute("href", href);
  return node;
}

function makeMenu(book, title) {
  let count = 1;
  const node = makeTreeNode(title);
  for (let [key, value] of Object.entries(book)) {
    count++;
    let chp = makeTreeNode(key);
    node.appendChild(chp);
    for (let [key2, value2] of Object.entries(value)) {
      count++;
      chp.appendChild(makeTreeNode(key2, "#" + value2));
    }
  }
  return [node, count];
}

function addTouchover(nodeList) {
  for (let i = 0; i < nodeList.length; i++)
    nodeList[i].setAttribute("touch-hover", "click");
}

function onTouchHover(e) {
  e.detail.enter === true ? e.target.setAttribute("hover", "") : e.target.removeAttribute("hover");
}

class BarMenu extends /*StyleCallbackMixin(HTMLElement)*/ HTMLElement {
  constructor() {
    super();
    // this.attachShadow({mode: "open"}); //a lightDOM thingy? yes, for now, since its a problem to encapsulate the style
    Promise.resolve().then(this.onStart.bind(this));
    this._hasStartupAttribute = false;
    this.mdFilesObj = {};
    this.addEventListener("touch-hover", onTouchHover);
  }

  static get observedAttributes() {
    return ["src"];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === "src") {
      this._hasStartupAttribute = true;
      document.readyState === "complete" ?
        this.onStart(newValue) :
        document.addEventListener("DOMContentLoaded", () => {
          this._hasStartupAttribute || this.onStart(this.getAttribute("src"));
        });
    }
  }

  // static get observedStyles() {
  //   return ["--menu-type"];
  // }
  //
  // styleCallback(name, oldValue, newValue) {
  //   if (name === "--menu-type") {
  //     this.setAttribute
  //   }
  // }

  async onStart(src) {
    src = src || this.getAttribute("src");
    if (src === null)
      return (this.innerHTML = `
    <tree-node><a href="#home" slot="title">Book</a>
    <tree-node><a href="#world" slot="title">chapter 1</a>
    <tree-node><a href="#world" slot="title">chp 1.1</a></tree-node>
    <tree-node selected><a href="#world" slot="title">chp 1.2</a>
    <tree-node><a href="#sunshine" slot="title">chp 1.2.1</a></tree-node>
    <tree-node><a href="#blueSkies" slot="title">chp 1.2.2</a></tree-node>
    </tree-node>
    <tree-node><a href="#world" slot="title">chp 1.3</a></tree-node>
    </tree-node>
    <tree-node><a href="#world" slot="title">chapter 2</a>
    <tree-node><a href="#world" slot="title">chp 2.1</a></tree-node>
    <tree-node><a href="#world" slot="title">chp 2.2</a>
    <tree-node><a href="#sunshine" slot="title">chp 2.2.1</a></tree-node>
    <tree-node><a href="#blueSkies" slot="title">chp 2.2.2</a></tree-node>
    </tree-node>
    </tree-node>
    </tree-node>
` && addTouchover(this.querySelectorAll("a")));
    const jsonCon = await fetch(src);
    const mdFiles = await jsonCon.json();
    const book = pathsToTree(mdFiles);
    this.mdFilesObj = {};
    for (let [path, content] of mdFiles)
      this.mdFilesObj[path] = content;
    const [bookNodes, count] = makeMenu(book, "JoiComponents");
    this.appendChild(bookNodes);
    document.styleSheets[0].cssRules[5].style.paddingLeft = (100 / count) + "%";
    addTouchover(this.querySelectorAll("a"));
  }

  getContent(path) {
    return this.mdFilesObj[path];
  }
}

customElements.define("bar-menu", BarMenu);