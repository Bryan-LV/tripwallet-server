const Joi = require('@hapi/joi');

// validate create trip inputs
const createTripValidation = Joi.object({
  tripName: Joi.string().min(3),
  foreignCurrency: Joi.string().min(3).max(3),
  baseCurrency: Joi.string().min(3).max(3),
  budget: Joi.number(),
  startDate: Joi.string(),
  endDate: Joi.string(),
  photo: Joi.string()
})

//validate update trip inputs
const updateTripValidation = Joi.object({
  tripID: Joi.string(),
  tripName: Joi.string().min(3),
  foreignCurrency: Joi.string().min(3).max(3),
  budget: Joi.number(),
  startDate: Joi.string(),
  endDate: Joi.string(),
  photo: Joi.string()
})

module.exports = { createTripValidation, updateTripValidation }