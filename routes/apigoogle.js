const express = require("express");
const Router = express.Router();
const { OAuth2Client } = require("google-auth-library");
const jwt = require("jsonwebtoken");
const AccountModel = require("../models/AccountModel");
const mongoose = require("mongoose");

const client = new OAuth2Client(process.env.CLIENT_ID_GG);
const { cloudinary } = require("../configCloud/Cloudinary");
const passport = require("passport");

Router.get("/student", (req, res) => {
  AccountModel.find({ role: "student" }).then((users) => {
    res.json({
      code: 0,
      message: "Đọc danh sách sinh viên thành công",
      data: users,
    });
  });
});

//

function generateJwtToken(userId) {
  // Generate the token using your preferred JWT library and secret
  // Example using the 'jsonwebtoken' library
  const token = jwt.sign({ userId }, process.env.JWT_SECRET);
  return token;
}

Router.post("/googlelogin", async (req, res) => {
  const { verified_email, name, email, picture } = req.body;
  let original_id = mongoose.Types.ObjectId();

  // client
  //   .verifyIdToken({
  //     idToken: tokenId,
  //     audience: process.env.CLIENT_ID_GG,
  //   })
  //   .then((response) => {
  //     // console.log(response.payload);
  //     const { email_verified, name, email, picture, hd } = response.payload;
  //     if (!hd || hd !== "student.tdtu.edu.vn") {
  //       return res.json({
  //         code: 2,
  //         message: "Tài khoản không phù hợp",
  //       });
  //     }
  if (verified_email) {
    AccountModel.findOne({ user: email }).exec((err, user) => {
      if (err) {
        return res.json({
          code: 2,
          message: err.message,
        });
      } else {
        if (user) {
          const { JWT_SECRET } = process.env;
          const token = jwt.sign(
            {
              id: user.id,
            },
            JWT_SECRET,
            { expiresIn: "3h" }
          );
          res.json({
            code: 0,
            message: "Đăng nhập thành công",
            token: token,
          });
        } else {
          cloudinary.uploader.upload(picture).then((imageCloud) => {
            let newAccount = new AccountModel({
              _id: original_id,
              user: email,
              user_name: name,
              avatar: imageCloud.secure_url,
              id_avatar: imageCloud.public_id,
              role: "student",
            });
            newAccount.save((err, data) => {
              if (err) {
                return res.json({
                  code: 2,
                  message: err.message,
                });
              }

              const { JWT_SECRET } = process.env;
              const token = jwt.sign(
                {
                  id: data.id,
                },
                JWT_SECRET,
                { expiresIn: "3d" }
              );
              res.json({
                code: 0,
                message: "Đăng nhập thành công",
                token: token,
              });
            });
          });
        }
      }
    });
  }
  //   });
});

module.exports = Router;
