//if user ID is greater than 0 its valid login set the local storage variable to user ID
console.log(`user id: ${userId}`)
if (userId > 0) {
  localStorage.setItem('userId', userId)
} else if (userId < 0) { //if its negative we had failed login
  document.querySelector("#loginWarning").innerHTML = '<h2>Invalid Login/PW</h2>'
}

//check the userID
userId = localStorage.getItem('userId')
//if it is not null, we should redirect to the profile page
if (userId != null) {
  window.location.href = `profile`
}

