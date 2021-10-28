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
  .route("/:userID")
  .get( UserController.getUser)
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
  .route("/GetUserAfterLogin")
  .get(verifyAccessToken, UserController.GetUserAfterLogin);

router
  .route("/")
  .get(verifyAccessToken, UserController.index)
  .post(validateBody(schemas.userSchema), UserController.newUser);
  

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

module.exports = router;
