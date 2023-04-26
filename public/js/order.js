// Juli's Work Zone

// temporary variables to test until subscriptions works
// localStorage.setItem('otterCookiePackageId', '1');

//-------------------------- global variables
const userId = localStorage.getItem('userId');
let user = {};

let packageId = localStorage.getItem('otterCookiePackageId');
if(packageId === null) {
  packageId = 1;
}

const shippingCosts = [8.50, 8.70, 26.95];

// shipping details
const fullName = document.querySelector('#fullName');
const addressLine1 = document.querySelector('#addressLine1');
const addressLine2 = document.querySelector('#addressLine2');
const shippingAlert = document.querySelector('#shipping-alert');

// payment details
const cardAlert = document.querySelector('#card-alert');

// summary section
const subscriptionOption = document.querySelector('#subscriptionOption');
const shippingOption = document.querySelector('#shippingOption');
const totalAmount = document.querySelector('#totalAmount');
const orderBtn = document.querySelector('#orderBtn');
orderBtn.disabled = true;

//-------------------------- Event listeners
window.addEventListener('load', loadPage);

subscriptionOption.addEventListener('change', updatePackageSelected);

shippingOption.addEventListener('change', getTotalAmount);

//-------------------------- Event listener functions
async function loadPage() {
  subscriptionOption.value = packageId;
  getTotalAmount();

  if(userId > 0) {
    document.querySelector('#userId').value = userId;
    
    await getUserData();
    
    // validate shipping address (comes from user profile)
    // before enabling the order button
    if(validateShipping()) {
      fullName.value = `${user.first_name} ${user.last_name}`;
      addressLine1.value = `${user.address}`;
      addressLine2.value = `${user.city}, ${user.state} ${user.zip}`;
      orderBtn.disabled = false;
    } 

    if(packageId > 0) {
      document.querySelector('#packageId').value = packageId;
    }
  } else {
    fullName.value = 'N/A';
    addressLine1.value = 'N/A';
    addressLine2.value = '';
    
    shippingAlert.innerHTML = '<p>* Please login or signup to show your profile shipping address information.</p>';
  } 
}

// option selected that matches local storage package id
function updatePackageSelected() {
  if(packageId > 0) {
    // get updated package id and store in local storage
    packageId = subscriptionOption.value;
    localStorage.setItem('otterCookiePackageId', packageId);
    document.querySelector('#packageId').value = packageId;
  }

  getTotalAmount();
}

// update summary total amount
async function getTotalAmount() {
  const shippingIndex = document.querySelector('#shippingOption').value;
  let shippingPrice = Number.parseFloat(shippingCosts[shippingIndex]).toFixed(2);
  
  let url = '/api/package/' + packageId;
  let response = await fetch(url);
  let data = await response.json();

  let packagePrice = parseFloat(data[0].price);
  let total = (Number(shippingPrice) + Number(packagePrice)).toFixed(2);
  
  totalAmount.value = `$${total}`;
}

//-------------------------- other functions

// user data for shipping details
async function getUserData() {
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
}

// returns false if any details are missing
function validateShipping() {
  let isValid = false;

  if(user.first_name === null || user.last_name === null || 
    user.first_name === '' || user.last_name === '') {
    shippingAlert.innerHTML = '<p>* Missing first and/or last name.<br>Please update your profile.</p>';
  } else if(user.address === null || user.city === null ||
    user.state === null ||user.zip === null ||
    user.address === '' || user.city === '' ||
    user.state === '' || user.zip === '') {
    shippingAlert.innerHTML = '<p>* Missing full address information.<br>Please update your profile.</p>';
  } else {
    shippingAlert.innerHTML = '';
    isValid = true;
  }

  return isValid;
}

// returns false if any details are missing
function validatePayment() {
  let isValid = false;
  
  if((document.querySelector('input[name=cardType]:checked')) === null) {
    cardAlert.innerHTML = '<p>* Missing card type.</p>';
  } else if(document.querySelector('#cardNumber').value === '') {
    cardAlert.innerHTML = '<p>* Missing card number.</p>';
  } else if(document.querySelector('#cardExpire').value === '') {
    cardAlert.innerHTML = '<p>* Missing card expiration date.</p>';
  } else if(document.querySelector('#cardCvv').value === '') {
    cardAlert.innerHTML = '<p>* Missing CVV.</p>';
  } else {
    cardAlert.innerHTML = '';
    isValid = true;
  }

  return isValid;
}

function submitOrder() {
  if(validatePayment()) {
    // document.querySelector('#order').submit();
    document.querySelector('#visaCard').disabled = true;
    document.querySelector('#masterCard').disabled = true;
    packageId = '';
    localStorage.setItem('otterCookiePackageId', '1');
    return true;
  }
  return false;
}