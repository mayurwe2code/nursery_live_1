import express from "express";
import {
  add_order,
  order_details,
  order_delete,
  order_list,
  order_search,
  order_update,
  order_status_update
} from "../controllers/orderController.js";
import { auth_user, fetch_user, admin_auth } from '../../middleware/auth.js'

const orderRouter = express.Router();
orderRouter.post("/add_order", auth_user, add_order);
orderRouter.post("/order_list", fetch_user, order_list);
orderRouter.post("/order_search", fetch_user, order_search);
orderRouter.get("/order_details", auth_user, order_details);
orderRouter.put("/order_update", auth_user, order_update);
orderRouter.delete("/order_delete/:id", admin_auth, order_delete);
orderRouter.put("/order_status_update", admin_auth, order_status_update);

export default orderRouter;
