const express = require("express");
const Router = express.Router();

const AccountModel = require("../models/AccountModel");
// const Comment = require('../models/CommentModel')
const Newfeed = require("../models/NewFeedModel");
const mongoose = require("mongoose");
const { cloudinary } = require("../configCloud/Cloudinary");
const upload = require("../configCloud/multer");

Router.get("/", (req, res) => {
  Newfeed.find()
    .sort({ date: "desc" })
    .then((Newfeeds) => {
      res.json({
        code: 0,
        message: "Đọc danh sách newfeed thành công",
        data: Newfeeds,
      });
    });
});

Router.get("/commentpost/:id", async (req, res) => {
  try {
    let { id } = req.params;
    if (!id) {
      throw new Error("không nhận diện thấy id post");
    }

    let data_cmt = await Newfeed.findOne(
      mongoose.Types.ObjectId(id),
      "commentlist"
    )
      .populate("commentlist.user_id", "_id user_name avatar")
      .sort({ date: "desc" });
    let cmt_list = data_cmt.commentlist;

    return res.json({
      code: 0,
      message: "đọc danh sách thành công",
      data: cmt_list,
    });
  } catch (err) {
    return res.json({ code: 1, message: err.message });
  }
});

Router.get("/:time", async (req, res) => {
  try {
    let { time } = req.params;
    let pageSkip = undefined;
    if (!parseInt(time)) {
      throw new Error("Resquest không phải định dạng số");
    }

    let feeds = await Newfeed.find();
    console.log(Math.ceil(feeds.length / 10));
    if (Math.ceil(feeds.length / 10) < parseInt(time)) {
      return res.json({ code: 1, message: "Đã hết bài viết" });
    }

    if (parseInt(time) === 1) {
      pageSkip = 0;
    } else {
      pageSkip = (parseInt(time) - 1) * 10;
    }

    let feedlist = await Newfeed.find({})
      .populate("user")
      .populate("commentlist.user_id", "_id user_name avatar")
      .sort({ date: "desc" })
      .limit(10)
      .skip(parseInt(pageSkip));
    return res.json({
      code: 0,
      message: "Đọc danh sách newfeed thành công",
      total: Math.ceil(feeds.length / 10),
      data: feedlist,
    });
  } catch (err) {
    return res.json({ code: 1, message: err.message });
  }
});

Router.get("/yourfeed/:id/:time", async (req, res) => {
  try {
    let { id, time } = req.params;
    let pageSkip = undefined;

    if (!parseInt(time)) {
      throw new Error("Resquest không phải định dạng số");
    }
    let feeds = await Newfeed.find({ user: mongoose.Types.ObjectId(id) });

    if (Math.ceil(feeds.length / 10) < parseInt(time)) {
      return res.json({ code: 1, message: "Đã hết bài viết" });
    }

    if (parseInt(time) === 1) {
      pageSkip = 0;
    } else {
      pageSkip = (parseInt(time) - 1) * 10;
    }

    let feedlist = await Newfeed.find({ user: mongoose.Types.ObjectId(id) })
      .populate("user", "_id user_name avatar")
      .populate("commentlist.user_id", "_id user_name avatar")
      .sort({ date: "desc" })
      .limit(10)
      .skip(parseInt(pageSkip));

    return res.json({
      code: 0,
      message: "Đọc danh sách newfeed thành công",
      total: Math.ceil(feeds.length / 10),
      data: feedlist,
    });
  } catch (err) {
    return res.json({ code: 1, message: err.message });
  }
});

