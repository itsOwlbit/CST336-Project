document.querySelector("#pkg").addEventListener("change", updateFields)




async function updateFields() {
  let num = document.querySelector('#pkg').value
  let url = `/pkg_details/${num}`
  //call our api
  let response = await fetch(url)
  let data = await response.json()
  console.log(data[0])

  //user that returned object data[0] to populate the fields.value
  document.querySelector('#price').value = data[0].price
  document.querySelector('#imgUrl').value = data[0].picture_url
document.querySelector('#description').value = data[0].description
}