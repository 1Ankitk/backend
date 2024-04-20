const jwt = require("jsonwebtoken");
require("dotenv").config();
const secretKey = process.env.secretKey;

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