Router.put("/like/:idtus", async (req, res) => {
  try {
    let user = await AccountModel.findOne({ _id: req.user.id });
    let id = user._id;

    let user_name = user.user_name;
    let idtus = req.params.idtus;
    var io = req.app.get("socketio");

    let check = await Newfeed.find({
      _id: idtus,
      "likelist.id_user": mongoose.Types.ObjectId(id),
    });

    if (check.length > 0) {
      let deletelike = await Newfeed.findOneAndUpdate(
        { _id: idtus, "likelist.id_user": mongoose.Types.ObjectId(id) },
        {
          $pull: {
            likelist: {
              id_user: mongoose.Types.ObjectId(id),
            },
          },
        },
        { safe: true, multi: true }
      );
      let feed = await Newfeed.findByIdAndUpdate(
        deletelike._id,
        { $inc: { likecount: -1 } },
        { useFindAndModify: false }
      );

      io.emit("new_likelist", {
        data: {
          like_post: feed._id,
          like_count: feed.likecount,
          like_list: feed.likelist,
        },
      });
      if (feed) {
        const updatedPost = {
          like_post: feed._id,
          like_count: feed.likecount,
          like_list: feed.likelist,
        };
        return res.json({
          code: 0,
          message: "Xóa like bài đăng thành công",
          updatedPost,
        });
      }
    }

    let updateLike = await Newfeed.findByIdAndUpdate(
      idtus,
      { $inc: { likecount: 1 } },
      { useFindAndModify: false, new: true }
    );
    updateLike.likelist.push({
      id_user: mongoose.Types.ObjectId(id),
      user_name: user_name,
    });
    await updateLike.save();
    io.emit("new_likelist", {
      data: {
        like_post: updateLike._id,
        like_count: updateLike.likecount,
        like_list: updateLike.likelist,
      },
    });
    const updatedPost = {
      like_post: updateLike._id,
      like_count: updateLike.likecount,
      like_list: updateLike.likelist,
    };
    return res.json({
      code: 0,
      message: "Like bài đăng thành công",
      updatedPost,
    });
  } catch (err) {
    return res.json({ code: 2, message: err.message });
  }
});

Router.put("/comment/:id", async (req, res) => {
  try {
    let { id } = req.params;
    let { comment } = req.body;
    let id_user = req.user.id;
    var io = req.app.get("socketio");
    if (!id) {
      throw new Error("Không nhận được id bài viết");
    }
    if (!comment) {
      throw new Error("Không nhận được thông tin bình luận");
    }

    const original_id = mongoose.Types.ObjectId();
    let updatecountcmt = await Newfeed.findByIdAndUpdate(
      id,
      { $inc: { commentcount: 1 } },
      { useFindAndModify: false }
    );
    updatecountcmt.commentlist.push({
      cmt_id: original_id,
      user_id: id_user,
      comment: comment,
      date: Date.now(),
    });
    await updatecountcmt.save();

    let data_cmt = await Newfeed.findOne(
      mongoose.Types.ObjectId(id),
      "commentlist"
    )
      .populate("commentlist.user_id", "_id user_name avatar")
      .sort({ date: "desc" });
    let cmt_list = data_cmt.commentlist;
    let comment_json = await cmt_list.filter(
      (cmt) => String(cmt.cmt_id) === String(original_id)
    );

    io.emit("new_comment", {
      data: {
        id_post: id,
        cmt_data: comment_json,
      },
    });
    return res.json({
      code: 0,
      message: "Bình luận bài đăng thành công",
      data: comment_json,
    });
  } catch (err) {
    return res.json({ code: 2, message: err.message });
  }
});

Router.put("/delete/comment/:cmt_id", async (req, res) => {
  try {
    let { cmt_id } = req.params;
    if (!cmt_id) {
      throw new Error("không có thông tin id của bình luật cần xóa");
    }
    let IDuserCheck = req.user.id;

    if (req.user.role === "student") {
      dataCheck = await Newfeed.findOne(
        { "commentlist.cmt_id": mongoose.Types.ObjectId(cmt_id) },
        "commentlist"
      );
      let cmt_list = dataCheck.commentlist;
      let comment_json = cmt_list.filter(
        (cmt) => String(cmt.cmt_id) === String(cmt_id)
      );
      if (String(comment_json[0].user_id) !== String(IDuserCheck)) {
        throw new Error("Tài khoản không được xóa bình luận này");
      }
    }

    deletecmt = await Newfeed.findOneAndUpdate(
      { "commentlist.cmt_id": mongoose.Types.ObjectId(cmt_id) },
      {
        $pull: {
          commentlist: {
            cmt_id: mongoose.Types.ObjectId(cmt_id),
          },
        },
      },
      { safe: true, multi: true }
    );

    await Newfeed.findByIdAndUpdate(
      deletecmt.id,
      { $inc: { commentcount: -1 } },
      { useFindAndModify: false }
    );
    return res.json({ code: 0, message: "Xóa bình luận bài đăng thành công" });
  } catch (error) {
    return res.json({ code: 1, message: error.message });
  }
});

