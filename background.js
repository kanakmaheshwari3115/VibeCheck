const API_KEY = "YOUR_OPENAI_API_KEY";

async function fetchWithRetries(url, options, retries = 3, backoff = 1000) {
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const response = await fetch(url, options);
      if (!response.ok) {
        console.warn(`API returned status: ${response.status}`);
        if (response.status === 429 && attempt < retries - 1) {
          console.log(`Retrying after ${backoff}ms...`);
          await new Promise(resolve => setTimeout(resolve, backoff));
          backoff *= 2; // Exponential backoff
          continue;
        }
        throw new Error(`API returned status: ${response.status}`);
      }
      return response.json();
    } catch (err) {
      console.error(`Error during fetch: ${err.message}`);
      if (attempt === retries - 1) {
        throw err; // Throw error after last retry
      }
    }
  }
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "generate90sStyle") {
    console.log("Request received to generate 90's style CSS.");

    if (!message.css || typeof message.css !== "string" || message.css.trim() === "") {
      console.error("Invalid CSS input for GPT API");
      sendResponse({ error: "Invalid CSS input" });
      return;
    }

    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: "You are a CSS expert specialized in retro 90's themes." },
          { role: "user", content: `Transform this CSS into a 90's theme:\n${message.css}` }
        ],
        max_tokens: 1000
      })
    };

    fetchWithRetries("https://api.openai.com/v1/chat/completions", options)
      .then(data => {
        console.log("GPT API response:", data);
        if (data.choices && data.choices[0] && data.choices[0].message) {
          const css90s = data.choices[0].message.content;
          sendResponse({ css: css90s });
        } else {
          console.error("Unexpected GPT API response format:", data);
          sendResponse({ error: "Unexpected response format from GPT API" });
        }
      })
      .catch(err => {
        console.error("Failed to communicate with GPT API:", err);
        sendResponse({ error: "Failed to communicate with GPT API" });
      });

    return true; // Indicate asynchronous response
  }

  if (message.type === "checkTailwind") {
    console.log("Checking for Tailwind on the page...");

    chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
      const activeTab = tabs[0];
      chrome.scripting.executeScript(
        {
          target: { tabId: activeTab.id },
          function: checkTailwindOnPage
        },
        (results) => {
          if (results && results[0].result) {
            sendResponse({ tailwindDetected: results[0].result });
          } else {
            sendResponse({ tailwindDetected: false });
          }
        }
      );
    });

    return true; // Indicate async response
  }

  if (message.type === "shareCSS") {
    navigator.clipboard.writeText(message.css).then(() => {
      console.log("CSS copied to clipboard!");
      sendResponse({ success: true });
    }).catch(err => {
      console.error("Failed to copy CSS to clipboard", err);
      sendResponse({ error: "Failed to copy CSS to clipboard" });
    });

    return true; // Indicate async response
  }

  if (message.type === "addEmojis") {
    console.log("Adding emojis to the page...");

    chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
      const activeTab = tabs[0];
      chrome.scripting.executeScript(
        {
          target: { tabId: activeTab.id },
          function: addEmojisToPage
        },
        () => sendResponse({ success: true })
      );
    });

    return true; // Indicate async response
  }

  if (message.type === "timeMachine") {
    console.log("Restoring previous style...");

    chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
      const activeTab = tabs[0];
      chrome.scripting.executeScript(
        {
          target: { tabId: activeTab.id },
          function: restorePreviousStyle
        },
        () => sendResponse({ success: true })
      );
    });

    return true; // Indicate async response
  }
});

// **Helper functions to run on the page**

function checkTailwindOnPage() {
  const tailwindClass = document.querySelector('[class*="container"]');
  return tailwindClass !== null;
}

function addEmojisToPage() {
  const buttons = document.querySelectorAll('button');
  buttons.forEach(button => {
    if (!button.textContent.includes("🔥")) {
      button.textContent = "🔥 " + button.textContent;
    }
  });
  return true;
}

function restorePreviousStyle() {
  const styles = document.querySelectorAll('style, link[rel="stylesheet"]');
  styles.forEach(style => style.remove());

  const previousStyle = sessionStorage.getItem('previousStyle');
  if (previousStyle) {
    const styleElement = document.createElement('style');
    styleElement.textContent = previousStyle;
    document.head.appendChild(styleElement);
  }

  return true;
}
