
var userId = localStorage.getItem('userId')
var greeting = ''

//just use async function for all of this
popStates()



async function getUserData() {
  if (userId > 0) {
    //##########################################
    //## This is the example for post endpoint #
    //##########################################
    //this uses the userId from local storage to return the user object which is all the user data from the otter_users table
    let url = '/getUserData'
    let payload = { 'userId': userId }
    let response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })
    user = await response.json()

    console.log(user)//<<<----Printing to console for you to see contents
    //~_~_~_~_~_~_~_~_~_~_~_~_~_~_~_~_~_~_~_~_~_~_~
    let details = [user.username, user.password, user.first_name, user.last_name, user.address, user.city, user.state, user.zip, userId]
    console.log(details)
    let userInfo = document.getElementById('updateProfile')
    console.log(userInfo[0])
    for (let i = 0; i < userInfo.length - 1; i++) {
      userInfo[i].value = details[i]
    }
    greeting = `Welcome ${user.username}`
  } else {
    greeting = "User Not Logged In!"
  }

  document.querySelector('#greeting').innerHTML = `<h1> ${greeting} </h1>`
}

//fill the states dropdown
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
  getUserData()
}