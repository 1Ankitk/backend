const jwt = require("jsonwebtoken");
const secretKey = "AiZ@123";

function setUser(user) {
    return jwt.sign(
        {
            _id: user._id,
            email: user.email
        }, secretKey, { expiresIn: '1h' });
}

function getUser(token) {
    if (!token) return null;
    try {
        return jwt.verify(token, secretKey);
    }
    catch(err) {
        return null;
    }
}

module.exports = { setUser, getUser };