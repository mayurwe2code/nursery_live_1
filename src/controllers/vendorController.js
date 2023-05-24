import connection from "../../Db.js";
import { StatusCodes } from "http-status-codes";
import nodemailer from "nodemailer"
import jwt from 'jsonwebtoken'

export function vendor_signup(req, res) {
    console.log("vendor_signup")
    if (req.body.email != "" && req.body.password != "") {
        let u_email = req.body.email.trim()
        let u_password = req.body.password.trim()
        let regex = /^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z]{2,4})+$/;
        console.log("__" + u_email + "__")
        if (regex.test(u_email)) {
            connection.query("SELECT * FROM vendor WHERE email = '" + u_email + "'",
                (err, rows) => {
                    if (err) {
                        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(err);
                    } else {
                        console.log(rows)
                        if (rows != "") {
                            res.status(200).send({ "res_code": "002", "response": "email already exists, please use logIn way", "success": false })
                        } else {
                            console.log("false")
                            const OTP = Math.floor(100000 + Math.random() * 900000);

                            connection.query('INSERT INTO `user_auth_by_otp` (`email`, `otp`, `user_password`) VALUES ("' + u_email + '","' + OTP + '","' + u_password + '")', (err, rows, fields) => {
                                if (err) {
                                    if (err.code == "ER_DUP_ENTRY") {
                                        res.status(200).send({ "res_code": "002", "response": "email already exist, check your mail or try after sometime", "success": false })
                                    } else {
                                        res.status(200).send({ "res_code": "003", "response": "error", "success": false })
                                    }
                                } else {
                                    if (rows != '') {
                                        const mail_configs = {
                                            from: 'ashish.we2code@gmail.com',
                                            to: u_email,
                                            subject: 'Nursery_live one time password',
                                            text: "use otp within 60 sec.",
                                            html: "<h1>your one time password " + OTP + " <h1/>"
                                        }
                                        nodemailer.createTransport({
                                            service: 'gmail',
                                            auth: {
                                                user: 'ashish.we2code@gmail.com',
                                                pass: 'nczaguozpagczmjv'
                                            }
                                        })
                                            .sendMail(mail_configs, (err) => {
                                                if (err) {
                                                    res.status(200).send({ "response": "not send email service error", "status": false })
                                                    return //console.log({ "email_error": err });
                                                } else {
                                                    res.status(200).send({ "res_code": "001", "success": true, "response": "send otp on your mail", "otp": OTP, "expire_time": 180 })
                                                    return { "send_mail_status": "send successfully", "success": true, "expire_time": 180 };
                                                }
                                            })
                                        setTimeout(function () {
                                            connection.query('DELETE FROM `user_auth_by_otp` WHERE `id` = "' + rows.insertId + '"', (err, rows, fields) => {
                                                if (err) {
                                                    console.log("err____________________232")
                                                    console.log({ "response": "find error", "success": false })
                                                } else {
                                                    console.log("delete__________________234")
                                                    console.log(rows)
                                                }
                                            })
                                        }, 60000 * 3)
                                    } else {
                                        console.log("Not insert in otp in database")
                                    }

                                }
                            })
                        }
                    }
                }
            );
        } else {
            res.status(200).send({ "response": "email formate is not valid", "success": false })
        }
    } else {
        console.log("please fill mail brfore submit")
        res.status(200).send({ "response": " brfore submit, please fill mail address", "success": false })
    }

}

