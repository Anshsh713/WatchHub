const express = require("express");
const router = express.Router();

const {
  Login,
  GetMe,
  Signing_Up_Requesting,
  Signing_Up_Verifying,
  Password_Reseting_Requesting,
  Password_Reseting_Verifying,
  Password_Reseting,
  DeletingOTP,
} = require("../controllers/UserControllers");

const { protect } = require("../middleware/Protect");

router.post("/signup/request", Signing_Up_Requesting);
router.post("/signup/verify", Signing_Up_Verifying);

router.post("/login", Login);

router.post("/password/request", Password_Reseting_Requesting);
router.post("/password/verify", Password_Reseting_Verifying);
router.post("/password/resting", Password_Reseting);

router.post("/otp", DeletingOTP);

router.get("/me", protect, GetMe);

module.exports = router;
