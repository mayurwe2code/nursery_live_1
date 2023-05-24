import connection from "../../Db.js";
import fs from 'fs'

export function add_product_image(req, res) {
  console.log("add_product_image________________________________________check")
  var res_data_arr = []
  var base64_images = req.body
  // console.log(base64_images)
  let iterations = base64_images.length - 1;
  base64_images.forEach(function (item, index) {
    var imgBase64 = item.img_64
    var img_num = Math.floor(100000 + Math.random() * 900000);
    try {
      var base64Data = imgBase64.replace("data:image/png;base64,", "");
      var name_str = "" + item.product_image_name.split(" ").join("") + "_" + img_num + ""

      fs.writeFileSync("/home/we2code/Desktop/nursery_proj/nursery_live/public/product_images/" + name_str + ".png", base64Data, 'base64');
    } catch (err) {
      console.log(err)
    }
    //console.log(item.vendor_id)
    connection.query('INSERT INTO `product_images`(`product_id`, `product_description`,`product_image_name`, `product_image_path`, `image_position`) VALUES ("' + item.product_id + '", "' + item.product_description + '", "' + name_str + '.png", "http://192.168.29.109:8888/product_images/' + name_str + '.png", "' + item.image_position + '")', (err, rows, fields) => {
      if (err) {
        console.log(err)
        //res.status(200).send(err)
      } else {
        console.log(rows)
      }
    })

    if (index == iterations) {
      console.log(index + " == " + iterations)
      res.status(200).send({ "response": "successfully add images" })
    }
  })
}

export function product_image_update(req, res) {
  console.log("product_image_________________________________________-")
  let base64_images = req.body
  // console.log(base64_images)
  let iterations = base64_images.length - 1;
  base64_images.forEach(function (item, index) {
    let imgBase64 = item.img_64
    let img_num = Math.floor(100000 + Math.random() * 900000);
    try {
      var base64Data = imgBase64.replace("data:image/png;base64,", "");
      var name_str = "" + item.product_image_name.split(" ").join("") + "_" + img_num + ""

      fs.writeFileSync("/home/we2code/Desktop/nursery_proj/nursery_live/public/product_images/" + name_str + ".png", base64Data, 'base64');
    } catch (err) {
      console.log(err)
    }

    //console.log(item.vendor_id)
    connection.query(' UPDATE `product_images` SET `product_description`="' + item.product_description + '",`product_image_name`="' + name_str + '.png",`product_image_path`= "http://192.168.29.109:8888/product_images/' + name_str + '.png",`image_position`="' + item.image_position + '" WHERE product_image_id = "' + item.product_image_id + '" AND product_id = "' + item.product_id + '"', (err, rows, fields) => {
      if (err) {
        console.log(err)
        //res.status(200).send(err)
      } else {
        console.log(rows)
      }
    })

    if (index == iterations) {
      console.log(index + " == " + iterations)
      res.status(200).send({ "response": "successfully update images" })
    }
  })
}



export function product_image(req, res) {
  var { product_id, product_image_id } = req.body

  if (product_id != "" || product_image_id != "") {
    var img_get_str = ' SELECT * FROM product_images WHERE '
    if (product_id != "") {
      img_get_str += 'product_id = "' + product_id + '" AND '
    }
    if (product_image_id != "") {
      img_get_str += ' product_image_id = "' + product_image_id + '" AND '
    }

    img_get_str = img_get_str.substring(0, img_get_str.length - 4);

    console.log(img_get_str)
    connection.query(img_get_str, (err, rows, fields) => {
      if (err) {
        console.log(err)
        res.status(500).send({ "error": "server error" })
      } else {
        console.log(rows)
        res.status(200).send(rows)
      }
    })
  } else {
    res.status(200).send({ "error": "please fill all inputs" })
  }

}


export function add_remove_cover_image(req, res) {
  var { image_position, product_image_id, product_id } = req.body
  connection.query(' UPDATE `product_images` SET `image_position`="' + image_position + '" WHERE product_image_id = "' + product_image_id + '" AND product_id = "' + product_id + '"', (err, rows, fields) => {
    if (err) {
      console.log(err)
      res.status(200).send({ success: false, message: "opration failed" })
    } else {
      console.log(rows)
      rows.affectedRows ? res.status(200).send({ success: true, message: "updated successfull" }) : res.status(200).send({ success: false, message: "opration failed" })
    }
  })
}


export function product_image_delete(req, res) {
  var { product_image_id, product_id, product_image_name } = req.body

  connection.query('DELETE FROM `product_images` WHERE `product_image_id` = ' + product_image_id + ' AND product_id = ' + product_id + '', (err, rows, fields) => {
    if (err) {
      console.log(err)
      res.status(500).send({ "error": "server error", "status": false })
    } else {
      console.log(rows)
      if (rows.affectedRows == '1') {
        try {
          fs.unlinkSync('/home/we2code/Desktop/nursery_proj/nursery_live/public/product_images/' + product_image_name + '');
          console.log("Delete File successfully.");
        } catch (error) {
          console.log(error);
        }
        res.status(200).send(rows)
      } else {
        res.status(200).send({ "response": "product_id or product_image_id not match", "status": false })
      }
    }
  })



}
// try {
// fs.unlinkSync('/home/we2code/Desktop/nursery_proj/nursery_live/public/product_images/test_52_img_217667.png');
// console.log("Delete File successfully.");
// } catch (error) {
// console.log(error);
// }