// use after `auth` — restricts a route to the given roles
// e.g. router.post('/api/addProduct', auth, requireRole('admin'), ...)
const requireRole = (...roles) => (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
        return res.status(403).json({ message: 'forbidden' });
    }
    next();
};

module.exports = requireRole;
