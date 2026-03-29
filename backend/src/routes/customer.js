import { Router } from "express";
import { CustomerController } from "../../controllers/customer.js";
import {wh_managerController} from "../../controllers/wh_manager.js";
import { JWTmiddleware } from "../../middlewares/Jwt.js";

const router = Router();

router.post("/customer/create",CustomerController.createCustomer);
router.post("/customer/update",CustomerController.updateUser, JWTmiddleware);
router.post("/customer/login",CustomerController.loginUser);
router.post("/customer/verify-otp", CustomerController.emailLogin);
router.get("/customer/getId/:id",CustomerController.getUserId);
router.get("/customer/info", JWTmiddleware, CustomerController.getUserInfo);
router.post("/warehouse-manager/login", wh_managerController.login_wh_manager);
router.post("/warehouse-manager/verify-otp", wh_managerController.verify_otp_wh_manager);
router.post("/warehouse-manager/create", wh_managerController.create_wh_manager);
export default router;