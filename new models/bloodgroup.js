/**
 * Created by chrisp on 29/08/2016.
 */
/**
 * Created by chrisp on 23/08/2016.
 */

var mongoose = require('mongoose');
var bloodGrouplist = ['A+', 'B+', 'AB+', 'O+', 'A-', 'B-', 'AB-', 'O-'];

var bloodGroupSchema = {

    _id: {
        type: String,
        required : true,
        enum: bloodGrouplist
    },

    bloodType: {
        type: String,
        required: true
    },
    canDonateTo: [
        {
            type: String,
            required: true,
            enum: bloodGrouplist
        }
    ],
    canRecieveFrom: [
        {
            type: String,
            required: true,
            enum: bloodGrouplist
        }
    ],
    antigens: {
        type: String,
        required: true,
    },
    antibodies: {
        type: String,
        required: true,
    }
};


var schema = new mongoose.Schema(bloodGroupSchema);


schema.index({bloodType: 'text'});
schema.index({canDonateTo: 1});
schema.index({canRecieveFrom: 1});

schema.set('toObject', {virtuals: true});
schema.set('toJSON', {virtuals: true});

module.exports = schema;
module.exports.bloodGroupSchema = bloodGroupSchema;
