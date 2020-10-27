console.log("background is running");

// Quick & dirty fix to find the current category for the addScore function
// TODO – read the current catgory from the page itself
let globalCurrentCategory = null;

// Intercepts XHR activity PUT request to get data about visited categories
chrome.webRequest.onBeforeRequest.addListener(
  function (details) {
    // Retrieves the 'activity' XHR PUT request's body, decodes it from raw format and parses to a JavaScript object
    const response =
      details.method === "PUT"
        ? JSON.parse(
            decodeURIComponent(
              String.fromCharCode.apply(
                null,
                new Uint8Array(details.requestBody.raw[0].bytes)
              )
            )
          )
        : null;

    // Searches for the category name in the 'breadcrumb' field of the activity response
    // Fixes the problem that 'beauty' category doesn't have a proper 'breadcrumb' field with an exception
    const category =
      response &&
      response.page_breadcrumb &&
      response.page_type === "product" &&
      response.category_id.includes("BEAUTY")
        ? "beauty"
        : response &&
          response.page_breadcrumb &&
          response.page_type === "product"
        ? response.page_breadcrumb[0]
        : "no category or not a product";

    if (
      category === "mens-clothing" ||
      category === "womens-clothing" ||
      category === "home" ||
      category === "lifestyle" ||
      category === "beauty"
    ) {
      addScore(category, 1);
      globalCurrentCategory = category;
    } else return null;
  },
  { urls: ["<all_urls>"] },
  ["requestBody", "extraHeaders"]
);

// Checks whether the item is added to the cart by listening to a "itemAddedToCart" XHR url
// TODO – Currently adds score even if the size is not selected and the item is not actually added to the cart
// Doesn't deal with multiple additions
chrome.webRequest.onBeforeRequest.addListener(
  function (details) {
    details.url.includes("itemAddedToCart") && globalCurrentCategory !== null
      ? addScore(globalCurrentCategory, 3)
      : null;
  },
  { urls: ["<all_urls>"] },
  ["requestBody", "extraHeaders"]
);

// Reads currently viewed category from the global variable and adds the necessary score
// TODO – read the current category from the page itself
function addScore(category, amount) {
  let currentScore = localStorage.getItem("urbanAffinityScore")
    ? JSON.parse(localStorage.getItem("urbanAffinityScore"))
    : { womens: 0, mens: 0, home: 0, lifestyle: 0, beauty: 0 };
  switch (category) {
    case "mens-clothing":
      currentScore.mens = currentScore.mens + amount;
      break;
    case "womens-clothing":
      currentScore.womens = currentScore.womens + amount;
      break;
    case "home":
      currentScore.home = currentScore.home + amount;
      break;
    case "lifestyle":
      currentScore.lifestyle = currentScore.lifestyle + amount;
      break;
    case "beauty":
      currentScore.beauty = currentScore.beauty + amount;
      break;
    default:
      return null;
      break;
  }
  console.log(currentScore);
  localStorage.setItem("urbanAffinityScore", JSON.stringify(currentScore));
  sendMessage(currentScore);
}

// Sends score data to the front-end script.js
function sendMessage(score) {
  chrome.tabs.getSelected(null, function (tab) {
    chrome.tabs.sendMessage(tab.id, score);
  });
}
