const mongoose = require('mongoose');

const mealItemSchema = new mongoose.Schema({
  name: String,
  type: { type: String, enum: ['veg', 'non-veg', 'vegan'] },
  calories: Number,
  allergens: [String],
});

const messMenuSchema = new mongoose.Schema({
  day: {
    type: String,
    enum: ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'],
    required: true
  },
  date: { type: Date },
  meals: {
    breakfast: { items: [mealItemSchema], time: { start: String, end: String } },
    lunch:     { items: [mealItemSchema], time: { start: String, end: String } },
    snacks:    { items: [mealItemSchema], time: { start: String, end: String } },
    dinner:    { items: [mealItemSchema], time: { start: String, end: String } },
  },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  isPublished: { type: Boolean, default: false },
}, { timestamps: true });

const messFeedbackSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  menu: { type: mongoose.Schema.Types.ObjectId, ref: 'MessMenu', required: true },
  mealType: { type: String, enum: ['breakfast','lunch','snacks','dinner'] },
  rating: { type: Number, min: 1, max: 5, required: true },
  comment: String,
  date: { type: Date, default: Date.now },
}, { timestamps: true });

messFeedbackSchema.index({ student: 1, menu: 1, mealType: 1 }, { unique: true });

const MessMenu = mongoose.model('MessMenu', messMenuSchema);
const MessFeedback = mongoose.model('MessFeedback', messFeedbackSchema);

module.exports = { MessMenu, MessFeedback };