import connection from "./Db.js";
import express from "express";
import "dotenv/config";
import productRouter from "./src/routers/productRouter.js";
import cors from "cors";
import jwt from 'jsonwebtoken'
import bodyParser from "body-parser";
import cartRouter from "./src/routers/cartRouter.js";
import userRouter from "./src/routers/userRouter.js";
import orderRouter from "./src/routers/orderRouter.js";
import notificationRouter from "./src/routers/notificationRouter.js";
import product_images_router from "./src/routers/product_images_router.js";
import filter_list_router from "./src/routers/filter_list_router.js";
import delivery_router from "./src/routers/delivery_router.js";
import vendor_router from "./src/routers/vendorRouter.js";
import adminRouter from "./src/routers/admin_router.js";
import bannerRouter from "./src/routers/bannerRouter.js";
import mongoose from 'mongoose';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import passport from 'passport'
import session from 'express-session';
import connectMongo from 'connect-mongo';
const MongoStore = connectMongo(session);
import { ensureAuth, ensureGuest } from './middleware/auth.js'

const app = express();
connection;
app.use(cors());

app.use(bodyParser.json({ limit: '500mb' }));
app.use(bodyParser.urlencoded({ limit: '500mb', extended: true, parameterLimit: 70000 }));


app.use(express.static("public"));

connection.query("SET GLOBAL sql_mode=(SELECT REPLACE(@@sql_mode,'ONLY_FULL_GROUP_BY',''))", (err, rows) => {
  if (err) {
    console.log("error-------------------SET GLOBAL sql_mode===========" + err)
  } else {
    console.log("--ok-----------------SET GLOBAL sql_mode======ok=====")
    console.log(rows)
  }
});

// var i = 0
// setInterval(
//   function set_product() {
//     console.log("call_set_time")
//     connection.query("INSERT INTO `product`(`vendor_id`, `name`, `seo_tag`, `brand`, `quantity`, `unit`, `product_stock_quantity`, `price`, `mrp`, `gst`, `sgst`, `cgst`, `category`, `is_deleted`, `status`, `review`, `discount`, `rating`, `description`, `is_active`, `created_by`, `created_by_id`) VALUES ('" + product_json[i].vendor_id + "', '" + product_json[i].name + "', '" + product_json[i].seo_tag + "', '" + product_json[i].brand + "', '" + product_json[i].quantity + "', '" + product_json[i].unit + "', '" + product_json[i].product_stock_quantity + "', '" + product_json[i].price + "', '" + product_json[i].mrp + "', '" + product_json[i].gst + "', '" + product_json[i].sgst + "', '" + product_json[i].cgst + "', '" + product_json[i].category + "', '" + product_json[i].is_deleted + "', '" + product_json[i].status + "', '" + product_json[i].review + "', '" + product_json[i].discount + "', '" + product_json[i].rating + "', '" + product_json[i].description.replace("'", " ") + "', '" + product_json[i].is_active + "', '" + product_json[i].created_by + "', '" + product_json[i].created_by_id + "')", (err, rows) => {
//       if (err) {
//         console.log("project_json---------------------------------------------------" + err)
//       } else {
//         console.log(rows)
//         i++
//       }
//     });
//   }, 500);


app.use(productRouter, cartRouter, userRouter, orderRouter, notificationRouter, product_images_router, filter_list_router, vendor_router, delivery_router, adminRouter, bannerRouter);
// 


mongoose.connect("mongodb+srv://Raahul_verma:vw48MlF9mMcMJL7y@cluster0.hxtq31y.mongodb.net/CrudNew?retryWrites=true&w=majority", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  connectTimeoutMS: 600000,
})



import passportConfig from "./passport.js";

passportConfig(passport);


// require('./passport')(passport)

app.set('view engine', 'ejs');

app.use(
  session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: false,
    store: new MongoStore({ mongooseConnection: mongoose.connection }),
  })
)
app.use(passport.initialize())
app.use(passport.session())


app.get("/check", (req, res) => { res.send("___________check_result_ok_______________") })

app.get("/auth_with_google", ensureGuest, (req, res) => {
  console.log("/abc")
  res.render('login')
})

app.get("/log", ensureAuth, async (req, res) => {
  // res.send(req.user)
  var { firstName, lastName, email } = req.user
  connection.query("INSERT INTO `user`( `first_name`, `last_name`, `email`) VALUES ('" + firstName + "','" + lastName + "','" + email + "')", async (err, rows, fields) => {
    if (err) {
      //console.log("error"+err)

      if (err.code == "ER_DUP_ENTRY") {
        res.status(200).send({ "status": "200", "response": "email already exist" })
      } else {
        res.status(200).send(err)
      }
    } else {
      if (rows != '') {
        var uid = rows.insertId
        jwt.sign({ id: rows.insertId }, process.env.USER_JWT_SECRET_KEY, function (err, token) {
          //console.log(token);
          if (err) {
            //console.log(err)
          }

          // connection.query('UPDATE `users` SET `token`="'+token+'" WHERE `user_id`='+uid+'',async (err, rows, fields) => {
          //   if(err){
          //     //console.log("error"+err)
          //   }else{
          //     //console.log(["update token", rows])
          //   }
          // })

          connection.query('INSERT INTO `notification`(`actor_id`, `actor_type`, `message`, `status`) VALUES ("' + rows.insertId + '","user","welcome to nursery live please compleate your profile","unread"),("001","admin","create new user (user_id ' + rows.insertId + ')","unread")', (err, rows) => {
            if (err) {
              //console.log({ "notification": err })
            } else {
              console.log("_______notification-send__94________")
            }
          })
          res.send({ "response": "successfully created", "user_id": rows, "user_email": rows.insertId, "token": token, "redirect_url": "http://localhost:3000/" })
        });


      }



    }
  })
  // res.redirect("http://localhost:3000/")

  // res.render('index',{userinfo:req.user})
})



app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }))

app.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: '/' }),
  (req, res) => {
    res.redirect('/log')
  }
)

app.get('/auth/logout', (req, res) => {
  // req.logout()
  // res.redirect('/')
  req.logout(function (err) {
    if (err) { return next(err); }
    res.redirect('/auth_with_google');
  });
})






app.listen(8888, () => {
  console.log(`server is running at ${process.env.SERVERPORT}`);
});



