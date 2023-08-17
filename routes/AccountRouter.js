const express = require("express");
const Router = express.Router();
const { validationResult } = require("express-validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { cloudinary } = require("../configCloud/Cloudinary");
const upload = require("../configCloud/multer");
const unreadModel = require("../models/UnreadModel");
const Notification = require("../models/NotificationModel");

const CheckLogin = require("../auth/CheckLogin");
const AccountModel = require("../models/AccountModel");
const loginValidator = require("./validators/LoginValidator");

Router.get("/", (req, res) => {
  res.json({
    code: 0,
    message: "Account router",
  });
});

Router.get("/users", CheckLogin, async (req, res) => {
  const keyword = req.query.search
    ? {
        $or: [
          { user_name: { $regex: req.query.search, $options: "i" } },
          { user: { $regex: req.query.search, $options: "i" } },
        ],
      }
    : {};

  const users = await AccountModel.find(keyword)
    .find({
      _id: { $ne: req.user.id },
    })
    .select("-password");

  if (users) {
    return res.json({
      code: 0,
      message: "Tìm kiếm danh sách người dùng thành công",
      data: users,
    });
  } else {
    return res.json({ code: 1, message: "Tìm kiếm thất bại" });
  }
});

Router.get("/user/:id", (req, res) => {
  let { id } = req.params;
  if (!id) {
    return res.json({ code: 1, message: "Không có thông tin user" });
  }

  AccountModel.findById(id)
    .then((a) => {
      if (a) {
        return res.json({
          code: 0,
          message: "Đã tìm thấy tài khoản user",
          data: a,
        });
      } else {
        return res.json({ code: 2, message: "Không tìm thấy tài khoản user" });
      }
    })
    .catch((e) => {
      if (e.message.includes("Cast to Object failed")) {
        return res.json({ code: 3, message: "Đây không phải id hợp lệ" });
      }
      return res.json({ code: 3, message: e.message });
    });
});

//  -----tạo tài khoản admin ------
// Router.post("/register", async (req, res) => {
//   try {
//     const { user, password, role } = req.body;
//     const hashPass = await bcrypt.hash(password, 10);
//     const newUser = await AccountModel.create({
//       user: user,
//       password: hashPass,
//       role: role,
//       avatar:
//         "https://res.cloudinary.com/tdtimg/image/upload/v1619852102/wuib8yglnihou4zycrho.jpg",
//     });
//     if (newUser) {
//       return res.json({
//         code: 0,
//         message: "Tạo tài khoản thành công",
//         data: newUser,
//       });
//     }
//   } catch (error) {
//     return res.json({ code: 2, message: error.message });
//   }
// });

Router.post("/login", loginValidator, (req, res) => {
  let result = validationResult(req);
  let account = undefined;
  if (result.errors.length === 0) {
    let { user, password } = req.body;
    AccountModel.findOne({ user: user })
      .then((acc) => {
        if (!acc) {
          throw new Error("Tài khoản không tồn tại");
        }
        account = acc;
        return bcrypt.compare(password, acc.password);
      })
      .then((passwordMatch) => {
        if (!passwordMatch) {
          return res
            .status(401)
            .json({ code: 3, message: "Mật khẩu không chính xác" });
        }
        const { JWT_SECRET } = process.env;
        jwt.sign(
          {
            id: account.id,
          },
          JWT_SECRET,
          {
            expiresIn: "3h",
          },
          (err, token) => {
            if (err) throw err;
            return res.json({
              code: 0,
              message: "Đăng nhập thành công",
              token: token,
            });
          }
        );
      })
      .catch((e) => {
        return res
          .status(401)
          .json({ code: 2, message: "Đăng nhập thất bại:" + e.message });
      });
  } else {
    let messages = result.mapped();
    let message = "";
    for (m in messages) {
      message = messages[m].msg;
      break;
    }
    return res.json({ code: 1, message: message });
  }
});

Router.put("/update/user", CheckLogin, async (req, res) => {
  try {
    let { faculty, birth, phone, gender } = req.body;
    if (!faculty) {
      throw new Error("Vui lòng cung cấp khoa");
    }
    account = await AccountModel.findByIdAndUpdate(
      req.user.id,
      {
        faculty: faculty,
        birth: birth,
        phone: phone,
        gender: gender,
      },
      { new: true }
    );

    const { JWT_SECRET } = process.env;
    jwt.sign(
      {
        id: account.id,
      },
      JWT_SECRET,
      {
        expiresIn: "3h",
      },
      (err, token) => {
        if (err) throw err;

        return res.json({
          code: 0,
          message: "cập nhập thành công",
          token: token,
        });
      }
    );
  } catch (err) {
    return res.json({ code: 2, message: err.message });
  }
});

Router.put("/repassword", CheckLogin, async (req, res) => {
  try {
    let repassword = req.body.repassword;
    let id = req.user.id;
    let role = req.user.role;
    if (role === "student") {
      throw new Error("Tài khoản không cung cấp mật khẩu");
    }
    let password = await bcrypt.hash(repassword, 10);
    let data = {
      password: password,
    };
    await AccountModel.findByIdAndUpdate(id, data);

    return res.json({
      code: 0,
      message: "cập nhập thành công",
    });
  } catch (err) {
    return res.json({ code: 1, message: err.message });
  }
});

Router.put("/rename", CheckLogin, async (req, res) => {
  try {
    let rename = req.body.rename;
    if (!rename) {
      throw new Error("không có tên mới");
    }
    console.log(typeof rename);
    let id = req.user.id;
    account = await AccountModel.findByIdAndUpdate(id, { user_name: rename });
    const { JWT_SECRET } = process.env;
    jwt.sign(
      {
        id: account.id,
      },
      JWT_SECRET,
      {
        expiresIn: "3h",
      },
      (err, token) => {
        if (err) throw err;
        return res.json({
          code: 0,
          message: "cập nhập thành công",
          token: token,
        });
      }
    );
  } catch (err) {
    return res.json({ code: 1, message: err.message });
  }
});

Router.put(
  "/update/avatar",
  CheckLogin,
  upload.single("image"),
  async (req, res) => {
    try {
      let user = await AccountModel.findById(req.user.id);
      console.log(user.id_avatar);
      await cloudinary.uploader.destroy(user.id_avatar);
      let result = await cloudinary.uploader.upload(req.file.path);
      let data = {
        avatar: result.secure_url,
        id_avatar: result.public_id,
      };
      account = await AccountModel.findByIdAndUpdate(req.user.id, data);
      const { JWT_SECRET } = process.env;
      jwt.sign(
        {
          id: account.id,
        },
        JWT_SECRET,
        {
          expiresIn: "3h",
        },
        (err, token) => {
          if (err) throw err;
          return res.json({
            code: 0,
            message: "cập nhật thành công",
            token: token,
          });
        }
      );
    } catch (err) {
      return res.json({ code: 1, message: err.message });
    }
  }
);

Router.get("/current", CheckLogin, async (req, res) => {
  try {
    let data = await AccountModel.findById(req.user.id);

    return res.json({
      code: 0,
      message: "lấy dữ liệu phiên đăng nhập thành công",
      data: data,
    });
  } catch (err) {
    return res.json({ code: 1, message: err.message });
  }
});

module.exports = Router;
