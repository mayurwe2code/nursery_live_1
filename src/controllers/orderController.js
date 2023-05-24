import connection from "../../Db.js";
import { StatusCodes } from "http-status-codes";
import nodemailer from "nodemailer"

import fetch from 'node-fetch';
export async function add_order(req, res) {
  let vendore_id_array = [];
  let order_no_obj = {};
  let product_array = req.body;
  var fcm_tokens = [];
  console.log("----------add_order-check-13-------" + req.user_id)
  console.log(req.user_id);
  console.log(product_array);
  connection.query("SELECT * FROM user WHERE id='" + req.user_id + "'",
    (err, result) => {
      if (err) {
        console.log(err)
      } else {
        var { first_name, last_name, email, phone_no, pincode, city, address, alternate_address, user_log, user_lat, image } = result[0]
        if (first_name != '' && last_name != '' && email != '' && phone_no != '' && pincode != '' && city != '' && address != '' && alternate_address != '' && user_log != '' && user_lat != '') {
          console.log("===============user_detaile_check========21=====" + JSON.stringify(result))
          if (result[0].token_for_notification != "" && result[0].token_for_notification != undefined && result[0].token_for_notification != null) { fcm_tokens.push(result[0].token_for_notification) }

          product_array.forEach((item, index) => {

            console.log("------product_array--------26---index_no--" + index)
            console.log("---------------------------27---order_no_obj--" + order_no_obj + "---------vendore_id_array----" + vendore_id_array)
            console.log("-------------item----------28-----" + JSON.stringify(item))

            if (vendore_id_array.includes(item["vendor_id"])) {
              console.log("old_vendor___product_add_product_on_same_no.")
              let order_no_old = order_no_obj[item["vendor_id"]]

              let verify_code = JSON.stringify(order_no_old * 13)
              if (verify_code.length > 7) {
                verify_code = verify_code.substring(0, verify_code.length - 1)
              }

              console.log("++++++++++++++++++++++++++line---39___" + item["product_id"])
              connection.query("SELECT product_stock_quantity FROM product WHERE id='" + item["product_id"] + "'",
                (err, result) => {
                  if (err) {
                    console.log("---------error_product_stock_quantity-----line_43__" + JSON.stringify(err))
                    // res.status(500).send(err);
                  } else {
                    if (result != "") {
                      console.log("---------product_stock_quantity--result-of--" + item["product_id"] + "-line_48__" + JSON.stringify(result))
                      console.log(parseInt(result[0]["product_stock_quantity"]) + "-" + parseInt(item["total_order_product_quantity"]))
                      var update_stock_qty = parseInt(result[0]["product_stock_quantity"]) - parseInt(item["total_order_product_quantity"])
                      console.log("-----update_stock_qty---------50------" + update_stock_qty)
                      if (update_stock_qty >= 0 && item["total_order_product_quantity"] > 0) {
                        console.log("___pass__" + update_stock_qty + ">=" + 0 + "&&" + item["total_order_product_quantity"] + ">" + 0 + "___")
                        connection.query(
                          "insert into `order` ( `order_id`, `product_id`,`user_id`, `vendor_id`, `total_order_product_quantity`,`total_amount`,`total_gst`,`total_cgst`, `total_sgst`,`total_discount`, `shipping_charges`,`invoice_id`, `payment_mode`,`payment_ref_id`, `discount_coupon`,`discount_coupon_value`,`delivery_lat`,`delivery_log`, `user_name`, `address`, `email`, `pin_code`, `city`, `user_image`, `phone_no`,`delivery_verify_code`) VALUES ('" + order_no_old + "','" + item["product_id"] + "', '" + req.user_id + "','" + item["vendor_id"] + "','" + item["total_order_product_quantity"] +
                          "','" +
                          item["total_amount"] +
                          "','" +
                          item["total_gst"] +
                          "','" +
                          item["total_cgst"] +
                          "','" +
                          item["total_sgst"] +
                          "','" +
                          item["total_discount"] +
                          "','" +
                          item["shipping_charges"] +
                          "','" +
                          order_no_old +
                          "','" +
                          item["payment_mode"] +
                          "','" +
                          item["payment_ref_id"] +
                          "','" +
                          item["discount_coupon"] +
                          "','" +
                          item["discount_coupon_value"] +
                          "'," + user_lat + "," + user_log + ", '" + first_name + "', '" + address + "', '" + email + "', " + pincode + ", '" + city + "', '" + image + "','" + phone_no + "','" + verify_code + "')",
                          (err, rows) => {
                            if (err) {
                              console.log(err)
                              res.status(StatusCodes.INSUFFICIENT_STORAGE).json({ "response": "find error", "status": false, "success": false });
                            } else {
                              console.log("_____________________________line----83")
                              console.log(rows)
                              connection.query(
                                // UPDATE `product` SET `product_stock_quantity` = '11' WHERE `product`.`id` = 16;
                                "UPDATE `product` SET product_stock_quantity='" + update_stock_qty + "' WHERE id='" + item["product_id"] + "'",
                                (err, result) => {
                                  if (err) {
                                    console.log("err------update_qty--------------90")
                                    console.log(err)
                                    // res.status(500).send({ "response": "find error", "status": false });
                                  } else {
                                    // res.status(200).json({ message: result });
                                  }
                                }
                              );

                              connection.query("delete from cart where product_id ='" + item["product_id"] + "' AND user_id='" + req.user_id + "'", (err, rows) => {
                                if (err) {
                                  console.log("-----err-------delete--101-")
                                  console.log(err)
                                  console.log({ "response": "delete opration failed", "success": false });
                                } else {
                                  // console.log("rows-----------------------delete---row")
                                  // console.log(rows)
                                  // rows.affectedRows == "1" ? console.log({ "response": "delete successfull", "success": true }) : res.console.log({ "response": "delete opration failed", "success": false })
                                }
                              });


                              // send_emal-----------------etc.
                              //resend--------------------

                              // res.send("okay")
                              console.log('INSERT INTO order_detaile (`product_id`,`order_id`,`vendor_id`, `name`, `seo_tag`, `brand`, `quantity`, `unit`, `product_stock_quantity`, `price`, `mrp`, `gst`, `sgst`, `cgst`, `category`, `is_deleted`, `status`, `review`, `discount`, `rating`, `description`, `is_active`, `created_on`, `updated_on`) SELECT "' + item["product_id"] + '","' + order_no_old + '",`vendor_id`, `name`, `seo_tag`, `brand`, `quantity`, `unit`, `product_stock_quantity`, `price`, `mrp`, `gst`, `sgst`, `cgst`, `category`, `is_deleted`, `status`, `review`, `discount`, `rating`, `description`, `is_active`, `created_on`, `updated_on` FROM product WHERE id = ' + item["product_id"] + '')

                              connection.query('INSERT INTO order_detaile (`product_id`,`order_id`,`vendor_id`, `name`, `seo_tag`, `brand`, `quantity`, `unit`, `product_stock_quantity`, `price`, `mrp`, `gst`, `sgst`, `cgst`, `category`, `is_deleted`, `status`, `review`, `discount`, `rating`, `description`, `is_active`) SELECT "' + item["product_id"] + '","' + order_no_old + '",`vendor_id`, `name`, `seo_tag`, `brand`, `quantity`, `unit`, `product_stock_quantity`, `price`, `mrp`, `gst`, `sgst`, `cgst`, `category`, `is_deleted`, `status`, `review`, `discount`, `rating`, `description`, `is_active` FROM product WHERE id = ' + item["product_id"] + '', (err, result) => {
                                if (err) {
                                  console.log("product_detaile-------------err")
                                  console.log(err)
                                  // res.status(500).send({ "response": "find error", "status": false });
                                } else {
                                  console.log("______________product detaile insert  data___line_______106_")
                                  console.log(result)
                                }
                              }
                              );
                            }
                          }
                        );
                      } else {
                        // res.send({ "response": "product stock unavailable", "status": false })
                        console.log({ "response": "product stock unavailable", "status": false })
                      }
                    } else {
                      return;
                    }


                  }
                }
              )
            } else {
              console.log("new_vendoe_order________else_condition_work__143")
              let orderno = Math.floor(100000 + Math.random() * 900000);
              vendore_id_array.push(item["vendor_id"])
              order_no_obj[item["vendor_id"]] = orderno
              let verify_code = JSON.stringify(orderno * 13)
              if (verify_code.length > 7) {
                verify_code = verify_code.substring(0, verify_code.length - 1)
              }
              connection.query("SELECT product_stock_quantity FROM product WHERE id='" + item["product_id"] + "'",
                (err, result) => {
                  if (err) {
                    console.log("---------error_product_stock_quantity-----line_154__" + JSON.stringify(err))
                    // res.status(500).send(err);
                  } else {
                    console.log("---------product_stock_quantity--result-of--" + item["product_id"] + "-line_157__" + JSON.stringify(result))
                    if (result != "") {

                      var update_stock_qty = parseInt(result[0]["product_stock_quantity"]) - parseInt(item["total_order_product_quantity"])

                      console.log(update_stock_qty + ">=" + 0 + "&&" + item["total_order_product_quantity"] + ">" + 0 + "-----------159")
                      console.log("--------------------update_stock_qty---------163-" + update_stock_qty)


                      if (update_stock_qty >= 0 && item["total_order_product_quantity"] > 0) {
                        connection.query(
                          "insert into `order` ( `order_id`, `product_id`,`user_id`, vendor_id, `total_order_product_quantity`,`total_amount`,`total_gst`,`total_cgst`, `total_sgst`,`total_discount`, `shipping_charges`,`invoice_id`, `payment_mode`,`payment_ref_id`, `discount_coupon`,`discount_coupon_value`,`delivery_lat`,`delivery_log`, `user_name`, `address`, `email`, `pin_code`, `city`, `user_image`, `phone_no`,`delivery_verify_code`) VALUES ('" + orderno + "','" + item["product_id"] + "', '" + req.user_id + "', '" + item["vendor_id"] + "', '" + item["total_order_product_quantity"] +
                          "','" +
                          item["total_amount"] +
                          "','" +
                          item["total_gst"] +
                          "','" +
                          item["total_cgst"] +
                          "','" +
                          item["total_sgst"] +
                          "','" +
                          item["total_discount"] +
                          "','" +
                          item["shipping_charges"] +
                          "','" +
                          orderno +
                          "','" +
                          item["payment_mode"] +
                          "','" +
                          item["payment_ref_id"] +
                          "','" +
                          item["discount_coupon"] +
                          "','" +
                          item["discount_coupon_value"] +
                          "'," + user_lat + "," + user_log + ", '" + first_name + "', '" + address + "', '" + email + "', " + pincode + ", '" + city + "', '" + image + "','" + phone_no + "' ,'" + verify_code + "')",
                          (err, rows) => {
                            if (err) {
                              console.log(err)
                              res.status(StatusCodes.INSUFFICIENT_STORAGE).json({ "response": "find error", "status": false });
                            } else {
                              console.log("rows=====170")
                              console.log(rows)
                              connection.query(
                                // UPDATE `product` SET `product_stock_quantity` = '11' WHERE `product`.`id` = 16;
                                "UPDATE `product` SET product_stock_quantity='" + update_stock_qty + "' WHERE id='" + item["product_id"] + "'",
                                (err, result) => {
                                  if (err) {
                                    console.log("err---------------------line----" + "202")
                                    console.log(err)
                                    // res.status(500).send({ "response": "find error", "status": false });
                                  } else {
                                    // res.status(200).json({ message: result });
                                  }
                                }
                              );

                              connection.query("delete from cart where product_id ='" + item["product_id"] + "' AND user_id='" + req.user_id + "'", (err, rows) => {
                                if (err) {
                                  console.log("rows------201----------err-------delete---")
                                  console.log(err)
                                  console.log({ "response": "delete opration failed", "success": false });
                                } else {
                                  // console.log("rows---------205--------------delete---row")
                                  // console.log(rows)
                                  // rows.affectedRows == "1" ? console.log({ "response": "delete successfull", "success": true }) : res.console.log({ "response": "delete opration failed", "success": false })
                                }
                              });

                              console.log('INSERT INTO order_detaile (`product_id`,`order_id`,`vendor_id`, `name`, `seo_tag`, `brand`, `quantity`, `unit`, `product_stock_quantity`, `price`, `mrp`, `gst`, `sgst`, `cgst`, `category`, `is_deleted`, `status`, `review`, `discount`, `rating`, `description`, `is_active`, `created_on`, `updated_on`) SELECT "' + item["product_id"] + '","' + orderno + '",`vendor_id`, `name`, `seo_tag`, `brand`, `quantity`, `unit`, `product_stock_quantity`, `price`, `mrp`, `gst`, `sgst`, `cgst`, `category`, `is_deleted`, `status`, `review`, `discount`, `rating`, `description`, `is_active`, `created_on`, `updated_on` FROM product WHERE id = ' + item["product_id"] + '')

                              connection.query('INSERT INTO order_detaile (`product_id`,`order_id`,`vendor_id`, `name`, `seo_tag`, `brand`, `quantity`, `unit`, `product_stock_quantity`, `price`, `mrp`, `gst`, `sgst`, `cgst`, `category`, `is_deleted`, `status`, `review`, `discount`, `rating`, `description`, `is_active`) SELECT "' + item["product_id"] + '","' + orderno + '",`vendor_id`, `name`, `seo_tag`, `brand`, `quantity`, `unit`, `product_stock_quantity`, `price`, `mrp`, `gst`, `sgst`, `cgst`, `category`, `is_deleted`, `status`, `review`, `discount`, `rating`, `description`, `is_active` FROM product WHERE id = ' + item["product_id"] + '', (err, result) => {
                                if (err) {
                                  console.log("err------------product_detaile----224")
                                  console.log(err)
                                  // res.status(500).send({ "response": "find error", "status": false });
                                } else {
                                  console.log("______________product detaile insert  data___________176")
                                  console.log(result)
                                }
                              }
                              );

                              // send_emal-----------------etc.
                              //resend--------------------
                              console.log(rows)
                              // res.send("okay")
                            }
                          }
                        );
                      } else {
                        // res.send({ "response": "product stock unavailable", "status": false })
                        console.log({ "response": "product stock unavailable", "status": false })
                      }

                    } else {
                      return;
                    }
                  }

                }
              )
            }
            if (index === product_array.length - 1) {
              connection.query('INSERT INTO `notification`(`actor_id`, `actor_type`, `message`, `status`) VALUES ("' + req.user_id + '","user","successfully placed order,order_no=","unread"),("001","admin","recived order (order_no. =) by ' + first_name + ', user_id ' + req.user_id + '","unread")', (err, rows) => {
                if (err) {
                  //console.log({ "notification": err })
                } else {
                  console.log("_______notification-send__94________")
                }
              })
              const mail_configs = {
                from: 'ashish.we2code@gmail.com',
                to: email,
                subject: 'order status ',
                text: "order added successfully",
                html: "<h1>order added successfully<h1/>"
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
                    return //console.log({ "email_error": err });
                  } else {
                    return { "send_mail_status": "send successfully" };
                  }
                })
              var order_ar = []
              for (var k in order_no_obj) {
                order_ar.push(order_no_obj[k])
              }

              if (fcm_tokens != "") {
                var notification = {
                  "title": "nurser_live order notification",
                  "text": "order placed successfull"
                }

                // var fcm_tokens = ["e42h1iTmRwGlyuwn9nGqu4:APA91bH6_qHLmPMYCjrkI1-l2eswwsWMxZJeMz9WRozFYA-DzNOCS58L9HPGaRWTaxKj7Zg4pJx2TRgZPU4O8IY7UgqJ5S6A8DY4BODWfQDdlFNZLaZmz5heuAlJdxI2Y-XVFcjNimDh"]

                var notification_body = {
                  "notification": notification,
                  "registrations_ids": fcm_tokens
                }
                fetch("https://fcm.googleapis.com/fcm/send", { "method": "POST", "headers": { "authorization": "keys=" + "AAAABsq8jZc:APA91bG99gTYMmsMI_vlIJhjAxU6ta8j24v4dg-tInV4dKDUXqBzx3ORj_n0aI5k7opUvuyKI0nGhulfolpJgSFf2d5rnMfrN5CGA2fkpbCqTIlaidCChdDa5Gs7ymScojbL5pC93B54", "Content-Type": "application/json" }, "body": notification_body }).then(() => {
                  console.log("notification send successfully")
                }).catch((err) => { console.log(err) })
              }

              res.status(StatusCodes.OK).json({ "status": "ok", "response": "order successfully added", "order_id": order_ar, "success": true });

            }
          })

        } else {
          console.log("false")
          res.status(200).send({ response: "please complete your profile", "status": false, "success": false })

        }

      }
    })

}