Router.post("/add", async (req, res) => {
  try {
    let { content, linkyoutube } = req.body;

    let newTus = new Newfeed({
      content: content,
      user: mongoose.Types.ObjectId(req.user.id),
      likecount: 0,
      commentcount: 0,
      linkyoutube: linkyoutube,
    });
    await newTus.save();

    let newpost = await Newfeed.findOne(
      mongoose.Types.ObjectId(newTus._id)
    ).populate("user", "_id user_name avatar");
    return res.json({
      code: 0,
      message: "Tạo bài đăng thành công",
      data: newpost,
    });
  } catch (error) {
    return res.json({ code: 1, message: error.message });
  }
});

// Router.put('/update/comment/:id_cmt',async(req,res)=>{
//     try{
//         let {id_cmt} = req.params
//         let {comment} = req.body
//         let updatecmt = await Newfeed.find(
//             {"commentlist.cmt_id" : mongoose.Types.ObjectId(id_cmt)},
//             'commentlist.comment -_id')
//         console.log(updatecmt)
//         res.send('done')
//     }catch(err){
//         return res.json({code:1,message:error.message})
//     }
// })

Router.post("/add/image", upload.single("image"), async (req, res) => {
  try {
    let { content } = req.body;

    const imageCloud = await cloudinary.uploader.upload(req.file.path);
    let newTus = new Newfeed({
      content: content,
      user: mongoose.Types.ObjectId(req.user.id),
      likecount: 0,
      image: imageCloud.secure_url,
      idimage: imageCloud.public_id,
      commentcount: 0,
    });
    await newTus.save();
    let newpost = await Newfeed.findOne({
      _id: mongoose.Types.ObjectId(newTus._id),
    }).populate("user", "_id user_name avatar");
    return res.json({
      code: 0,
      message: "Tạo bài đăng thành công",
      data: newpost,
    });
  } catch (error) {
    res.json({ code: 1, message: error.message });
  }
});

Router.put("/update/:id", async (req, res) => {
  try {
    let { id } = req.params;
    let { content, linkyoutube } = req.body;
    let data = {
      content: content,
      linkyoutube: linkyoutube,
    };
    let feed_update = await Newfeed.findByIdAndUpdate(id, data, { new: true });
    return res.json({
      code: 0,
      message: "Cập nhật thành công",
      data: feed_update,
    });
  } catch (err) {
    return res.json({ code: 1, message: err.message });
  }
});

Router.put(
  "/update/new_image/:id",
  upload.single("image"),
  async (req, res) => {
    try {
      let { id } = req.params;
      let { content } = req.body;
      if (!content) {
        throw new Error("không có caption");
      }
      let result = await cloudinary.uploader.upload(req.file.path);
      let data = {
        content: content,
        image: result.secure_url,
        idimage: result.public_id,
      };
      let feed_update = await Newfeed.findByIdAndUpdate(id, data, {
        new: true,
      });
      return res.json({
        code: 0,
        message: "Cập nhật thành công",
        data: feed_update,
      });
    } catch (err) {
      return res.json({ code: 1, message: err.message });
    }
  }
);

Router.put("/update/image/:id", upload.single("image"), async (req, res) => {
  try {
    let { id } = req.params;
    let { content } = req.body;
    if (!content) {
      throw new Error("không có caption");
    }
    let feed = await Newfeed.findById(id);
    await cloudinary.uploader.destroy(feed.idimage);
    let result = await cloudinary.uploader.upload(req.file.path);
    let data = {
      content: content,
      image: result.secure_url,
      idimage: result.public_id,
    };
    let feed_update = await Newfeed.findByIdAndUpdate(id, data, { new: true });
    return res.json({
      code: 0,
      message: "Cập nhật thành công",
      data: feed_update,
    });
  } catch (err) {
    return res.json({ code: 1, message: err.message });
  }
});

Router.delete("/delete/:id", async (req, res) => {
  try {
    let idTus = req.params.id;
    let tus = await Newfeed.findById(idTus);
    if (tus.idimage) await cloudinary.uploader.destroy(tus.idimage);
    await tus.remove();
    res.json({ code: 0, message: "Xóa bài đăng thành công" });
  } catch (err) {
    res.json({ code: 1, message: "Không tìm thấy bài đăng" });
  }
});

module.exports = Router;
