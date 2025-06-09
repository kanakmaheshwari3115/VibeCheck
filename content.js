let cssVersions = [];

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "transformTo90s") {
    const currentCSS = getComputedStyleAsString();
    cssVersions.push(currentCSS); // Save current CSS for Time Machine
    request90sStyle(currentCSS).then(newCSS => {
      applyNewCSS(newCSS);
      addEmojis();
    });
  } else if (message.type === "checkTailwind") {
    const isTailwind = !!document.querySelector('[class*="container"]');
    sendResponse({ isTailwind });
  } else if (message.type === "shareCSS") {
    const currentCSS = getComputedStyleAsString();
    sendResponse({ css: currentCSS });
  } else if (message.type === "timeMachine") {
    if (cssVersions.length > 0) {
      const previousCSS = cssVersions.pop();
      applyNewCSS(previousCSS);
      alert("Time Machine Activated! Back to previous version.");
    } else {
      alert("No previous CSS versions to restore.");
    }
  }
});

function applyNewCSS(css) {
  const styleElement = document.createElement('style');
  styleElement.textContent = css;
  document.head.appendChild(styleElement);
}

function addEmojis() {
  const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6, button');
  const emojis = ['😎', '🎉', '🌈', '💾'];
  headings.forEach(el => {
    el.textContent += ' ' + emojis[Math.floor(Math.random() * emojis.length)];
  });
}

async function request90sStyle(css) {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage({ type: "generate90sStyle", css }, response => {
      if (response && response.css) {
        resolve(response.css);
      } else {
        reject("Failed to generate 90's style.");
      }
    });
  });
}
