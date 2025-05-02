const express = require('express');
const router = express.Router();
// const { auth, checkRole } = require('../middleware/auth');
const vehicleController = require('../controllers/vehicleController');

// router.post('/', auth, checkRole(['driver']), vehicleController.createVehicle);
// router.get('/driver', auth, checkRole(['driver']), vehicleController.getDriverVehicles);
// router.put('/:id', auth, checkRole(['driver']), vehicleController.updateVehicle);
// router.delete('/:id', auth, checkRole(['driver']), vehicleController.deleteVehicle);

module.exports = router;