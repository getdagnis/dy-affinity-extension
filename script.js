const body = document.querySelector("body");
const counter = document.createElement("div");
counter.className = "affinityScoreCounter";
body.appendChild(counter);

let currentScore = localStorage.getItem("urbanAffinityScore")
  ? JSON.parse(localStorage.getItem("urbanAffinityScore"))
  : { womens: 0, mens: 0, home: 0, lifestyle: 0, beauty: 0 };

updateAffinityCounter(currentScore);

chrome.runtime.onMessage.addListener(gotMessage);

function updateAffinityCounter(score) {
  counter.innerHTML = `
    <h5>Affinity Counter:</h5>
    <ul>
      <li>Men's Clothing: ${score.mens}</li>
      <li>Women's Clothing: ${score.womens}</li>
      <li>Home: ${score.home}</li>
      <li>Lifestyle: ${score.lifestyle}</li>
      <li>Beauty: ${score.beauty}</li>
    </ul>
  `;
}

function gotMessage(score) {
  console.clear();
  console.log("score", score);
  updateAffinityCounter(score);
}
