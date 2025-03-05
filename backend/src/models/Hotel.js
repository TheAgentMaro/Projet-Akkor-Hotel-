const mongoose = require('mongoose');

const hotelSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Le nom est requis'],
    trim: true
  },
  location: {
    type: String,
    required: [true, 'La localisation est requise'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'La description est requise']
  },
  picture_list: [{
    type: String,
    required: [true, 'Au moins une image est requise']
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  }
});

// Index pour le tri
hotelSchema.index({ name: 1 });
hotelSchema.index({ location: 1 });
hotelSchema.index({ createdAt: -1 });

const Hotel = mongoose.model('Hotel', hotelSchema);

module.exports = Hotel;
