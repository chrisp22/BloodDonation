/**
 * Donor model events
 */

'use strict';

import {EventEmitter} from 'events';
import Donor from './donor.model';
var DonorEvents = new EventEmitter();

// Set max event listeners (0 == unlimited)
DonorEvents.setMaxListeners(0);

// Model events
var events = {
  'save': 'save',
  'remove': 'remove'
};

// Register the event emitter to the model events
for (var e in events) {
  var event = events[e];
  Donor.schema.post(e, emitEvent(event));
}

function emitEvent(event) {
  return function(doc) {
    DonorEvents.emit(event + ':' + doc._id, doc);
    DonorEvents.emit(event, doc);
  }
}

export default DonorEvents;
