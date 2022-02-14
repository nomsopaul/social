const User = require("../models/User");
const bcrypt = require("bcryptjs");
const router = require("express").Router();

//update user
// router.put(":/id", async(req, res) => {
//     if (req.body.userId === req.params.id || req.body.isAdmin) {
//         if(req.body.password) {
//             try{
//                 const salt = await bcrypt.genSalt(10);
//                 req.body.password = await bcrypt.hash(req.body.password, salt);
//             }catch(err){
//                 return res.status(500).json(err);
//             }
//         }
//         try{
//             const user = await User.findByIdAndUpdate(req.params.id, {
//                 $set: req.body,
//             });
//             res.status(200).json("Account has been updated successfully");
//         }catch(err) {
//             return res.status(500).json(err);
//         }
//     } else {
//         return res.status(403).json("You can update only your account");
//     }
// });

router.put("/:id", async (req, res) => {
  if (req.body.userId === req.params.id) {
    if (req.body.password) {
      const salt = await bcrypt.genSalt(10);
      req.body.password = await bcrypt.hash(req.body.password, salt);
    }
    try {
      const updatedUser = await User.findByIdAndUpdate(
        req.params.id,
        {
          $set: req.body,
        },
        { new: true }
      );
      res.status(200).json(updatedUser);
    } catch (err) {
      res.status(500).json(err);
    }
  } else {
    res.status(401).json("you can update only your account!");
  }
});

//delete user
router.delete("/:id", async (req, res) => {
  if (req.body.userId === req.params.id || req.body.isAdmin) {
    try {
      const user = await User.findByIdAndDelete(req.params.id);
      res.status(200).json("Account has been deleted successfully");
    } catch (err) {
      return res.status(500).json(err.message);
    }
  } else {
    return res.status(403).json("You can delete only your account");
  }
});

//get a user
router.get("/:id", async (req, res) => {
  try {
    const user = User.findById(req.params.id);
    const { password, updatedAt, ...other } = user._doc;
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json(err);
  }
});

//follow a user

router.put("/:id/follow", async (req, res) => {
  if (req.body.userId !== req.params.id) {
    try {
      const user = await User.findById(req.params.id);
      const currentUser = await User.findById(req.body.userId);
      if (!user.followers.includes(req.body.userId)) {
        await user.updateOne({ $push: { followers: req.body.userId } });
        await currentUser.updateOne({ $push: { followings: req.params.id } });
        res.status(200).json("user has been followed!");
      } else {
        res.status(403).json("you have already followed this user");
      }
    } catch (err) {
      res.status(500).json(err);
    }
  } else {
    res.status(403).json("you cant follow your account!");
  }
});

//unfollow a user

router.put("/:id/unfollow", async (req, res) => {
  if (req.body.userId !== req.params.id) {
    try {
      const user = await User.findById(req.params.id);
      const currentUser = await User.findById(req.body.userId);
      if (user.followers.includes(req.body.userId)) {
        await user.updateOne({ $pull: { followers: req.body.userId } });
        await currentUser.updateOne({ $push: { followings: req.params.id } });
        res.status(200).json("user has been unfollowed!");
      } else {
        res.status(403).json("you have already unfollowed this user");
      }
    } catch (err) {
      res.status(500).json(err);
    }
  } else {
    res.status(403).json("you cant unfollow your account!");
  }
});

module.exports = router;
