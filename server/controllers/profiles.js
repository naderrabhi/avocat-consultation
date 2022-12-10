const Profile = require("../models/profile");
const User = require("../models/users");

const createProfile = async (req, res) => {
  const url = `${req.protocol}://${req.get("host")}`;

  const obj = {}
  if (req.body.fileName) {obj.fileName = req.body.fileName}
  if (req.body.address) {obj.address = req.body.address}
  if (req.body.bio) {obj.bio = req.body.bio}
  if (req.body.phone) {obj.phone = req.body.phone}
  if (req.body.facebook) {obj.facebook = req.body.facebook}
  if (req.body.linkedin) {obj.linkedin = req.body.linkedin}
  if (req.body.instagram) {obj.instagram = req.body.instagram}
  if (req.file) {obj.image = `${url}/${req.file.path}`}
  
  try {
    const existProfile = await Profile.findOne({ lawyerID: req.user._id });

    if (existProfile) {
      await Profile.updateOne({ lawyerID: req.user._id }, { ...obj });
      await User.updateOne({_id : req.user._id},{isHasProfile : true})
      const updatedProfile = await Profile.findOne({ lawyerID: req.user._id }).populate("lawyerID", "-password");
      return res.send({updatedProfile});
    }
    const newProfile = await new Profile({
      ...obj,
      lawyerID: req.user._id,
      specialty : req.user.specialty,
      name : req.user.firstName + " " + req.user.lastName
    }).populate("lawyerID", "-password");
    await User.updateOne({_id : req.user._id},{isHasProfile : true})
    await newProfile.save();
    res.send(newProfile);
  } catch (error) {
    res.status(400).send({ msg: error.message });
    console.log(error);
  }
};

const getMyProfile = async (req, res) => {
  try {
    const profile = await Profile.findOne({
      lawyerID: { _id: req.user._id },
    }).populate("lawyerID", "-password");
    if (!profile)
      return res.status(400).send({ msg: "you can not access this profile" });
    res.send(profile);
  } catch (error) {
    res.status(400).send({ msg: error.message });
    console.log(error);
  }
};

const getAllProfiles = async (req, res) => {
  const search = req.query.search;
  try {

    if (search == "tout" || search == "") {
      const profiles = await Profile.find({}).populate("lawyerID", "-password");
      return res.send(profiles);
    }
    
    const profilesName = await Profile.find({name: { $regex: search }}).populate("lawyerID","-password"); 
    const profilesSpecialty = await Profile.find({specialty: { $regex: search }}).populate("lawyerID","-password");
    const profilesAddress = await Profile.find({address: { $regex: search }}).populate("lawyerID","-password");
     
    if (profilesName.length > 0) {
        return res.send(profilesName);
    }else if (profilesSpecialty.length > 0) {
        return res.send(profilesSpecialty);
    }else if (profilesAddress.length > 0) {
        return res.send(profilesAddress);
    }

  } catch (error) {
    res.status(400).send({ msg: error.message });
    console.log(error);
  }
};

const getOneProfile = async (req, res) => {
  try {
    const profile = await Profile.find({ lawyerID: req.params.id }).populate(
      "lawyerID",
      "-password"
    );
    res.send(profile);
  } catch (error) {
    res.status(400).send({ msg: error.message });
    console.log(error);
  }
};

const deleteProfile = async (req, res) => {
  const id = req.params.id;
  try {
    const deletedProfile = await Profile.deleteOne({ lawyerID: id });
    if (deletedProfile.deletedCount) {
      return res.send({ msg: "Profile deleted successfully" });
    } else {
      return res.status(400).send({ msg: "Profile already deleted" });
    }
  } catch (error) {
    res.status(400).send({ msg: error.message });
    console.log(error);
  }
};



module.exports = {
  getMyProfile,
  createProfile,
  getAllProfiles,
  getOneProfile,
  deleteProfile,
};