export function vendor_otp_verify(req, res) {
    console.log("vendor_otp_verify________________")
    let user_email = req.body.email.trim()
    let user_otp = req.body.otp.trim()
    if (req.body.email != "" && req.body.otp != "") {
        // console.log('SELECT * FROM `user_auth_by_otp` WHERE email = "' + user_email + '" AND otp = "' + user_otp + '"')
        connection.query('SELECT * FROM `user_auth_by_otp` WHERE email = "' + user_email + '" AND otp = "' + user_otp + '"', (err, rows, fields) => {
            if (err) {
                console.log("err____________________267")
                console.log(err)
                res.status(200).send({ "response": "find error", "success": false })
            } else {
                console.log("_rows_________________271")
                console.log(rows)
                if (rows != "") {
                    if (user_email == rows[0].email && user_otp == rows[0].otp) {

                        connection.query("insert into vendor ( `email`,`password`) VALUES('" + user_email + "','" + rows[0].user_password + "') ",
                            (err, rows) => {
                                if (err) {
                                    console.log(err)

                                    if (err.code == "ER_DUP_ENTRY") {
                                        connection.query("SELECT * FROM vendor WHERE email = '" + user_email + "' ",
                                            (err, rows) => {
                                                if (err) {
                                                    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ "response": "something went wrong", "success": false });
                                                } else {
                                                    if (rows != "") {
                                                        console.log("___________________________________________________284_chkkkkkkkkkkkkkkk=============")
                                                        console.log(rows)
                                                        jwt.sign({ id: rows[0].vendor_id }, process.env.VENDOR_JWT_SECRET_KEY, function (err, token) {
                                                            res.status(200).json({ "success": true, "token": token, "user_details": rows });
                                                        })
                                                    } else {
                                                        res.status(200).json({ "success": false, "token": "" });
                                                    }
                                                }
                                            })
                                    } else {
                                        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ "response": "something went wrong", "success": false });
                                    }

                                } else {
                                    let uid = rows.insertId
                                    console.log("__________________________rows.insertId______________________")
                                    console.log(rows.insertId)
                                    jwt.sign({ id: rows.insertId }, process.env.VENDOR_JWT_SECRET_KEY, function (err, token) {
                                        //console.log(token);
                                        if (err) {
                                            //console.log(err)
                                        }
                                        connection.query('INSERT INTO `notification`(`actor_id`, `actor_type`, `message`, `status`) VALUES ("' + rows.insertId + '","vendor","welcome to nursery live please compleate your profile","unread"),("001","admin","create new vendor (vendor_id ' + rows.insertId + ')","unread")', (err, rows) => {
                                            if (err) {
                                                //console.log({ "notification": err })
                                            } else {
                                                console.log("_______notification-send__94________")
                                            }
                                        })
                                        res.send({ "success": true, "response": "successfully created your account", "user_id": rows.insertId, "token": token, "redirect_url": "http://localhost:3000/" })
                                    })



                                    // res.status(StatusCodes.OK).json({ message: "user added successfully" });
                                }
                            }
                        );


                    } else {
                        console.log("not match ________-278")
                    }
                } else {
                    res.status(200).send({ "response": "not matched, credential issue", "success": false })
                }
            }
        })
    } else {
        res.status(200).send({ "response": "please fill all inputs", "success": false })
    }
}

export function vendor_login(req, res) {
    let regex = /^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z]{2,4})+$/;
    let user_email = req.body.email.trim()
    let password = req.body.password.trim()

    console.log("VENDOR-----------------------------")
    console.log(req.body)
    console.log(user_email)
    console.log(regex.test(user_email))
    if (req.body.email != "" && req.body.password != "") {
        if (regex.test(user_email)) {
            console.log("true")
            connection.query('SELECT * FROM vendor WHERE email ="' + user_email + '" AND password ="' + password + '"', (err, rows) => {
                if (err) {
                    console.log(err)
                    res.status(200).send({ "response": "login error", "success": false })
                } else {
                    console.log(rows)
                    if (rows != "") {
                        let { vendor_id, owner_name, shop_name, email, password, mobile, shop_address, gstn, geolocation, shop_logo, availability, status, user_type } = rows[0]
                        console.log("rows[0].vendor_id_______________324___")
                        console.log(rows[0].vendor_id)
                        console.log(process.env.VENDOR_JWT_SECRET_KEY)
                        console.log("______________________________________________________________________________")
                        jwt.sign({ id: rows[0].vendor_id }, process.env.VENDOR_JWT_SECRET_KEY, function (err, token) {
                            //console.log(token);
                            if (err) {
                                //console.log(err)
                            }
                            if (owner_name != "" && shop_name != "" && email != "" && password != "" && mobile != "" && shop_address != "" && gstn != "" && geolocation != "" && shop_logo != "" && availability) {
                                res.send({ "success": true, "res_code": "001", "response": "successfully login", "token": token, "redirect_url": "http://localhost:3000/", "complete_profile": true, "vendor_detaile": { vendor_id, owner_name, shop_name, email, password, mobile, shop_address, gstn, geolocation, shop_logo, availability, status, user_type } })
                            } else {
                                res.send({ "success": true, "res_code": "001", "response": "successfully login", "token": token, "redirect_url": "http://localhost:3000/", "complete_profile": false, "vendor_detaile": { vendor_id, owner_name, shop_name, email, password, mobile, shop_address, gstn, geolocation, shop_logo, availability, status, user_type } })
                            }


                        })
                    } else {
                        res.status(200).send({ "success": false, "res_code": "003", "response": "creadintial not match" })
                    }
                }
            })
        } else {
            res.status(200).send({ "success": false, "res_code": "003", "response": "email formate no match" })

        }
    } else {
        console.log("please fill all inputs")
        res.status(200).send({ "success": false, "res_code": "003", "response": "please fill all inputs" })
    }
}

