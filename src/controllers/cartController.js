import connection from "../../Db.js";
import { StatusCodes } from "http-status-codes";

export async function add_to_cart(req, res) {
  var { product_id, cart_product_quantity } = req.body;
  const check = parseInt(cart_product_quantity)
  console.log(req.body)
  console.log(check < 1)
  if (check == "0") {
    res.status(200).send({ "success": false, "response": "please cart quantity add greater then 1" })
  } else {
    connection.query("SELECT * FROM cart WHERE user_id =" + req.user_id + " AND product_id = " + product_id + " ",
      (err, rows) => {
        if (err) {
          console.log("err---------------------13-----")
          console.log(err)
          res
            .status(StatusCodes.INSUFFICIENT_STORAGE)
            .json({ "success": false, "response": "something went wrong" });
        } else {
          if (rows != "") {
            connection.query(
              "update cart set cart_product_quantity='" + cart_product_quantity + "' where user_id='" + req.user_id + "' AND product_id='" + product_id + "'", (err, rows) => {
                if (err) {
                  console.log("err---------------------21-----")
                  console.log(err)
                  res
                    .status(StatusCodes.INTERNAL_SERVER_ERROR)
                    .json({ "response": "something went wrong", "success": false });
                } else {
                  rows.affectedRows == "1" ? res.status(200).json({ "response": "update successfull", "success": true }) : res.status(200).json({ "response": "something went wrong", "success": false })
                }
              }
            );
          } else {
            connection.query(
              "insert into cart (`user_id`, `product_id`,`cart_product_quantity` )  VALUES ('" +
              req.user_id +
              "', '" +
              product_id +
              "','" +
              cart_product_quantity +
              "')",
              (err, rows) => {
                if (err) {
                  console.log("err---------------------42-----")
                  console.log(err)
                  res
                    .status(StatusCodes.INSUFFICIENT_STORAGE)
                    .json({ "success": false, "response": "something went wrong" });
                } else {
                  res.status(StatusCodes.OK).json({ "success": true, "response": "add product successfull" });
                }
              }
            );
          }
        }
      }
    );
  }

}
// (select count(*) cart where  user_id="' + req.user_id + '") AS cart_count, 
export function cart_list(req, res) {
  var str_cart = 'select *, (SELECT GROUP_CONCAT(product_image_path) FROM product_images WHERE product_images.product_id = cart_view_1.product_id) AS all_images_url, (SELECT GROUP_CONCAT(product_image_path) FROM product_images WHERE product_images.product_id = cart_view_1.product_id AND image_position = "cover" group by product_images.product_id) AS cover_image from cart_view_1 where user_id="' + req.user_id + '"'

  console.log(str_cart)
  connection.query(str_cart, (err, rows) => {
    if (err) {
      console.log("err---------------------63-----")
      console.log(err)
      res
        .status(200)
        .json({ message: "something went wrong" });
    } else {
      res.status(StatusCodes.OK).json(rows);
    }
  });
}

export async function cartById(req, res) {
  const id = req.params.id;
  connection.query(
    "select * from cart where id= '" + id + "' ",
    (err, rows) => {
      if (err) {
        console.log("err---------------------78-----")
        console.log(err)
        res
          .status(StatusCodes.INTERNAL_SERVER_ERROR)
          .json({ message: "something went wrong" });
      } else {
        res.status(StatusCodes.OK).json(rows);
      }
    }
  );
}

export async function cart_update(req, res) {
  var { product_id, cart_product_quantity } = req.body;
  const check_1 = parseInt(cart_product_quantity)
  if (check_1 < 1) {
    connection.query("delete from cart where product_id ='" + product_id + "' AND user_id='" + req.user_id + "'", (err, rows) => {
      if (err) {
        console.log("err---------------------94-----")
        console.log(err)
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ "response": "delete opration failed", "success": false });
      } else {
        rows.affectedRows == "1" ? res.status(200).json({ "response": "delete successfull", "success": true }) : res.status(200).json({ "response": "delete opration failed", "success": false })
      }
    });
  } else {
    connection.query(
      "update cart set cart_product_quantity='" + cart_product_quantity + "' where user_id='" + req.user_id + "' AND product_id='" + product_id + "'", (err, rows) => {
        if (err) {
          console.log("err---------------------105-----")
          console.log(err)
          res
            .status(StatusCodes.INTERNAL_SERVER_ERROR)
            .json({ "response": "something went wrong", "success": false });
        } else {
          rows.affectedRows == "1" ? res.status(200).json({ "response": "update successfull", "success": true }) : res.status(200).json({ "response": "something went wrong", "success": false })

        }
      }
    );
  }

}

export async function cart_delete(req, res) {
  const { product_id } = req.body

  connection.query("delete from cart where product_id ='" + product_id + "' AND user_id='" + req.user_id + "'", (err, rows) => {
    if (err) {
      console.log(err)
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ "response": "delete opration failed", "success": false });
    } else {
      rows.affectedRows == "1" ? res.status(200).json({ "response": "delete successfull", "success": true }) : res.status(200).json({ "response": "delete opration failed", "success": false })
    }
  });
}


export async function cart_and_notification_count(req, res) {
  let res_array = []
  connection.query("select count(id) AS cart_count from cart where user_id='" + req.user_id + "'", (err, rows) => {
    if (err) {
      console.log(err)
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ "response": "find error", "success": false });
    } else {
      res_array.push(rows[0])
      connection.query("select count(id) AS unread_notification_count from notification where actor_id='" + req.user_id + "' AND status ='unread'", (err, rows) => {
        if (err) {
          console.log(err)
          res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ "response": "find error", "success": false });
        } else {
          res_array.push(rows[0])
          res.status(200).json({ "success": true, "response": res_array });
        }
      })
    }
  });
}

