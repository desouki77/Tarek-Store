const validateBranchId = (req, res, next) => {
    const branchId = req.query.branchId || req.body.branchId;
    if (!branchId) {
        return res.status(400).json({ message: 'branchId is required' });
    }
    next();
};
module.exports =  validateBranchId ;