const express=require("express");
const authController=require("../controllers/auth.controller");
const authMiddleware=require("../middlewares/auth.middleware");
const router=express.Router();
router.post("/register",authController.regsiterUserController);
router.post("/login",authController.loginUserController);
router.get("/logout",authController.logoutUserController);
router.get("/get-me",authMiddleware.authUser,authController.getMeController);
module.exports=router;