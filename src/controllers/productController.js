import connection from "../../Db.js";
import { StatusCodes } from "http-status-codes";

export async function addproduct(req, res) {
  var { vendor_id, name, seo_tag, brand, quantity, unit, product_stock_quantity, price, mrp, review, discount, gst, cgst, sgst, rating, description, category } = req.body;
  console.log("body--" + JSON.stringify(req.body));
  console.log(mrp + " > " + price)
  const n_mrp = parseInt(mrp)
  const n_price = parseInt(price)

  console.log(n_mrp + " > " + n_price)
  console.log(n_mrp > n_price)
  if (n_mrp > n_price) {
    if (req.vendor_id != "" && req.vendor_id != undefined) {
      connection.query(
        ' INSERT INTO `product` (`vendor_id`,`name`,`seo_tag`,`brand`,`quantity`,`unit`,`product_stock_quantity`,`price`,`mrp`,`gst`,`sgst`,`cgst`,`category`,`review`,`discount`,`rating`,`description`, `created_by`, `created_by_id`) values ("' +
        req.vendor_id +
        '","' +
        name +
        '","' + seo_tag + '","' + brand + '","' + quantity + '","' + unit + '","' + product_stock_quantity + '","' +
        price +
        '","' + mrp + '","' +
        gst +
        '","' +
        sgst +
        '","' +
        cgst +
        '","' +
        category +
        '","' +
        review +
        '","' +
        discount +
        '", "' +
        rating +
        '","' +
        description +
        '","' + req.created_by + '","' + req.created_by_id + '") ',
        (err, result) => {
          if (err) {
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({ "response": "find error", "status": false });
          } else {
            console.log("chk------------------70")
            console.log(result)
            res.status(StatusCodes.OK).json({ "response": "add successfull", "message": result, "status": true });
          }
        }
      );
    } else {
      res.send({ "response": "vendor_id undifined", "status": false })
    }
  } else {
    res.send({ "response": "product price is always less then product MRP", "status": false })
  }
}

export async function getallProduct(req, res) {
  connection.query("select * from product", (err, result) => {
    if (err) {
      res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ message: "someting went wrong" });
    } else {
      res.status(StatusCodes.OK).json(result);
    }
  });
}

export async function getProductbyId(req, res) {
  connection.query(
    "select * from product where id='" + req.params.id + "'",
    (err, result) => {
      if (err) {
        res
          .status(StatusCodes.INTERNAL_SERVER_ERROR)
          .json({ message: "someting went wrong" });
      } else {
        res.status(StatusCodes.OK).json(result);
      }
    }
  );
}

export async function update_Product(req, res) {
  let req_obj = req.body;
  var updat_str = "update `product` set "
  var k = ""
  if (req_obj.id !== undefined && req_obj.id !== "") {
    for (k in req_obj) {

      if (!["updated_on", "id", "all_images_url", "cover_image", "created_on"].includes(k)) {
        if (req_obj[k] != null && req_obj[k] != "null") {
          updat_str += ` ${k} = "${req_obj[k]}", `
          console.log(k)
        }

      }
    }
    updat_str = updat_str.substring(0, updat_str.length - 2);


    if (req.headers.admin_token) {
      updat_str += "  where id = '" + req_obj.id + "'"
      console.log("_________________________updat_str_________________________")
      console.log(updat_str)
      connection.query(updat_str,
        (err, result) => {
          if (err) {
            res.status(500).send({ "response": "error - opration failed", "status": false });
            console.log(err)
          } else {
            result.affectedRows == "1" ? res.status(200).json({ "response": result, "message": "update successfull", "status": true })
              : res.status(500).send({ "response": "error - opration failed", "status": false })

          }
        }
      );

    } else if (req.headers.vendor_token) {
      updat_str += "  where id = '" + req_obj.id + "' AND vendor_id = '" + req.vendor_id + "'"
      console.log("_________________________updat_str_________________________")
      console.log(updat_str)
      connection.query(updat_str,
        (err, result) => {
          if (err) {
            res.status(500).send({ "response": "error - opration failed", "status": false });
            console.log(err)
          } else {
            result.affectedRows == "1" ? res.status(200).json({ "response": result, "message": "update successfull", "status": true })
              : res.status(500).send({ "response": "error - opration failed", "status": false })

          }
        }
      );
    } else {
      console.log("_____________________check_token----- send token admin_token or vendor_token ")
      res.send({ "response": "please send admin_token or vendor_token", "status": false })

    }



  } else {
    res.send({ "response": "please send product identity", "status": false })
  }
}






