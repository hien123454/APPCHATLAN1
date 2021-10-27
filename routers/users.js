const express = require("express");
// const router = express.Router()
const router = require("express-promise-router")();
const { verifyAccessToken } = require("../helpers/jwt.service");
const UserController = require("../controllers/users");

const {
  validateBody,
  validateParam,
  schemas,
} = require("../helpers/user.validate");



router
  .route("/GetUserAfterLogin")
  .get(verifyAccessToken, UserController.GetUserAfterLogin);

router
  .route("/")
  .get(verifyAccessToken, UserController.index)
  .post(validateBody(schemas.userSchema), UserController.newUser);
router
  .route("/:userID")
  .get(validateParam(schemas.idSchema, "userID"), UserController.getUser)
  .put(
    validateParam(schemas.idSchema, "userID"),
    validateBody(schemas.userSchema),
    UserController.replaceUser
  )
  .patch(
    validateParam(schemas.idSchema, "userID"),
    validateBody(schemas.userOptionalSchema),
    UserController.updateUser
  );

router
  .route("/signup")
  .post(validateBody(schemas.authSignUpSchema), UserController.signUp);

router
  .route("/signin")
  .post(validateBody(schemas.authSignInSchema), UserController.signIn);

router
  .route("/changePassword")
  .post(
    validateBody(schemas.authChangePasswordSchema),
    verifyAccessToken,
    UserController.ChangePassword
  );

router.route("/refreshToken").post(UserController.refreshToken);

router.route("/logout").delete(UserController.Logout);

router
  .route("/requestAddFriend")
  .post(verifyAccessToken, UserController.requestAddFriend);

router
  .route("/cancelSendedFriend")
  .post(verifyAccessToken, UserController.cancelSendedFriend);

router
  .route("/acceptFriend")
  .post(verifyAccessToken, UserController.acceptFriend);

router
  .route("/declineFriend")
  .post(verifyAccessToken, UserController.declineFriend);

router.route("/sendOtp").post(UserController.sendOTP);

router.route("/verifyOtpSignUp").post(UserController.verifyOTPSignUp);

router.route("/forgotPassword").post(UserController.forgotPassword);

router.route("/checkPhone").post(UserController.checkPhone);



module.exports = router;
