const express = require('express');
const app = express();
const pool = require("./dbPool.js");
const bodyParser = require("body-parser");
const session = require('express-session')
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static('public'));
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));

//Stuff for session ?
//app.set('trust proxy', 1) // trust first proxy
app.use(session({
  secret: 'otterbot',
  resave: false,
  saveUninitialized: true
}))

//################
//## GET ROUTES ##
//################
app.get('/', (req, res) => {
  res.render('index')
});

//app.get('/admin', (req, res) => {
//   //check session variable isAdmin. If not admin, redirect to root

// res.render('admin')
//});

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

app.get('/about', (req, res) => {
  res.render('about');
});
app.get('/logout', (req, res) => {
  //remove session variables
  req.session.destroy(function(err) {
    // cannot access session here
  });
  res.render('logout')
});

// Used by Juli for order.ejs
app.get('/order', async (req, res) => {
  let sql = 'SELECT * FROM otter_package ';
  let packageRow = await executeSQL(sql);

  res.render('order', { 'packages': packageRow });
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
    //using session to verify admin. Set isAdmin true if its olive :)
    if (user.user_access == 1) { req.session.isAdmin = true }
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

  let sql = `INSERT into otter_user
              (username, password, user_access, first_name, last_name, address,
              city, state, zip)
              values ( ?, ?, ?, ?, ? ,? ,? ,? ,?)`
  try {
    let response = await executeSQL(sql, params)
    res.redirect('/login')
  } catch {
    res.render('signup', { 'message': 'Failed to create account' })
  }
});

//Update User post
app.post('/profile', async (req, res) => {
  let u = req.body;
  let params = [u.username, u.password, u.firstname,
  u.lastname, u.address, u.city, u.state, u.zip, u.userId]

  let sql = `update otter_user
              set username = ?, password = ?, first_name = ?,
              last_name = ? , address = ?,
              city = ?, state= ?, zip = ?
              where user_id = ?`
  await executeSQL(sql, params)
  res.render('profile', { 'ID': u.userId })

});



// Order.ejs Post - by Juli
app.post('/order', async (req, res) => {
  let total = (req.body.totalAmount).slice(1);
  let params = [req.body.userId, req.body.packageId,
    total, 1];
  let sql = `INSERT INTO otter_subscription
            VALUES (null, ?, ?, ?, now(), ?) `;
  await executeSQL(sql, params);

  let packageSql = 'SELECT * FROM otter_package';
  let packageRow = await executeSQL(packageSql);

  res.render('order', { 'message': 'Cookie subscription successfully added.', 'packages': packageRow });
});

// INTERNAL API - by Juli
// Used by modal in subscriptions.ejs and order.ejs
// Returns one package's data for a specific package_id
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
      if (err) {
        reject(err)
      } else {
        resolve(rows);
      }
    });
  })
};



///////////////
/// FOR KEV ///
///////////////
app.get("/subs", async function(req, res) {
  let params = [req.query.userId]
  let sql = `SELECT *
            FROM otter_subscription
            natural join otter_package
            where user_id = ?`;
  let rows = await executeSQL(sql, params);
  res.send(rows)
});
//Delete sub route  from profile page
app.get("/delSub", async function(req, res) {
  let params = [req.query.subId]
  let sql = `delete from otter_subscription
              where subscription_id = ?`;
  let rows = await executeSQL(sql, params);
  res.redirect('/profile')
});

//EDIT PACKAGE TABLE
app.get('/admin', async function(req, res) {

  //If unlocked variable is set to true then anyone can access the admin page
  //If unlocked variable is set to false then only admin accounts can access admit page
  let unlocked = true;
  
  if (req.session.isAdmin || unlocked) {

    let sql = `SELECT package_id, name, price, picture_url, description
            FROM otter_package`;
    let rows = await executeSQL(sql);

    res.render('admin', { "packages": rows });

  } else {
    res.redirect('/')
  }

});

//MAKING A ROUTE FOR PACKAGE DETAILS
app.get('/pkg_details/:name', async function(req, res) {
  let params = [req.params.name]

  let sql = `SELECT *
            FROM otter_package
            where package_id = ?`;
  let rows = await executeSQL(sql, params);

  res.send(rows);

});



app.post("/admin", async function(req, res) {

  let u = req.body
  let params = [u.price, u.picture_url,
  u.description, u.package_id]
  let sql = `UPDATE otter_package
                set price = ?,                
               picture_url = ?,
               description = ?
             WHERE package_id =  ?`;

  rows = await executeSQL(sql, params);
  res.render('admin', { "packages": rows });
});

