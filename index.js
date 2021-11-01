/**
* @file Startup and global functionality of the Agent Field Kit.
*
* @author IONIC Research Labs, a division of TSG.
* @version 0.1.0
* @copyright MIT License
*/

var nrt = new NRT();
var ssa = new SSA();
//var eyesears = new EyesEars();

var openMenuSelector = null;

/**
* Displays a specific <section> while hiding all others.
*
* @param {String} selector The selector name of the section to show.
* @param {String} type (optional) The type of selector to target ("id"
* or "class").
*/
function showSection(selector, type="id") {
  var allSections = document.querySelectorAll("section");
  if (type == "id") {
    var section = document.querySelector("#"+selector);
  } else if (type == "class"){
    section = document.querySelector("."+selector);
  } else {
    throw (new Error("Unrecognized selector type \""+type+"\""));
  }
  for (var count = 0; count < allSections.length; count++) {
    if (allSections[count] === section) {
      section.style.display = "inline-block";
      if ((allSections[count].instance != undefined) && (allSections[count].instance != null)) {
        allSections[count].instance.enable();
      }
    } else {
      allSections[count].style.display = "none";
      if ((allSections[count].instance != undefined) && (allSections[count].instance != null)) {
        allSections[count].instance.disable();
      }
    }
  }
  hideMenu(openMenuSelector);
  saveSection(selector, type);
}

/**
* Opens a menu while closing any currently opened one.
*
* @param {String} selector The selector of the menu to open.
*/
function showMenu(selector) {
  if (openMenuSelector != null) {
    hideMenu(openMenuSelector);
  }
  try {
    document.querySelector(selector).style.display = "block";
    openMenuSelector = selector;
  } catch (err) {
    console.error(err);
  }
}

/**
* Hides an open menu.
*
* @param {String} selector The selector of the menu to hide.
*/
function hideMenu(selector) {
  if (selector == null) {
    openMenuSelector = null;
    return;
  }
  try {
    document.querySelector(selector).style.display = "none";
    openMenuSelector = null;
  } catch (err) {
    console.error(err);
  }
}

/**
* Saves the currently opened section selector to local storage.
*
* @param {String} selector The selector name of the open section.
* @param {String} type The type of selector.
*/
function saveSection(selector, type) {
  var fkinfo = new Object();
  fkinfo.section = new Object();
  fkinfo.section.selector = selector;
  fkinfo.section.type = type;
  localStorage.AFK_FieldKit = JSON.stringify(fkinfo);
}

/**
* Restores and displays the last opened section if available in
* local storage. If not, the "NRT" section is displayed by default.
*/
function restoreSection() {
  var fkinfo = localStorage.getItem("AFK_FieldKit");
  if (fkinfo != null) {
    console.log ("Restored settings: "+fkinfo);
    fkinfo = JSON.parse(fkinfo);
    showSection(fkinfo.section.selector, fkinfo.section.type);
  } else {
    console.log ("No settings saved. Showing default section \"NRT\".")
    showSection("NRT");
  }
}

window.onload = _ => {
  restoreSection();
}
