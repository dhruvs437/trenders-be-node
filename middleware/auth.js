const jwt = require('jsonwebtoken');
const User = require('../schema/userSchema');

// verifies the Bearer token, loads the matching user, and puts it on req.user
// so downstream handlers trust req.user instead of an email/id from the request body
const auth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization || '';
        const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

        if (!token) {
            return res.status(401).json({ message: 'not authenticated' });
        }

        const decoded = jwt.verify(token, process.env.SECRET_KEY);
        // matching the stored token (not just the _id) means an old token stops
        // working the moment the user logs in again elsewhere, since generateToken overwrites it
        const user = await User.findOne({ _id: decoded._id, token });

        if (!user) {
            return res.status(401).json({ message: 'not authenticated' });
        }

        req.user = user;
        next();
    } catch (err) {
        return res.status(401).json({ message: 'not authenticated' });
    }
};

module.exports = auth;
