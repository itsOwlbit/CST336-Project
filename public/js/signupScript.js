popStates();

async function popStates() {
  let states = document.querySelector('#state');

  // do the select one
  states.innerHTML = `<option>Select One</option>`;

  let url = 'https://cst336.herokuapp.com/projects/api/state_abbrAPI.php';
  let data = await fetch(url)
    .then((response) => response.json())

  for (const state in data) {
    //append data 
    let usps = data[state]['usps'];
    let name = data[state]['state'];
    states.innerHTML += `<option value="${usps}">${name}</option>`
  }
}