const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    // console.log(req.headers.authorization.split(" ")[1]);
    try{
        const token = req.headers.authorization.split(" ")[1];
        // console.log(req.headers.authorization);
        const decoded = jwt.verify(token, 'secret');
        req.userData = decoded;
        // console.log(decoded);
        next();
    }catch(error) {
        return res.status(401).json({
            message: 'Auth failed'
        });
    }
    
}