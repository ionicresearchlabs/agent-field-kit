/* Node.js script to compile kit into single page on-device (local) HTML file with no external dependencies, suitable for offline mobile use. */

const fs = require('fs');
const path = require('path');
const parse5 = require('parse5');

function findAttribute(attribute, node=null) {
  if (node == null) {
    return (null);
  }
  if (node.attrs == undefined) {
    return (null);
  }
  for (var count=0; count < node.attrs.length; count++) {
    var currentAttr = node.attrs[count];
    if (currentAttr.name == attribute) {
      return (currentAttr.value);
    }
  }
  return (null);
}

function deleteAttribute(attribute, node=null) {
  if (node == null) {
    return (false);
  }
  if (node.attrs == undefined) {
    return (false);
  }
  for (var count=0; count < node.attrs.length; count++) {
    var currentAttr = node.attrs[count];
    if (currentAttr.name == attribute) {
      node.attrs.splice(count, 1);
      return (true);
    }
  }
  return (false);
}

function findNodes(name, doc) {
  for (var count=0; count < doc.childNodes.length; count++) {
    var childNode = doc.childNodes[count];
    if (childNode.nodeName == name) {
      return (childNode);
    }
  }
  return (null);
}

function replaceScriptNode(node) {
  var replaceFilePath = findAttribute("src", node);
  deleteAttribute("src", node);
  var insertFile = fs.readFileSync(replaceFilePath);
  console.log ("Inserting script contents: "+replaceFilePath);
  var textNode = new Object();
  textNode.nodeName = "#text";
  textNode.value = String.fromCharCode(13) + insertFile.toString() + String.fromCharCode(13);
  textNode.parentNode = node;
  node.childNodes = [textNode];
}

function replaceStyleNode(nodes, index) {
  var replaceFilePath = findAttribute("href", nodes[index]);
  var insertFile = fs.readFileSync(replaceFilePath);
  console.log ("Inserting style contents: "+replaceFilePath);
  var styleNode = new Object();
  styleNode.nodeName = "style";
  styleNode.tagName = "style";
  styleNode.attrs = [];
  styleNode.namespaceURI = "http://www.w3.org/1999/xhtml";
  styleNode.parentNode = nodes[index];
  var textNode = new Object();
  textNode.nodeName = "#text";
  textNode.value = String.fromCharCode(13) + insertFile.toString() + String.fromCharCode(13);
  textNode.parentNode = styleNode;
  styleNode.childNodes = [textNode];
  nodes[index] = styleNode;
}

function replaceNodes(doc) {
  for (var count=0; count < doc.childNodes.length; count++) {
    var childNode = doc.childNodes[count];
    if (childNode.nodeName == "script") {
      replaceScriptNode(childNode);
    }
    if (childNode.nodeName == "link") {
      replaceStyleNode(doc.childNodes, count);
    }
    if (childNode.childNodes != undefined) {
      replaceNodes(childNode);
    }
  }
}


console.log("Compiling main page (index.html) to integrated single page (index-device.html)...");
var indexHTML = fs.readFileSync("index.html");
var document = parse5.parse(indexHTML.toString());
replaceNodes(document);
fs.writeFileSync("index-device.html", parse5.serialize(document));
console.log ("Done.");