export async function order_list(req, res) {

  if (req.for_ == 'admin') {
    if (user_id != '') {
      str_order = "select * from `order` where user_id='" + user_id + "'"
    } else {
      str_order = "select * from `order`"
    }
  } else {
    if (req.for_ == 'user') {
      user_id = ""
      str_order = "select * from `order` where user_id='" + req.user_id + "'"
    }
  }
  connection.query(str_order, (err, rows) => {
    if (err) {
      res.status(StatusCodes.INSUFFICIENT_STORAGE).json({ "response": "find error", "status": false });
    } else {
      res.status(StatusCodes.OK).json(rows);
    }
  });
}

export async function order_details(req, res) {
  const id = req.query.id;
  let resp_obj = {}
  console.log('select order_id,user_id,vendor_id,total_order_product_quantity,total_amount  ,total_gst,total_cgst,total_sgst,total_discount,shipping_charges,payment_mode,payment_ref_id,order_date,delivery_date,discount_coupon ,discount_coupon_value from `order`  where order_id ="' + id + '" AND user_id ="' + req.user_id + '" GROUP BY order_id')
  connection.query('select order_id,user_id,vendor_id,total_order_product_quantity,total_amount  ,total_gst,total_cgst,total_sgst,total_discount,shipping_charges,payment_mode,payment_ref_id,order_date,delivery_date,discount_coupon ,discount_coupon_value from `order`  where order_id ="' + id + '" AND user_id ="' + req.user_id + '" GROUP BY order_id',
    (err, rows) => {
      if (err) {
        console.log(err)
        res.status(StatusCodes.INSUFFICIENT_STORAGE).json(err);
      } else {
        if (rows != "") {
          resp_obj["success"] = true
          resp_obj["order_detaile"] = rows
          console.log('select *, (SELECT GROUP_CONCAT(product_image_path) FROM product_images WHERE product_images.product_id = order_detaile.product_id) AS all_images_url, (SELECT GROUP_CONCAT(product_image_path) FROM product_images WHERE product_images.product_id = order_detaile.product_id AND image_position = "cover" group by product_images.product_id) AS cover_image FROM order_detaile where order_id =' + id + '')
          connection.query('select *, (SELECT GROUP_CONCAT(product_image_path) FROM product_images WHERE product_images.product_id = order_detaile.product_id) AS all_images_url, (SELECT GROUP_CONCAT(product_image_path) FROM product_images WHERE product_images.product_id = order_detaile.product_id AND image_position = "cover" group by product_images.product_id) AS cover_image FROM order_detaile where order_id =' + id + '',
            (err, rows) => {
              if (err) {
                console.log(err)
                res.status(StatusCodes.INSUFFICIENT_STORAGE).json(err);
              } else {
                resp_obj["success"] = true
                resp_obj["order_product_detaile"] = rows
                // res.status(StatusCodes.OK).json(resp_obj);

                connection.query("select * from user where id= '" + req.user_id + "'", (err, rows) => {
                  if (err) {
                    res
                      .status(StatusCodes.INTERNAL_SERVER_ERROR)
                      .json({ message: "something went wrong", "status": false });
                  } else {
                    resp_obj["user_detaile"] = rows
                    res.status(StatusCodes.OK).json(resp_obj);
                  }
                })
              }
            }
          );
        } else {
          res.status(200).json({ "success": false, "response": "not found" });
        }
      }
    }
  )
}

