const express = require('express');
const router = express.Router();
// const { auth, checkRole } = require('../middleware/auth');
const tripController = require('../controllers/tripController');

// router.post('/', auth, checkRole(['driver']), tripController.createTrip);
// router.get('/driver', auth, checkRole(['driver']), tripController.getDriverTrips);
// router.put('/:id', auth, checkRole(['driver']), tripController.updateTrip);
// router.delete('/:id', auth, checkRole(['driver']), tripController.cancelTrip);
// router.put('/:id/status', auth, checkRole(['driver']), tripController.updateTripStatus);

module.exports = router;