const mongoose = require('mongoose');

const recipeSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    ownerId: mongoose.Schema.Types.ObjectId,
    ownerNick: { type: String, required: true },
    name: { type: String, required: true },
    type: { type: String, required: true },
    description: { type: String },
    ingredients: { type: [
        { ingredient: String,
            sizeUnit: String,
            sizeValue: Number } 
        ],required: true },
    preparationDescription: { type: String, required: true },
    averageRate: { type: Number, required: true },
    imagePath: { type: String }
},{
    timestamps: true
})

module.exports = mongoose.model('Recipe', recipeSchema);