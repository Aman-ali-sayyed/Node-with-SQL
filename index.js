const { faker } = require('@faker-js/faker');
const mysql = require('mysql2');
const express = require('express');
const app = express();
const path = require("path");
const methodOverride = require("method-override");
const {v4: uuidv4} = require("uuid");

let port = 8080;

app.use(methodOverride("_method"));
app.use(express.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/views"));

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    database: 'delta_app',
    password: 'Aman@195425548'
});

let getRandomUser = () => {
    return [
      faker.string.uuid(),
      faker.internet.userName(),
      faker.internet.email(),
      faker.internet.password(),
    ];
}

//home route
app.get("/", (req, res) => {
    let q = `SELECT count(*) FROM user`;
    try {
        connection.query(q, (err, result) => {
            if(err) throw err;
            let count = result[0]["count(*)"];
            res.render("home.ejs", { count });
        });
    } catch(err) {
        console.log(err);
        res.send("some error in DB");
    }
});

//show route
app.get("/user", (req, res) => {
    let q = `SELECT * FROM user`;

    try {
        connection.query(q, (err, users) => {
            if(err) throw err;
            
            //console.log(result);
            //res.send(result);
            res.render("showusers.ejs", {users});
        });
    } catch(err) {
        console.log(err);
        res.send("some error in DB");
    }
});

//Edit Route
app.get("/user/:id/edit", (req, res) => {
    let {id} = req.params;
    let q = `SELECT * FROM user WHERE id='${id}'`;
    try {
        connection.query(q, (err, result) => {
            if(err) throw err;
            let user = result[0];
            res.render("edit.ejs", { user });
            //res.send(result);
        });
    } catch(err) {
        console.log(err);
        res.send("some error in DB");
    }
});

// UPDATE Route
app.patch("/user/:id", (req, res) => {
    let {id} = req.params;
    let {password: formPass, username: newUsername} = req.body;
    let q = `SELECT * FROM user WHERE id='${id}'`;

    try {
        connection.query(q, (err, result) => {
            if(err) throw err;
            let user = result[0];
            if(formPass != user.password) {
                res.send("WRONG password");
            } else {
                let q2 = `UPDATE user SET username='${newUsername}' WHERE id='${id}'`;
                connection.query(q2, (err, result) => {
                    if(err) throw err;
                    res.redirect("/user");
                });
            }
        });
    } catch(err) {
        console.log(err);
        res.send("some error in DB");
    }
});

app.get("/user/new", (req, res) => {
    res.render("newuser.ejs");
});

// /user/new to add new user to our data.
app.post("/user/new", (req, res) => {
    let {username, email, password} = req.body;
    let id = uuidv4();

    //query to insert new User
    let q = `INSERT INTO user (id, username, email, password) VALUES ('${id}', '${username}', '${email}', '${password}')`;
    try {
        connection.query(q, (err, result) => {
            if(err) throw err;
            res.redirect("/user");
        });
    } catch(err) {
        res.send("some error occured");
    }
});

app.get("/user/:id/delete", (req,res) => {
    let { id } = req.params;
    let q = `SELECT * FROM user WHERE id='${id}'`;

    try {
        connection.query(q, (err, result) => {
            if(err) throw err;
            let user = result[0];
            res.render("delete.ejs", { user });
        });
    } catch(err) {
        res.send("some error with DB");
    }
});

app.delete("/user/:id/", (req, res) => {
    let { id } = req.params;
    let { password } = req.body;
    let q = `SELECT * FROM user WHERE id='${id}'`; 

    try{
        connection.query(q, (err, result) => {
            if(err) throw err;
            let user = result[0];

            if(user.password != password) {
                res.send("WRONG Password entered!");
            } else {
                let q2 = `DELETE FROM user WHERE id='${id}'`; //Query to delete
                connection.query(q2, (err, result) => {
                    if(err) throw err;
                    else {
                        console.log(result);
                        console.log("deleted!");
                        res.redirect("/user");
                    }
                });
            }
        });
    } catch {
        res.send("some error with DB");
    }
});

app.listen(port, () => {
    console.log(`app is listening on ${port}`);
});

//Inserting New Data
// let q = "INSERT INTO user (id, username, email, password) VALUES ?";

// let data = [];
// for(let i = 1; i <= 100; i++) {
//     data.push(getRandomUser());
// }

// let users = [
//     ["123b", "123_newuserb", "abc@gmail.comb", "abcb"],
//     ["123c", "123_newuserc", "abc@gmail.comc", "abcc"],
// ];


// connection.end();++