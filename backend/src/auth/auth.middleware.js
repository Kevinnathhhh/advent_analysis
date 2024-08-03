const jwt = require("jsonwebtoken");

const authenticateJWT = (req, res, next) => {
    const token = req.header("Authorization")?.split(" ")[1];
    if (token) {
        jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
            if (err) {
                return res.sendStatus(403);
            
            }
            req.user = user;
            next();
        });
    }else {
        res.sendStatus(401);
    }
};

const authorizeRoles = (...roles) => {
    return (req, res, next) => {
      if (!roles.includes(req.user.role)) {
        return res.sendStatus(403);
      }
      next();
    };
  };

module.exports = {authenticateJWT, authorizeRoles};