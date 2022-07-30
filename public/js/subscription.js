/* juli working in here */

// Event Listeners
let packageLinks = document.querySelectorAll('.package-link');
let modalTitle = document.querySelector('#modalTitle');

for(packageLink of packageLinks) {
  packageLink.addEventListener('click', getPackageInfo);
}

async function getPackageInfo() {
  let myModal = new bootstrap.Modal(document.getElementById('packageModal'));
  myModal.show();
  
  let url = `/api/package/${this.id}`;
  let response = await fetch(url);
  let data = await response.json();
  let packageInfo = document.querySelector('#packageInfo');

  packagePrice = parseFloat(data[0].price);

  modalTitle.innerHTML = `${data[0].name}`;
  packageInfo.innerHTML = `<img src=${data[0].picture_url} width="400"><br>`;
  packageInfo.innerHTML += `<p>${data[0].description}</p>`;
  packageInfo.innerHTML += `<p>$${packagePrice.toFixed(2)}</p>`;   
}