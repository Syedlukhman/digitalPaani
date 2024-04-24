const jwt = require('jsonwebtoken');
const decodeJwt = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (authHeader) {
        const payload = jwt.verify(authHeader, 'authenticateDP');
        var userId = payload.id;
        var userName = payload.name;
        var isSuperUser = payload.isSuperUser;
        var userType = payload.type
    }
    req.user = { userId, userName, isSuperUser, userType };
    return next();
};
module.exports = {
    decodeJwt
}