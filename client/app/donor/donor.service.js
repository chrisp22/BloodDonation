'use strict';

angular.module('bloodDonationApp')
  .factory('Donors', function ($http) {

    /**
     * Gets all Donors within the specified map extent
     * 
     * @param {{longitude: number, latitude: number}} coords - The center coordinates
     * @param {number} maxDist - The maxmum distance
     * @returns {Promise.<Donor[], Error>} A promise that returns Donor[] if resolved,
     *    or an Error if rejected
     */
    function getDonorsWithinExtent(coords, maxDist) {
      coords = coords || { longitude: 0.0, latitude: 0.0};
      maxDist = maxDist || 1000;
      var locSearchParam = {
        location: {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: [coords.longitude, coords.latitude]
            },
            $maxDistance: maxDist
          }
        }
      };
      return $http.get('api/donors', {
        params: {
          query: locSearchParam
        }
      });
    }

    /**
     * Gets the Donor matching the id specified
     * 
     * @param {string} donorId - The id of the Donor to be fetched
     * @returns {Promise.<Donor, Error>} A promise that returns Donor if resolved,
     *    or an Error if rejected
     */
    function getDonor(donorId) {
      return $http.get('/api/donors/' + donorId);
    }

    /**
     * Creates a new Donor to its collection
     * 
     * @param {Donor} donor - The Donor object to be created
     * @returns {Promise.<Donor, Error>} A promise that returns the new Donor if resolved,
     *    or an Error if rejected
     */
    function createDonor(donor) {
      return $http.post('/api/donors', donor);
    }

    /**
     * Updates the Donor with the given id from its collection
     * 
     * @param {Donor} donor - The Donor to be updated
     * @returns {Promise.<Donor, Error>} A promise that returns the updated Donor if resolved,
     *    or an Error if rejected
     */
    function updateDonor(donor) {
      return $http.put('/api/donors/' + donor._id, donor);
    }

    /**
     * Removes the Donor matching the given id from its collection
     * 
     * @param {string} donorId - the id of the Donor to be deleted
     * @returns {Promise.<Donor, Error>} A promise that returns the deleted Donor if resolved,
     *    or an Error if rejected
     */
    function removeDonor(donorId) {
      return $http.delete('/api/donors/' + donorId);
    }

    // Public API here
    return {
      getWithinBox: getDonorsWithinExtent,
      get: getDonor,
      create: createDonor,
      update: updateDonor,
      remove: removeDonor
    };
  });
