const mongoose = require('mongoose');

const rateSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    recipeId: mongoose.Schema.Types.ObjectId,
    reviewerId: mongoose.Schema.Types.ObjectId,
    rate: { type: Number, required: true }
})

module.exports = mongoose.model('Rate', rateSchema);