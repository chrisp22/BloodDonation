/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /api/donors              ->  index
 * POST    /api/donors              ->  create
 * GET     /api/donors/:id          ->  show
 * PUT     /api/donors/:id          ->  update
 * DELETE  /api/donors/:id          ->  destroy
 */

'use strict';

import _ from 'lodash';
import Donor from './donor.model';

function respondWithResult(res, statusCode) {
  statusCode = statusCode || 200;
  return function(entity) {
    if (entity) {
      res.status(statusCode).json(entity);
    }
  };
}

function saveUpdates(updates) {
  return function(entity) {
    var updated = _.merge(entity, updates);
    return updated.save()
      .then(updated => {
        return updated;
      });
  };
}

function removeEntity(res) {
  return function(entity) {
    if (entity) {
      return entity.remove()
        .then(() => {
          res.status(204).end();
        });
    }
  };
}

function handleEntityNotFound(res) {
  return function(entity) {
    if (!entity) {
      res.status(404).end();
      return null;
    }
    return entity;
  };
}

function handleError(res, statusCode) {
  statusCode = statusCode || 500;
  return function(err) {
    res.status(statusCode).send(err);
  };
}

// Gets a list of Donors
export function index(req, res) {
  var query = (req.query.query) ? JSON.parse(req.query.query) : {};
  return Donor.find(query).exec()
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Gets a single Donor from the DB
export function show(req, res) {
  return Donor.findById(req.params.id).exec()
    .then(handleEntityNotFound(res))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Creates a new Donor in the DB
export function create(req, res) {
  return Donor.create(req.body)
    .then(respondWithResult(res, 201))
    .catch(handleError(res, 422));
}

// Updates an existing Donor in the DB
export function update(req, res) {
  if (req.body._id) {
    delete req.body._id;
  }
  return Donor.findById(req.params.id).exec()
    .then(handleEntityNotFound(res))
    .then(saveUpdates(req.body))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Deletes a Donor from the DB
export function destroy(req, res) {
  return Donor.findById(req.params.id).exec()
    .then(handleEntityNotFound(res))
    .then(removeEntity(res))
    .catch(handleError(res));
}
