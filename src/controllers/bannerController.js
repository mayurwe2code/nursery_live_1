import connection from "../../Db.js";

export function banner(req, res) {
    console.log("banner")
    if (req.body.type != "" && req.body.type != undefined) {
        connection.query("SELECT * FROM banner where type ='" + req.body.type + "'", (err, rows) => {
            if (err) {
                console.log(err)
                res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ "response": "failed find error", "success": false });
            } else {
                res.status(200).json({ "success": true, "response": rows })
            }
        });
    } else {
        connection.query("SELECT * FROM banner", (err, rows) => {
            if (err) {
                console.log(err)
                res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ "response": "failed find error", "success": false });
            } else {
                res.status(200).json({ "success": true, "response": rows })
            }
        });
    }

}