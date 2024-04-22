const { User, UserSession } = require("../models/users");
const { setUser, getUser } = require("../service/auth");
const { dataToInsert, dataToFetch} = require("../database");
const bcrypt = require("bcrypt");
const { createPostRelation, getPost, createLikeRelation, deleteNodes, createComments, getAllComments, createFollowers } = require("../neo4jDb");

async function handelUserSignup(req, res, next) {
    try {
        const { username, email, password, phoneNumber } = req.body;
        const usernameCheck = await User.findOne({ username });
        if (usernameCheck)
            return res.json({ msg: "Username already used", status: false });
        const emailCheck = await User.findOne({ email });
        if (emailCheck)
            return res.json({ msg: "Email already used", status: false });
        const hashedPassword = await bcrypt.hash(password, 10);
        const phoneNumberCheck = await User.findOne({ phoneNumber });
        if (phoneNumberCheck) 
            return res.json({msg: "User with this phone number already exists", status: false});
        const user = await User.create({
            email,
            username,
            password: hashedPassword,
            phoneNumber
        });
        delete user.password;
        return res.send("user created");
    } catch (ex) {
        next(ex);
    }
    // console.log(req.body) ;
    // console.log("user created from model");
}

async function handelUserlogin(req, res) {
    // console.log(req.body);
    const { email, password } = req.body;
    const user = await User.findOne({ email, password })
    if (!user)
      return res.json({ msg: "Incorrect email or Password", status: false });
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid)
      return res.json({ msg: "Incorrect email or Password", status: false });
    delete user.password;
    const token = setUser(user);
    const username = user.username;
    await UserSession.create({
        username
    })
    console.log("this is console for sessions " + res.cookie);
    const UserSessionForUser = await UserSession.findOne({ username });
    console.log("this is console in handle login" + UserSessionForUser);
    if (!UserSessionForUser) res.send("user not loggedIn");
    UserSessionForUser.numberOfTimesLoggedIn = UserSessionForUser.numberOfTimesLoggedIn ? Number(UserSessionForUser.numberOfTimesLoggedIn) + 1 : 1;
    UserSessionForUser.lastLogin = new Date();
    UserSessionForUser.activity = "Login";
    await UserSessionForUser.save();
    dataToInsert(UserSessionForUser);
    console.log("this is console under handler for request...." + req.body);
    console.log("user" + user + "user session " + UserSessionForUser);
    return res.status(200).send(token);

}

async function changeEmail(req, res) {
    const { email, newEmail } = req.body;
    // console.log("session id of request " + JSON.stringify(req.sessionID))
    // console.log("body for email change" + req.toString() + "previous email" + email);
    const user = await User.findOne({ email });
    if (!user) res.send("invalid email");
    const reqToken = req.token;
    if (reqToken) {
        const auth = getUser(reqToken);
        if (auth == NULL) {
            res.send("authentication failed");
        }
    };
    const username = user.username;
    const UserSessionForUser = await UserSession.findOne({ username });
    if (!UserSessionForUser) res.send("user not loggedIn");
    UserSessionForUser.numberOfTimesLoggedIn = UserSessionForUser.numberOfTimesLoggedIn ? Number(UserSessionForUser.numberOfTimesLoggedIn) + 1 : 1;
    UserSessionForUser.lastLogin = new Date();
    UserSessionForUser.activity = "changeEmail";
    user.email = newEmail;
    console.log("user after email" + user);
    user.save();
    UserSessionForUser.save();
    dataToInsert(UserSessionForUser);
    res.send(token);

}

async function changePhoneNumber(req, res) {
    const { phoneNumber, newPhoneNumber } = req.body;
    const user = await User.findOne({ phoneNumber });
    if (!user) res.send("invalid phoneNumber");
    const reqToken = req.token;
    if (reqToken) {
        const auth = getUser(reqToken);
        if (auth == NULL) {
            res.send("authentication failed")
        }
    };
    user.phoneNumber = newPhoneNumber;
    const username = user.username;
    const UserSessionForUser = await UserSession.findOne({ username });
    UserSessionForUser.numberOfTimesLoggedIn = UserSessionForUser.numberOfTimesLoggedIn ? Number(UserSessionForUser.numberOfTimesLoggedIn) + 1 : 1;
    UserSessionForUser.lastLogin = new Date();
    UserSessionForUser.activity = "changePhoneNumber";
    user.save();
    UserSessionForUser.save();
    dataToInsert(UserSessionForUser);
    res.send(token);
}

async function handleAllUsersSessionsActivity(req, res) {
    try {
        dataToFetch((err, data) => {
            if (err) {
                console.error(err);
                res.status(500).json({ message: 'Internal Server Error' });
                return;
            }
            res.json(data); // Assuming data is an array of objects
        });
    } catch (error) {
        // console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}

async function handelGetUsers(req, res) {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) res.send("Wrong email address");
    res.send(user);
}

async function handelAllUsers(req, res) {
    const user = await User.find({});
    if (!user) res.send("wrong email address");
    // console.log("session id of request " + JSON.stringify(req.sessionID));
    const UserSessionForUser = await UserSession.find({});
    res.send("details of all user are" + user + "details of sessions are" + UserSessionForUser);
}
//neo4j funtion calls
async function createPost(req, res) {
    createPostRelation(req, res);
}
async function getAllPost(req, res) {
    getPost(req, res);
}
async function createLike(req, res) {
    createLikeRelation(req, res)
}
async function deleteAllNodes(req, res) {
    deleteNodes(req, res);
}
async function createComment(req, res) {
    createComments(req, res);
}
async function getComment(req, res) {
    getAllComments(req, res);
}
async function createFollower(req, res) {
    createFollowers(req, res);
}
module.exports = { handelUserSignup, handelUserlogin, changeEmail, changePhoneNumber, handelGetUsers, handelAllUsers, createPost, getAllPost, createLike, deleteAllNodes, createComment, getComment, createFollower, handleAllUsersSessionsActivity}; 
