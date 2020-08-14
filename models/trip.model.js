const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const tripSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'user' },
  tripName: String,
  foreignCurrency: String,
  baseCurrency: String,
  budget: Number,
  totalSpent: Number,
  startDate: String,
  endDate: String,
  photo: String,
  categories: [String]
})

const Trip = mongoose.model('Trip', tripSchema);

module.exports = Trip;