export async function order_update(req, res) {
  var {
    user_id,
    total_quantity,
    total_amount,
    total_gst,
    total_cgst,
    total_sgst,
    total_discount,
    shipping_charges,
    invoice_id,
    payment_mode,
    payment_ref_id,
    discount_coupon,
    discount_coupon_value,
  } = req.body;

  const id = req.params.id;

  connection.query(
    "update `order` set user_id ='" +
    user_id +
    "', total_quantity='" +
    total_quantity +
    "' , total_amount='" +
    total_amount +
    "', total_gst='" +
    total_gst +
    "', total_sgst='" +
    total_sgst +
    "', total_cgst='" +
    total_cgst +
    "', total_discount='" +
    total_discount +
    "', shipping_charges='" +
    shipping_charges +
    "', invoice_id='" +
    invoice_id +
    "', payment_mode='" +
    payment_mode +
    "', payment_ref_id='" +
    payment_ref_id +
    "', discount_coupon='" +
    discount_coupon +
    "', discount_coupon_value='" +
    discount_coupon_value +
    "'  where id ='" +
    req.user +
    "' ",
    (err, rows) => {
      if (err) {
        res.status(StatusCodes.INSUFFICIENT_STORAGE).json(err);
      } else {
        res.status(StatusCodes.OK).json(rows);
      }
    }
  );
}

