/**
 * Created by chrisp on 24/08/2016.
 */
'use strict'
var wagner = require('wagner-core');
var mongoose = require('mongoose');
var _ = require('underscore');

module.exports = ()=> {
    mongoose.connect('mongodb://localhost:27017/blood');

    wagner.factory('db', ()=>{return mongoose;});
    var Donor = mongoose.model('Donor', require('./donor'), 'Donor');
    var BloodGroup = mongoose.model('BloodGroup', require('./bloodgroup'), 'BloodGroup');
    // var Location = mongoose.model('Location', require('./location'), 'Location');

    var models =
    {
        Donor : Donor,
        BloodGroup : BloodGroup,
        // Location : Location
    };

    _.each(models, (value, key)=> {
        wagner.factory(key, ()=> {
            return value;
        });
    });

    return models;
};


