const express = require('express');
const { getUsers, deleteUser } = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

// All routes here are protected and require admin role
router.use(protect);
router.use(authorize('admin'));

router.route('/users')
    .get(getUsers);

router.route('/users/:id')
    .delete(deleteUser);

module.exports = router;
