# Blood Donor Finder

A single page blood donation management system to facilitate the patients from all around the world, find
blood donors near them.

Demo version: [Heroku](https://blood-donor-finder.herokuapp.com)

## Features

- Main page
    + loads a map showing available donors in the area as pins
    + clicking a pin shows a popup displaying the donor's information
    + pins are lazy loaded, only those in the visible area are loaded
- Donor page
    + loads a map showing a single pin indicating the donor's location
    + a signup form will show up when the pin is clicked
    + on submitting the form, a unique private link will be shown along with a success message
    + this unique link can be used to show, modify or delete his/her information
    + changes are applied real time
    + the pins's location can be change by searching a location through the search box or pressing the locate widget

## Technical Information

- Generated with the [Angular Full-Stack Generator](https://github.com/DaftMonk/generator-angular-fullstack) version 3.7.5
- APIs:
    + [ArcGIS for JavaScript](https://developers.arcgis.com/javascript/) version 4.0
    + [Socket.IO](http://socket.io/) version 1.3.5
