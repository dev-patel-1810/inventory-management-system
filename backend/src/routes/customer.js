import { Router } from "express";
import { CustomerController } from "../../controllers/customer.js";
import { JWTmiddleware } from "../../middlewares/Jwt.js";

const router = Router();

router.post("/customer/create",CustomerController.createCustomer);
router.post("/customer/update",CustomerController.updateUser, JWTmiddleware);
router.post("/customer/login",CustomerController.loginUser);
router.post("/customer/verify-otp", CustomerController.emailLogin);
router.get("/customer/getId/:id",CustomerController.getUserId);
router.get("/customer/info", JWTmiddleware, CustomerController.getUserInfo);

export default router;