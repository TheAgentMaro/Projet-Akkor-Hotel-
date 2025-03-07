const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Utilisateur requis']
  },
  hotel: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hotel',
    required: [true, 'Hôtel requis']
  },
  checkIn: {
    type: Date,
    required: [true, 'Date d\'arrivée requise']
  },
  checkOut: {
    type: Date,
    required: [true, 'Date de départ requise']
  },
  numberOfGuests: {
    type: Number,
    required: [true, 'Nombre de personnes requis'],
    min: [1, 'Au moins une personne requise']
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled'],
    default: 'pending'
  },
  totalPrice: {
    type: Number,
    required: [true, 'Prix total requis'],
    min: [0, 'Le prix ne peut pas être négatif']
  },
  specialRequests: {
    type: String,
    maxlength: [500, 'Les demandes spéciales ne peuvent pas dépasser 500 caractères']
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

// Validation personnalisée pour les dates
bookingSchema.pre('validate', function(next) {
  if (this.checkIn && this.checkOut) {
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    const checkInDate = new Date(this.checkIn);
    checkInDate.setHours(0, 0, 0, 0);

    const checkOutDate = new Date(this.checkOut);
    checkOutDate.setHours(0, 0, 0, 0);

    if (checkInDate >= checkOutDate) {
      this.invalidate('checkOut', 'La date de départ doit être après la date d\'arrivée');
    }

    if (checkInDate < now) {
      this.invalidate('checkIn', 'La date d\'arrivée ne peut pas être dans le passé');
    }
  }
  next();
});

// Index pour améliorer les performances des recherches
bookingSchema.index({ user: 1, hotel: 1 });
bookingSchema.index({ checkIn: 1, checkOut: 1 });
bookingSchema.index({ status: 1 });

const Booking = mongoose.model('Booking', bookingSchema);

module.exports = Booking;