export function vendor_forgate_password(req, res) {
    let regex = /^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z]{2,4})+$/;
    if (regex.test(req.body.email.trim()) && req.body.email != "") {
        const OTP = Math.floor(100000 + Math.random() * 900000);


        connection.query("select * from vendor where email = '" + req.body.email.trim() + "'", (err, rows) => {
            if (err) {
                console.log(err)
                res
                    .status(StatusCodes.INTERNAL_SERVER_ERROR)
                    .json({ "response": "something went wrong", "status": false });
            } else {
                if (rows != "") {
                    connection.query('INSERT INTO `user_auth_by_otp` (`email`, `otp`) VALUES ("' + req.body.email + '","' + OTP + '")', (err, rows, fields) => {
                        if (err) {
                            if (err.code == "ER_DUP_ENTRY") {
                                res.status(200).send({ "status": "200", "response": "email already exist, check your mail or try after sometime", "success": false })
                            } else {
                                res.status(200).send({ "error": "find error ", "success": false })
                            }
                        } else {
                            if (rows != '') {
                                const mail_configs = {
                                    from: 'ashish.we2code@gmail.com',
                                    to: req.body.email,
                                    subject: 'Nursery_live one time password',
                                    text: "use otp within 60 sec.",
                                    html: "<h1>your one time password " + OTP + " <h1/>"
                                }
                                nodemailer.createTransport({
                                    service: 'gmail',
                                    auth: {
                                        user: 'ashish.we2code@gmail.com',
                                        pass: 'nczaguozpagczmjv'
                                    }
                                })
                                    .sendMail(mail_configs, (err) => {
                                        if (err) {
                                            res.status(200).send({ "response": "not send email service error", "success": false })
                                            return //console.log({ "email_error": err });
                                        } else {
                                            res.status(200).send({ "response": "send otp on your mail", "otp": OTP, "success": true, "expire_time": 180 })
                                            return { "send_mail_status": "send successfully", "expire_time": 180 };
                                        }
                                    })
                                setTimeout(function () {
                                    connection.query('DELETE FROM `user_auth_by_otp` WHERE `id` = "' + rows.insertId + '"', (err, rows, fields) => {
                                        if (err) {
                                            console.log("err____________________232")
                                            console.log(err)
                                        } else {
                                            console.log("delete__________________234")
                                            console.log(rows)
                                        }
                                    })
                                }, 60000 * 3)
                            } else {
                                console.log("Not insert in otp in database")
                            }

                        }
                    })
                } else {
                    res
                        .status(StatusCodes.INTERNAL_SERVER_ERROR)
                        .json({ "response": "email not exist", "status": false });
                }
            }
        })
    } else {
        res.status(200).send({ "response": "cheack eamil foramate", "success": false })
    }

}