export async function delete_product(req, res) {
  let dlt_query = ""
  if (req.headers.vendor_token != "" && req.headers.vendor_token != undefined) {
    dlt_query += "delete  from product where id ='" + req.body.id + "' AND vendor_id = '" + req.vendor_id + "'"
  } else {
    dlt_query += "delete  from product where id ='" + req.body.id + "'"
  }
  connection.query(dlt_query, (err, result) => {
    if (err) {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({ "response": "not delete ", "status": false });
    } else {
      result.affectedRows == "1" ? res.status(StatusCodes.OK).json({ "response": "delete successfully", "status": false }) : res.status(StatusCodes.OK).json({ "response": "not delete ", "status": false });
    }
  }
  );
}

export async function search_product(req, res) {
  var count_rows;
  var { price_from, price_to } = req.body;
  console.log(req.body)
  // 'SELECT *, (SELECT id FROM cart WHERE cart.product_id = product.id AND user_id = "' + req.user + '") FROM products  AND '

  var search_string_asc_desc = ""
  // var query_string = "select * from product  where ";
  let search_obj = Object.keys(req.body)
  console.log(req.user_id)

  if (req.user_id != "" && req.user_id != undefined) {
    var search_string = 'SELECT *, (SELECT cart_product_quantity FROM cart WHERE cart.product_id = product.id AND user_id = "' + req.user_id + '") AS cart_count,   (SELECT GROUP_CONCAT(product_image_path) FROM product_images WHERE product_images.product_id = id) AS all_images_url, (SELECT GROUP_CONCAT(product_image_path) FROM product_images WHERE product_images.product_id = id AND image_position = "cover" group by product_images.product_id) AS cover_image FROM product where ';
  } else {


    if (req.headers.vendor_token != "" && req.headers.vendor_token != undefined) {
      var search_string = 'SELECT *,(SELECT GROUP_CONCAT(product_image_path) FROM product_images WHERE product_images.product_id = id) AS all_images_url, (SELECT GROUP_CONCAT(product_image_path) FROM product_images WHERE product_images.product_id = id AND image_position = "cover" group by product_images.product_id) AS cover_image FROM product where vendor_id = "' + req.vendor_id + '" AND  ';
    } else {
      var search_string = 'SELECT *,(SELECT GROUP_CONCAT(product_image_path) FROM product_images WHERE product_images.product_id = id) AS all_images_url, (SELECT GROUP_CONCAT(product_image_path) FROM product_images WHERE product_images.product_id = id AND image_position = "cover" group by product_images.product_id) AS cover_image FROM product where ';
    }
  }


  console.log(search_obj)
  if (price_from != "" && price_to != "") {
    search_string += '(`price` BETWEEN "' + price_from + '" AND "' + price_to + '") AND   '
  }

  for (var i = 0; i <= search_obj.length - 1; i++) {

    if (i >= 6) {
      if (i == 6) {
        if (req.body[search_obj[i]] != "") {
          search_string += `name LIKE "%${req.body[search_obj[i]]}%" AND   `
        }
      } else {
        if (req.body[search_obj[i]] != "") {
          var arr = JSON.stringify(req.body[search_obj[i]]);
          var abc = "'" + arr + "'"
          const id = abc.substring(abc.lastIndexOf("'[") + 2, abc.indexOf("]'"));
          search_string += ' ' + search_obj[i] + ' IN ' + '(' + id + ') AND   '

          // search_string+= `${search_obj[i]} = "${req.body[search_obj[i]]}" AND   `
        }
      }
    } else {
      if (i > 1) {
        if (search_obj[i] != undefined && req.body[search_obj[i]] != "") {
          search_string_asc_desc = ` ORDER BY ${search_obj[i].replace("__", "")} ${req.body[search_obj[i]]} `
        }
      }
    }
    if (i === search_obj.length - 1) {
      search_string = search_string.substring(0, search_string.length - 6);
      // if (search_obj[2] != undefined && req.body[search_obj[2]] != "") {
      search_string += search_string_asc_desc
      // }

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

        console.log("results--------------------count----query---------------")
        console.log(search_string.replace("*", "count(*) AS `count_rows` "))
        connection.query(search_string.replace("*", "count(*) AS `count_rows` "),
          (err, results) => {
            console.log("results--------------------count-------------------")
            console.log(err)
            console.log(results)
            try { count_rows = results[0]["count_rows"] } catch (e) {
              console.log(e)
            }

          })

        console.log("" + search_string + " LIMIT " + limit + "")
        connection.query("" + search_string + " LIMIT " + limit + "",
          (err, results) => {
            if (err) {
              console.log("err___________________194")
              console.log(err)
              res.status(200).send({ "response": "find error" });
            } else {
              // //console.log("_____")
              var responsePayload = {
                results: results,
              };
              if (page < numPages) {
                responsePayload.pagination = {
                  count_rows: count_rows,
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
              res.status(200).send(responsePayload);
            }
          }
        );
      }
    }
  );
}
