const express = require('express');
const Route = require('../models/Route');

exports.getRoutes = async (req, res) => {
  try {
    const routes = await Route.find();
    res.status(200).json({
      success: true,
      count: routes.length,
      data: routes
    });
  } catch (error) {
    res.status(500).json({ /* error handling */ });
  }
};

exports.getRouteById = async (req, res) => {
  try {
    const route = await Route.findById(req.params.id);
    
    if (!route) {
      return res.status(404).json({
        success: false,
        message: 'Route not found'
      });
    }

    res.status(200).json({
      success: true,
      data: route
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};