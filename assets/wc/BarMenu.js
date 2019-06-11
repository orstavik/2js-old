function pathsToTree(mdFiles) {
  const chapters2 = mdFiles.map(path => path[0].substr(1).split("/"));
  const chapters3 = chapters2.filter(arr => arr.length === 3);
  const paths = chapters3.map(arr => [arr[1], arr[2], "/" + arr.join("/")]);
  const book = {};
  for (let chp of paths){
    (book[chp[0]] || (book[chp[0]] = {}))[chp[1]] = chp[2];
  }
  return book;
}

const treeNode = document.createElement("template");
treeNode.innerHTML = `<tree-node><a>sunshine</a>`;

function makeTreeNode(title, href) {
  let node = treeNode.content.cloneNode(true).children[0];
  node.children[0].innerText = title;
  href && node.children[0].setAttribute("href", href);
  return node;
}

function makeMenu(mdFiles, title) {
  const book = pathsToTree(mdFiles);
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