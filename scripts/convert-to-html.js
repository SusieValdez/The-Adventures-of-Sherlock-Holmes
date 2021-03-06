/*
- open ./assets/The-Adventures-of-Sherlock-Holmes.text
- load the contents into a single (huge string)
- convert string it to an valid HTML string (kinda like lexing/parsing, you've got to find the patterns which distininguish the tag you're creating)
  - What are the distinguishing features?
    - lists: 
    - paragraphs: 
    - headings:
  - hints:
    - you might want to use the split method on the string object
    - you might want to use the replace method on the string object
    - you might want to loop over the text, character by character, like you do in your lexer
      - you can then chunk up the text and work on it in smaller batches
- once ypu have the HTML string, open ./index.html and write the string to the file.
*/
const fs = require("fs");

const romanNumerals = [
  "I",
  "II",
  "III",
  "IV",
  "V",
  "VI",
  "VII",
  "VII",
  "IX",
  "X",
  "XI",
  "XII",
  "XIII",
];

function isRomanNumeral(str) {
  return romanNumerals.indexOf(str) >= 0;
}

function startsWithRomanNumeral(line) {
  const splitLine = line.split(".");
  if (splitLine.length != 2) {
    return false;
  }
  if (isRomanNumeral(splitLine[0])) {
    return true;
  }
  return false;
}

function endsWithBookTitle(line) {
  const splitLine = line.split(".");
  return splitLine[1] != "";
}

function titleLineToId(line) {
  return line.split(".")[1].trim().replaceAll(" ", "-").toLowerCase();
}

function convertLine(line) {
  const words = line.split(" ");
  let result = "";
  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    if (word.startsWith("_") && word.endsWith("_")) {
      result += `<em>${word.replaceAll("_", "")}</em> `;
      continue;
    }
    result += `${word} `;
  }
  return result;
}

const convert = (content) => {
  const lines = content.split("\r\n");
  let result = "";
  result += `<div class="hidden">\n`;
  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    if (line === "The Adventures of Sherlock Holmes") {
      result += `</div>\n`; // End hidden content at beginning
      result += `<div class="header">\n`;
      result += `<h1 class="main-title">${line}</h1>\n`;
      continue;
    }
    if (
      line ===
      "*** END OF THE PROJECT GUTENBERG EBOOK THE ADVENTURES OF SHERLOCK HOLMES ***"
    ) {
      result += `<div class="hidden">\n`;
      continue;
    }
    if (line === "by Arthur Conan Doyle") {
      result += `<span class="author">${line}</span>\n`;
      result += `</div>\n`; // End header
      result += `<hr>\n`;
      continue;
    }
    if (line === "Contents") {
      result += `<div class="contents">\n`;
      result += `<h2 class="contents-heading">${line}</h2>\n`;
      i += 2; // Skip empty space
      let itemsStr = "";
      while (lines[i] !== "") {
        itemsStr += `  <li class="link"><a href="#${titleLineToId(lines[i])}">${
          lines[i]
        }</a></li>\n`;
        i++;
      }
      result += `<ol class="contents-list">\n${itemsStr}</ol>\n`;
      result += `<a href="https://gutenberg.org/ebooks/1661"><img class="project-gutenberg-img" src="./assets/project-gutenberg.png"/></a>\n`;
      result += `</div>\n`; // End contents
      continue;
    }
    if (startsWithRomanNumeral(line) && endsWithBookTitle(line)) {
      result += `<h2 id="${titleLineToId(
        line
      )}" class="book-titles">${line}</h2>\n`;
      continue;
    }
    if (startsWithRomanNumeral(line)) {
      result += `<h3 class="chapter-titles">${line}</h3>\n`;
      continue;
    }
    if (line === "") {
      continue;
    }
    let paragraphStr = "";
    while (lines[i] !== undefined && lines[i] !== "") {
      paragraphStr += `  ${convertLine(lines[i])}\n`;
      i++;
    }
    result += `<p>\n${paragraphStr}</p>\n`;
    if (i === lines.length - 3) {
      // No idea why it's '- 3'
      result += "</div>"; // End hidden content at end
    }
  }
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>The Adventures of Sherlock Holmes</title>
  <link rel="stylesheet" href="styles.css" />
</head>
<body>
<div class="page-container">
<div class="page">
<img class='hat-img' onclick="goToTheTop()" src="assets/hat.png">
${result}
</div>
</div>
<script src="script.js"></script>
</body>
</html>`;
};

let content;
try {
  content = fs.readFileSync(
    "./assets/The-Adventures-of-Sherlock-Holmes.txt",
    "utf-8"
  );
} catch (err) {
  console.error(err);
}

const htmlContent = convert(content);

try {
  fs.writeFileSync("./index.html", htmlContent);
} catch (err) {
  console.error(err);
}