export function vendor_forgate_password_update(req, res) {
    console.log("__________________user_forgate_password_update")
    let psw = req.body.password.trim()
    console.log(psw)
    console.log("update vendor set `password`= '" + psw + "' where vendor_id ='" + req.vendor_id + "'")
    connection.query(
        "update vendor set `password`= '" + psw + "' where vendor_id ='" + req.vendor_id + "'",
        (err, rows) => {
            if (err) {
                console.log(err)
                res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ "response": "something went wrong", "success": false });
            } else {
                console.log(rows.affectedRows)
                if (rows.affectedRows == '1') { res.status(StatusCodes.OK).json({ "response": "update your password successfully", "success": true, "user_detaile": rows }); } else { res.status(StatusCodes.OK).json({ "response": "update opration feild ", "success": false }); }

            }
        }
    );
}

export async function vendor_details(req, res) {
    connection.query("select * from vendor where vendor_id= '" + req.vendor_id + "'", (err, rows) => {
        if (err) {
            res
                .status(StatusCodes.INTERNAL_SERVER_ERROR)
                .json({ message: "something went wrong", "status": false });
        } else {
            res.status(StatusCodes.OK).json(rows);
        }
    });
}

export async function update_vendor_profile(req, res) {
    var { owner_name, shop_name, mobile, shop_address, gstn, geolocation, availability } = req.body;
    let srt_user = ""
    let srt_user1 = ""

    console.log("_________v_id__" + req.vendor_id)
    // console.log(req.file)
    // console.log(req.file.filename)
    if (req.file == undefined || req.file == '') {
        var image = "no image"
        srt_user = 'UPDATE `vendor` SET `owner_name`="' + owner_name + '",`shop_name`="' + shop_name + '",`mobile`="' + mobile + '",`shop_address`="' + shop_address + '",`gstn`="' + gstn + '",`geolocation`="' + geolocation + '",`availability`="' + availability + '" '
    } else {
        var image = "http://192.168.29.109:8888/vendor_shop_img/" + req.file.filename;
        //console.log(image)
        srt_user = 'UPDATE `vendor` SET `owner_name`="' + owner_name + '",`shop_name`="' + shop_name + '",`mobile`="' + mobile + '",`shop_address`="' + shop_address + '",`gstn`="' + gstn + '",`geolocation`="' + geolocation + '",`shop_logo`="' + image + '",`availability`="' + availability + '"'
    }
    if (req.headers.admin_token != "" && req.headers.admin_token != undefined) {
        srt_user += ' WHERE vendor_id = "' + req.body.vendor_id + '"'
        srt_user1 = "select * from vendor where vendor_id ='" + req.body.vendor_id + "' "
    } else if (req.headers.vendor_token != "" && req.headers.vendor_token != undefined) {
        srt_user += ' WHERE vendor_id = "' + req.vendor_id + '"'
        srt_user1 = "select * from vendor where vendor_id ='" + req.vendor_id + "' "
    } else {
        srt_user = ""
    }

    console.log(srt_user)
    connection.query(srt_user, (err, rows) => {
        if (err) {
            console.log(err)
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "something went wrong", "success": false });
        } else {

            connection.query(srt_user1, (err, rows) => {
                if (err) {
                    console.log(err)
                } else {
                    res.status(StatusCodes.OK).json({ message: "updated vendor successfully", "success": true, "vendor_detaile": rows });
                }
            }
            );
        }
    }
    );
}