export async function order_delete(req, res) {
  const id = req.params.id;

  connection.query(
    "delete from `order` where id ='" + id + "' ",
    (err, rows) => {
      if (err) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(err);
      } else {
        res.status(StatusCodes.OK).json(rows);
      }
    }
  );
}

export async function order_search(req, res) {
  let search_obj = Object.keys(req.body)
  // var search_string = "where ";
  var search_string = ""
  console.log(req.user_id)
  if (req.for_ == 'admin') {
    if (req.body.user_id != '' && req.body.user_id != undefined) {
      search_string += 'SELECT *, (SELECT GROUP_CONCAT(product_image_path) FROM product_images WHERE product_images.product_id = order_view.product_id) AS all_images_url, (SELECT GROUP_CONCAT(product_image_path) FROM product_images WHERE product_images.product_id = order_view.product_id AND image_position = "cover" group by product_images.product_id) AS cover_image  FROM order_view where'
      // search_string += 'SELECT * FROM order_view where'
    } else {
      search_string += 'SELECT *, (SELECT GROUP_CONCAT(product_image_path) FROM product_images WHERE product_images.product_id = order_view.product_id) AS all_images_url, (SELECT GROUP_CONCAT(product_image_path) FROM product_images WHERE product_images.product_id = order_view.product_id AND image_position = "cover" group by product_images.product_id) AS cover_image FROM `order_view` where'
      // search_string += 'SELECT * FROM `order_view` where'
    }
  } else {
    if (req.for_ == 'user') {
      search_string = 'SELECT *,(SELECT GROUP_CONCAT(product_image_path) FROM product_images WHERE product_images.product_id = order_view.product_id) AS all_images_url, (SELECT GROUP_CONCAT(product_image_path) FROM product_images WHERE product_images.product_id = order_view.product_id AND image_position = "cover" group by product_images.product_id) AS cover_image   FROM `order_view` where user_id="' + req.user_id + '" AND '
      // search_string = 'SELECT *  FROM `order_view` where user_id="' + req.user_id + '" AND '
    }
  }


  console.log(search_obj)
  for (var i = 0; i <= search_obj.length - 1; i++) {
    if (i == 0) {
      if (req.body[search_obj[i]] != "") {
        search_string += ` name LIKE "%${req.body[search_obj[i]]}%" AND `
      }
    } else {

      if (req.body[search_obj[i]] != "") {
        search_string += ` ${search_obj[i]} = "${req.body[search_obj[i]]}" AND `
      }
    }
    if (i === search_obj.length - 1) {
      search_string = search_string.substring(0, search_string.length - 5);
    }
  }

  console.log(search_string)
  var pg = req.query;
  var numRows;

  var numPerPage = pg.per_page;
  var page = parseInt(pg.page, pg.per_page) || 0;
  var numPages;
  var skip = page * numPerPage;
  // Here we compute the LIMIT parameter for MySQL query
  var limit = skip + "," + numPerPage;

  connection.query(
    "SELECT count(*) as numRows FROM product",
    (err, results) => {
      if (err) {
      } else {
        numRows = results[0].numRows;
        numPages = Math.ceil(numRows / numPerPage);
        console.log("quer______________________________________check___512")
        console.log(search_string + " GROUP BY order_id LIMIT " + limit + "")
        connection.query(search_string +
          " GROUP BY order_id LIMIT " +
          limit +
          "",
          (err, results) => {
            if (err) {
              //console.log(err)
              res.status(502).send(err);
            } else {
              // //console.log("_____")
              var responsePayload = {
                results: results,
              };
              if (page < numPages) {
                responsePayload.pagination = {
                  current: page,
                  perPage: numPerPage,
                  previous: page > 0 ? page - 1 : undefined,
                  next: page < numPages - 1 ? page + 1 : undefined,
                };
              } else
                responsePayload.pagination = {
                  err:
                    "queried page " +
                    page +
                    " is >= to maximum page number " +
                    numPages,
                };
              // //console.log("responsePayload++++++++++++++++++++++++++++++++++++++++");
              ////console.log(responsePayload);
              res.status(200).send(responsePayload);
            }
          }
        );
      }
    }
  );
  // }
}

