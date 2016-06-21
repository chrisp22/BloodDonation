'use strict';

import mongoose from 'mongoose';

var DonorSchema = new mongoose.Schema({
  firstName : String,
	lastName : String,
	email : { type: String, unique: true },
	contactNum : String,
	bloodGroup : String,
	address : String,
	location : {
		type: {
			type: String,
			default: 'Point'
		},
		coordinates: [Number]
	}
});

DonorSchema.index({ location : '2dsphere' });

export default mongoose.model('Donor', DonorSchema);
