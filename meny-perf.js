// ==UserScript==
// @name         MENY Perf
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Improves the performance (reduces cpu usage) on meny.no
// @author       Carl-Erik Kopseng
// @match        https://meny.no/*
// @grant        none
// ==/UserScript==

(function script() {
  // the svg with id 'spinner' in the svg definitions causes a cpu
  // load of approximately 24% constantly when monitored
  // using Chrome Process Explorer (sorted on cpu usage), Shift-Esc

  // some experiments on why this happens

  const spinner = document.getElementById("spinner");

  if (!spinner) {
    setTimeout(script, 200);
    return;
  }

  const defs = spinner.parentElement;
  const svg = defs.parentElement;

  // to remove cpu use of approx 24%, just remove the element ...
  const removeSpinner = () => defs.removeChild(spinner);

  // to re-add the cpu spike:
  const addSpinner = () => defs.appendChild(spinner);

  // to adjust cpu usage from 24% to 12%, set the svg element to display:none
  // things still work in Chrome, but this might cause bugs in other browsers
  // as this removes the element from the DOM, thus potentially making it
  // impossible to find when referencing it
  const displayNone = () => (svg.style.display = "none");
  const displayInitial = () => (svg.style.display = "initial");

  console.log("Removed cpu hog spinner");
  removeSpinner();
})();
