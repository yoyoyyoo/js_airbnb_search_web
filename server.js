/*
COMP206 Assignment2 due by Dec.11, 2022
Author: Yanan Liu
This assignment is to create a Node.js web application that queries a MySQL Airbnb
database, allowing users to find listings by entering search criteria via the user interface. 
Result will be passed through different ejs template file.
*/

const express = require('express');
const app = express();
const queries = require("./mysql/queries");

app.set('view engine', 'ejs');
app.listen(3000);

//http://localhost:3000/
app.get('/', function (request, response) {
  //get the city and state result by using the function written in queries.js
  let stateList = queries.findStatesList();
  let citiesList = queries.findCitiesList();
 
  //render all the results to index.ejs
  Promise.all([stateList, citiesList]).then(result => {
        response.render("index", { "stateResult": result[0], "cityResult": result[1], title: 'Airbnb Search App' });
    });
});

//Listing one result
app.get('/airbnb/find-one', async (request, response) => {
  //create new objects to get the filter elements for query
     let number_rooms = request.query.bedrooms;
     let amenitiesList = request.query.amenities;
     let nubmer_guests= request.query.guests;
     let max_price = request.query.price;
  //set amenitiesLength to 0, check if the amenities is empty; 
  //if not, the length will be assigned with the user's choice, otherwist, it will stay as 0
     let amenitiesLength = 0;
     if( amenitiesList )
          amenitiesLength = amenitiesList.length;
  
  //call the findListing function in queries.js
  //use async and await to avoid using nested promise
     let listResult = await queries.findListing(
   {
    "amenities": amenitiesList,
    "amenitiesLength": amenitiesLength,
    "number_rooms": number_rooms,
    "guests":nubmer_guests,
    "price_by_night":max_price    
       }).then(result => {
       return result[0];
     });

  //use await because I need to use the amenitiesResult as a criteria 
  //to filter the listResult I want to send to listing.ejs
  //if the user doesn't check any amenity option, the amenitiesResult will be 0;
  //otherwise, call the findAmenties query to get the requested result
     let amenitiesResult=0;
     if(listResult)
        amenitiesResult = await queries.findAmenities(listResult.id);

  //render out the result to listing.ejs   
     response.render("listing", { listing: listResult , amenitiesResult:amenitiesResult});
});

//list many
app.get("/airbnb/find-many", async (request, response) => {

  //create objects to get the filter elements
  let number_rooms = request.query.bedrooms;
  let selectedCity = request.query.cities;

  //call the findListings query to get the result
  queries.findListings(
    {
     "number_rooms": number_rooms,
     "cities":selectedCity
        }).then(result => {
  //render out the result to listings.ejs
        response.render("listings", { listings: result });
      });
  
});

//get one place's details for find-many
app.get('/selectPlace/:place', (request, response) => {

//get the filter element
  let currentPlace = request.params.place;

//call the findPlace query to get the result
  queries.findPlace(currentPlace).then(result =>{
  
//render out to airbnb.ejs
  response.render('airbnb', { title: 'AirBnb', "listing": result    });
});
});

