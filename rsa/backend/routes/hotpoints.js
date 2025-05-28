const express = require('express');
const router = express.Router();
const {
  createHotpoint,
  getAllHotpoints,
  getHotpointById,
  updateHotpoint,
  deleteHotpoint,
  getHotpointsNearby,
  searchHotpoints,
  getHotpointFilters
} = require('../controllers/hotpointController');
const { authenticate, authorize } = require('../middleware/auth');

// Public routes
router.get('/nearby', getHotpointsNearby);
router.get('/search', searchHotpoints);
router.get('/filters', getHotpointFilters);

// Routes for /api/hotpoints
router.route('/')
  .get(getAllHotpoints)
  .post(authenticate, authorize(['admin']), createHotpoint);

// Routes for /api/hotpoints/:id
router.route('/:id')
  .get(getHotpointById)
  .put(authenticate, authorize(['admin']), updateHotpoint)
  .delete(authenticate, authorize(['admin']), deleteHotpoint);

module.exports = router;