import mysql from "mysql";
import "dotenv/config";


console.log();
const connection = mysql.createConnection({
  host: "biioxpwp0gu7yvdpjfbk-mysql.services.clever-cloud.com",
  user: "ukmpsgfr5hly9zip",
  password: "15p6TrhMvJdsPCusj9BT",
  database: "biioxpwp0gu7yvdpjfbk",
});

connection.connect((error) => {
  if (error) throw error;
  console.log("Successfully connected to the database.");
});

export default connection;
