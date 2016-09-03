/**
 * Created by chrisp on 23/08/2016.
 * // match: /^[(][0-9]{3}[)] [0-9]{3}-[0-9]{4}$/,
 */

var mongoose = require('mongoose');
var BloodGroup = require('./bloodgroup');
// var Location = require('./location');


var donorSchema = {

    firstName: {
        type: String,
        required: true,
        lowercase: true
    },
    lastName: {
        type: String,
        required: true,
        lowercase: true
    },
    phone: {
        type: String,
        trim: true,
        match: [ /^[+][0-9]{2} [0-9]{3} [0-9]{4} [0-9]{3}$/ ,"User the formart +xx xxx xxxx xxx "],
        required: [true, 'User phone number required']
    },
    email: {
        type: String,
        trim: true,
        lowercase: true,
        unique: true,
        required:[true, 'Email address is required'],
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address']

    },
    password : {
        type: String,
        required: [true, 'Password is required']
    },
    loc : {
        type : {
            type :String
        },
        coordinates : { type: [ Number ] }
    },
    bloodGroup: BloodGroup.bloodGroupSchema,
    data: {
        lastDonationTime: {
            type: Number
        }
    }
};


var schema = new mongoose.Schema(donorSchema);


// schema.index({firstName: 'text'});
schema.index({lastName: 'text'});
schema.index({'loc.coordinates': 1});

schema.set('toObject', {virtuals: true});
schema.set('toJSON', {virtuals: true});

module.exports = schema;
module.exports.donorSchema = donorSchema;