export async function admin_add_vendor(req, res) {
    var { owner_name, shop_name, email, mobile, shop_address, gstn, geolocation, availability } = req.body;
    let srt_user = ""
    // console.log(req.file)
    // console.log(req.file.filename)
    if (req.file == undefined || req.file == '') {
        var image = "no image"
        srt_user = 'INSERT INTO `vendor` (`owner_name`,`shop_name`,`email`,`mobile`,`shop_address`,`gstn`,`geolocation`,`availability`, `created_by`,`created_by_id`) VALUES ("' + owner_name + '","' + shop_name + '","' + email + '","' + mobile + '","' + shop_address + '","' + gstn + '","' + geolocation + '","' + availability + '","admin","' + req.created_by_id + '")'
    } else {
        var image = "http://192.168.29.109:8888/vendor_shop_img/" + req.file.filename;
        //console.log(image)
        srt_user = 'INSERT INTO `vendor` (`owner_name`,`shop_name`,`email`,`mobile`,`shop_address`,`gstn`,`geolocation`,`shop_logo`,`availability`,`created_by`,`created_by_id`) VALUES ("' + owner_name + '","' + shop_name + '","' + email + '","' + mobile + '","' + shop_address + '","' + gstn + '","' + geolocation + '","' + image + '","' + availability + '","admin","' + req.created_by_id + '")'
    }
    console.log(srt_user)
    connection.query(srt_user, (err, rows) => {
        if (err) {
            console.log(err)
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "something went wrong", "success": false });
        } else {
            res.status(StatusCodes.OK).json({ message: "add vendor successfully", "success": true });
        }
    }
    );
}

export function vendor_list(req, res) {
    let req_obj = req.body
    let search_query = "SELECT * FROM vendor WHERE "
    let m = 0
    for (let k in req_obj) {
        if (req_obj[k] != "") {
            if ("search" == k) {
                search_query += `owner_name LIKE "%${req_obj[k]}%" OR  shop_name LIKE "%${req_obj[k]}%" AND  `
            } else {
                search_query += `${k} = "${req_obj[k]}" AND  `
            }
        }
        if (m == Object.keys(req_obj).length - 1) {
            search_query = search_query.substring(0, search_query.length - 5)
        }
        m++
    }
    console.log(search_query)
    connection.query(search_query, (err, rows) => {
        if (err) {
            console.log(err)
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "something went wrong", "success": false });
        } else {
            res.status(StatusCodes.OK).json(rows);
        }
    }
    );
}


export function admin_change_vendor_status(req, res) {
    let res_obj = req.body;
    let query_ = `UPDATE vendor SET vendor_id= '${res_obj["vendor_id"]}' `
    for (let k in res_obj) {
        if ("vendor_id" != k) {
            query_ += ` , ${k} = '${res_obj[k]}' `
        }
    }
    console.log(`${query_} WHERE vendor_id ='${res_obj["vendor_id"]}' `)
    connection.query(`${query_} WHERE vendor_id ='${res_obj["vendor_id"]}' `, (err, rows) => {
        if (err) {
            console.log(err)
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ "response": "something went wrong", "success": false });
        } else {
            if (rows.affectedRows == '1') {
                if (res_obj.status != "" && res_obj.status != undefined && res_obj.status != null) {
                    res.status(StatusCodes.OK).json({ "response": "updated successfull", "success": true, status: res_obj.status });
                } else {
                    res.status(StatusCodes.OK).json({ "response": "updated successfull", "success": true });

                }
            } else {
                res.status(StatusCodes.OK).json({ "response": "something went wrong", "success": false });
            }

        }
    }
    );
}

// var notification = {
//     "title": "tttt",
//     "text": "tccttt"
// }

// var fcm_tokens = ["e42h1iTmRwGlyuwn9nGqu4:APA91bH6_qHLmPMYCjrkI1-l2eswwsWMxZJeMz9WRozFYA-DzNOCS58L9HPGaRWTaxKj7Zg4pJx2TRgZPU4O8IY7UgqJ5S6A8DY4BODWfQDdlFNZLaZmz5heuAlJdxI2Y-XVFcjNimDh"]

// var notification_body = {
//     "notification": notification,
//     "registrations_ids": fcm_tokens
// }
// fetch("https://fcm.googleapis.com/fcm/send", { "method": POST, "headers": { "authorization": "keys=" + "AAAABsq8jZc:APA91bG99gTYMmsMI_vlIJhjAxU6ta8j24v4dg-tInV4dKDUXqBzx3ORj_n0aI5k7opUvuyKI0nGhulfolpJgSFf2d5rnMfrN5CGA2fkpbCqTIlaidCChdDa5Gs7ymScojbL5pC93B54", "Content-Type": "application/json" }, "body": JSON.stringify(notification_body) }).then(() => {
//     console.log("notification send successfully")
// }).catch((err) => { console.log(err) })