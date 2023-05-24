import express from "express";
import {
    banner
} from "../controllers/bannerController.js";
import { auth_user, fetch_user } from '../../middleware/auth.js'
const bannerRouter = express.Router();
bannerRouter.post("/banner", banner);
export default bannerRouter;