export function order_status_update(req, res) {
  console.log("order_status_update-----------------")
  console.log(req.body)
  let email_user = ""
  connection.query("SELECT * FROM user WHERE id='" + req.body.user_id + "'",
    (err, result) => {
      if (err) {
        console.log(err)
      } else {
        // console.log(result)
        email_user = result[0]["email"]
        connection.query('INSERT INTO `notification`(`actor_id`, `actor_type`, `message`, `status`) VALUES ("' + req.body.user_id + '","user","order your order current staus is ' + req.body.status_order + '","unread"),("001","admin","successfully changed user (user_id ' + req.body.user_id + ') order status","unread")', (err, rows) => {
          if (err) {
            //console.log({ "notification": err })
          } else {
            console.log("_______notification-send__94________")
          }
        })
        connection.query(
          "UPDATE `order` SET status_order='" + req.body.status_order + "' WHERE order_id='" + req.body.order_id + "'",
          (err, result) => {
            if (err) {
              console.log(err)
              res.status(500).send({ "response": "find error", "status": false });
            } else {
              const mail_configs = {
                from: 'ashish.we2code@gmail.com',
                to: email_user,
                subject: 'order status change',
                text: "order your order current staus is " + req.body.status_order + "",
                html: "<h1> your order current staus is " + req.body.status_order + "<h1/>"
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
                    return //console.log({ "email_error": err });
                  } else {
                    return { "send_mail_status": "send successfully" };
                  }
                })
              console.log(result)
              if (result.affectedRows >= 1) {
                res.status(200).json({ "response": "status updated successfully", "res_db": result, "status": true });
              } else {
                res.status(200).json({ "response": "status update opration failed", "res_db": result, "status": false });
              }

            }
          }
        );
      }
    })

}



