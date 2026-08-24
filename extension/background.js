// QueryCraft — Background Service Worker (Manifest V3)
// Handles global keyboard commands & context menus registered in manifest.json

chrome.runtime.onInstalled.addListener(() => {
  console.log("QueryCraft installed & initializing context menus")
  
  // Remove existing to prevent duplicate IDs on reload
  chrome.contextMenus.removeAll(() => {
    // 1. Highlight SQL -> Explain & Optimize
    chrome.contextMenus.create({
      id: "qc-explain-sql",
      title: "QueryCraft: Explain & Optimize SQL",
      contexts: ["selection"]
    })

    // 2. Highlight Error -> SQL Error Doctor
    chrome.contextMenus.create({
      id: "qc-error-doctor",
      title: "QueryCraft: SQL Error Doctor (Fix Error)",
      contexts: ["selection"]
    })

    // 3. Open In-Situ Spotlight Command Bar
    chrome.contextMenus.create({
      id: "qc-open-spotlight",
      title: "QueryCraft: Open Command Bar (Cmd+Shift+K)",
      contexts: ["all"]
    })
  })
})

// Handle Context Menu Clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (!tab || !tab.id) return

  let action = "prompt"
  if (info.menuItemId === "qc-explain-sql") action = "explain"
  else if (info.menuItemId === "qc-error-doctor") action = "doctor"
  else if (info.menuItemId === "qc-open-spotlight") action = "prompt"

  chrome.tabs.sendMessage(tab.id, {
    type: "OPEN_SPOTLIGHT",
    action: action,
    selectedText: info.selectionText || ""
  }).catch(() => {
    // If content script was not injected on that tab, try injecting it dynamically
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ["content.js"]
    }).then(() => {
      chrome.tabs.sendMessage(tab.id, {
        type: "OPEN_SPOTLIGHT",
        action: action,
        selectedText: info.selectionText || ""
      }).catch(() => {})
    }).catch(() => {})
  })
})

// Handle Global Keyboard Commands
chrome.commands.onCommand.addListener((command) => {
  if (command === "toggle-spotlight") {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs && tabs[0] && tabs[0].id) {
        chrome.tabs.sendMessage(tabs[0].id, { type: "TOGGLE_SPOTLIGHT" }).catch(() => {
          chrome.scripting.executeScript({
            target: { tabId: tabs[0].id },
            files: ["content.js"]
          }).then(() => {
            chrome.tabs.sendMessage(tabs[0].id, { type: "TOGGLE_SPOTLIGHT" }).catch(() => {})
          }).catch(() => {})
        })
      }
    })
  } else if (command === "toggle-compact") {
    chrome.runtime.sendMessage({ type: "TOGGLE_COMPACT" }).catch(() => {})
  }
})

