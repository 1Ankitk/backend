const { getUser } = require("../service/auth");
async function restrictToLoggedinUsersOnly(req,res,next)
{
    const userUid = req.cookies.uid;

    if(!userUid) return res.send("user logging in first time ");
    const user = getUser(userUid);
    if(!user) return res.send("user not found");
    req.user = user;
    next();

}

module.exports = {restrictToLoggedinUsersOnly};