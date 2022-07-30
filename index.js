const express = require('express');
const app = express();
const pool = require("./dbPool.js");
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static('public'));
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));

//################
//## GET ROUTES ##
//################
app.get('/', (req, res) => {
  res.render('index')
});

app.get('/admin', (req, res) => {
  res.render('admin')
});

app.get('/login', (req, res) => {
  res.render('login', { 'ID': 0 })
});

app.get('/profile', (req, res) => {
  res.render('profile', { 'ID': 0 })
});

app.get('/signup', (req, res) => {
  res.render('signup')
});

app.get('/subscriptions', (req, res) => {
  res.render('subscriptions');
});

app.get('/logout', (req, res) => {
  res.render('logout')
});

// Juli will work on this section
app.get('/order', async (req, res) => {
  // let sql = 'SELECT COUNT(*) FROM otter_user';
  // let rows = await executeSQL(sql);
  // console.log(rows);
  res.render('order');
});

//#################
//## POST ROUTES ## *put post routes below here
//#################

// User Login Post endpoint
app.post('/login', async (req, res) => {

  let username = req.body.username;
  let password = req.body.password;
  let userId = 0
  let sql = `
             select *
             from otter_user
             where username = ?`
  let params = [username];

  let user = await executeSQL(sql, params)
  user = user[0]

  //check for password match
  if (user.password == password) {
    //if password matches, set userId to id of user
    userId = Number(user.user_id)
  } else { //otherwise set to -1
    userId = -1;
  }
  //rerender login but pass userId so login script can set to local storage
  res.render('login', { 'ID': userId })
});

//getUserData endpoint
// to use this enpoint see example getUserData in profileScript.js
app.post('/getUserData', async (req, res) => {
  let params = [req.body.userId];
  let sql = `
              select * from otter_user
              where user_id = ? `
  let user = await executeSQL(sql, params)

  res.send(user[0]);

})

//Signup post endpoint
app.post('/signup', async (req, res) => {
  let u = req.body;
  let params = [u.username, u.password, 0, u.firstname,
  u.lastname, u.address, u.city, u.state, u.zip]

  let sql = `insert into otter_user
              (username, password, user_access, first_name, last_name, address,
              city, state, zip)
              values ( ?, ?, ?, ?, ? ,? ,? ,? ,?)`
  await executeSQL(sql, params)
  res.render('login', { 'ID': 0 })
});

//Update User post
app.post('/profile', async (req, res) => {
  let u = req.body;
  let params = [u.username, u.password, u.firstname,
  u.lastname, u.address, u.city, u.state, u.zip, u.userId]

  let sql = `update otter_user
              set username = ?, password = ?, first_name=?,
              last_name = ? , address = ?,
              city = ?, state= ?, zip = ?
              where user_id = ?`

  await executeSQL(sql, params)
  res.render('profile', {'ID': u.userId})
});


// INTERNAL API - Used by modal in subscriptions.ejs (by Juli)
// Returns single package data for a package_id
app.get('/api/package/:id', async (req, res) => {
  let packageId = req.params.id;
  let sql = 'SELECT * FROM otter_package WHERE package_id = ? ';
  let packageRow = await executeSQL(sql, [packageId]);
  res.send(packageRow);
});

// Starts server which listens on port 3000
app.listen(3000, () => {
  console.log('server started');
});

// ^ DO IMPORTANT STUFF UP THERE ^

//###############
//# Execute SQL #
//###############
async function executeSQL(sql, params) {
  return new Promise((resolve, reject) => {
    pool.query(sql, params, (err, rows, fields) => {
      if (err) throw err;
      resolve(rows);
    });
  });
};

