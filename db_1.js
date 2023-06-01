import mysql from "mysql";
import "dotenv/config";
const connection = mysql.createConnection({
    host: "blju26afwbwycv7gzmo3-mysql.services.clever-cloud.com",
    user: "ufoc68duye5qulev",
    password: "FilsbMd54LCyCQH9ebRx",
    database: "blju26afwbwycv7gzmo3",
});

connection.connect((error) => {
    if (error) throw error;
    console.log("Successfully connected to the database.");
});


connection.query('select * from users where username = "ashish.we2code" and password = "ashish.we2code"', (err, rows) => {
    if (err) {
        console.log("error--------===========" + err)
    } else {
        console.log("--ok------------====ok=====")
        console.log(rows)
    }
});
