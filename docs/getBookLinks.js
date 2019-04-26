async function getBook(name) {
  const bookCon = await fetch(name);
  const book1 = await bookCon.json();
  const chaptersOnly = book1.filter(chp => chp.name.startsWith("book/chapter"));
  debugger;
  return book1;
}

async function go() {
  //todo this here I need to generate in
  return await getBook('https://api.github.com/repos/orstavik/JoiComponents/git/trees/master?recursive=2');
}

console.log(go());