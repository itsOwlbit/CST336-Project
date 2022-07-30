// juli work zone
const userId = localStorage.getItem('userId');

const shippingInfo = document.querySelector('#shippingInfo');
const orderSection = document.querySelector('.order-section');
orderSection.style.visibility = 'hidden';

console.log(typeof localStorage);
console.log(localStorage.getItem('userId'));

// Event listeners
window.addEventListener('load', getUserData);

async function getUserData() {
  if (userId > 0) {
    let url = '/getUserData';
    let payload = { 'userId': userId };
    
    let response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    
    user = await response.json();
    console.log(user);

    const userFullName = `${user.first_name} ${user.last_name}<br>`;
    const address = `${user.address}<br>${user.city}, ${user.state} ${user.zip}`;

    shippingInfo.innerHTML = userFullName + address;

    orderSection.style.visibility = 'visible';
  } else {
    shippingInfo.innerHTML = '<h3>Please login or signup first.</h3>'
  } 
}