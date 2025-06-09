document.getElementById("transformButton").addEventListener("click", () => {
  chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
    const activeTab = tabs[0];
    if (activeTab) {
      chrome.scripting.executeScript(
        { target: { tabId: activeTab.id }, files: ["content.js"] },
        () => {
          chrome.tabs.sendMessage(activeTab.id, { type: "transformTo90s" });
        }
      );
    }
  });
});

document.getElementById("checkTailwindButton").addEventListener("click", () => {
  chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
    const activeTab = tabs[0];
    if (activeTab) {
      chrome.tabs.sendMessage(activeTab.id, { type: "checkTailwind" }, response => {
        alert(response.isTailwind ? "Tailwind is in use!" : "No Tailwind detected.");
      });
    }
  });
});

document.getElementById("shareCSSButton").addEventListener("click", () => {
  chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
    const activeTab = tabs[0];
    if (activeTab) {
      chrome.tabs.sendMessage(activeTab.id, { type: "shareCSS" }, response => {
        navigator.clipboard.writeText(response.css).then(() => {
          alert("CSS copied to clipboard!");
        });
      });
    }
  });
});

document.getElementById("timeMachineButton").addEventListener("click", () => {
  chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
    const activeTab = tabs[0];
    if (activeTab) {
      chrome.tabs.sendMessage(activeTab.id, { type: "timeMachine" });
    }
  });
});
