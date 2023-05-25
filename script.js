const btn = document.getElementById('btn');
const MAX_RETRIES = 3;
const RETRY_INTERVAL = 1000;
let retryCount = 0;

function getData() {
  const year = document.getElementById("year").value;
  const month = document.getElementById("month").value;

  fetch(`/api?year=${year}&month=${month}`)
    .then(response => {
      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }
      return response.text();
    })
    .then(data => {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(data, "text/xml");
      const reserves = xmlDoc.getElementsByTagName("res");

      const ul = document.getElementById("reserves");
      ul.innerHTML = "";

      for (let i = 0; i < reserves.length; i++) {
        const txt = reserves[i].querySelector("txten").textContent;
        const value = reserves[i].querySelector("value").textContent;

        const li = document.createElement("li");
        li.innerText = `${txt} : ${value}`;
        ul.appendChild(li);
      }
    })
    .catch(error => {
      if (retryCount < MAX_RETRIES) {
        console.error(error);
        retryCount++;
        setTimeout(getData, RETRY_INTERVAL);
      } else {
        console.error(error);
        const errorMessage = document.getElementById("error-message");
        errorMessage.innerText = "Network error. Please try again later.";
      }
    });
}

btn.addEventListener('click', getData);
