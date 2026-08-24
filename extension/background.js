// QueryCraft — Background Service Worker (Manifest V3)
// Handles global keyboard commands registered in manifest.json

chrome.commands.onCommand.addListener((command) => {
  if (command === "toggle-compact") {
    // Send message to the popup if it is open
    chrome.runtime.sendMessage({ type: "TOGGLE_COMPACT" }).catch(() => {
      // Popup is closed — nothing to do
    })
  }
})

// Keep service worker alive on install
chrome.runtime.onInstalled.addListener(() => {
  console.log("QueryCraft installed")
})
