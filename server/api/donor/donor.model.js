'use strict';

import mongoose from 'mongoose';

var DonorSchema = new mongoose.Schema({
  firstName : { type: String, required: true },
  lastName : { type: String, required: true },
  email : { type: String, required: true, unique: 'email already exists' },
  contactNum : { type: String, required: true },
  bloodGroup : { type: String, required: true },
  address : { type: String, required: true },
  location : {
    type: {
      type: String,
      default: 'Point'
    },
    coordinates: [{ type: Number, required: true }]
  }
});

DonorSchema.index({ location : '2dsphere' });

export default mongoose.model('Donor', DonorSchema);
