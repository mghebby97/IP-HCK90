const jwt = require("jsonwebtoken")

const signToken = (data) => jwt.sign(data, process.env.JWT_SECRET)
const verifyToken = (token) => jwt.verify(token, process.env.JWT_SECRET)

module.exports = {
    signToken,
    verifyToken
}