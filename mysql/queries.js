/*
COMP206 Assignment2 due by Dec.11, 2022
Author: Yanan Liu
This is query.js will has defined all the queries functions that the server will call.
The query result will be exported to server.
*/


const mysql = require("./config.js");

//find one result
function findListing(criteria) {
 // add in a condensed if statement so that I can get all the amenities when user doesn't make an option
    let query =  `SELECT A.*, B.name as cityName, C.name as stateName, D.first_name, D.last_name, D.email
    FROM places A
    JOIN cities B on A.city_id = B.id
    JOIN states C on C.id = B.state_id
    JOIN users D ON A.user_id = D.id
    WHERE A.id IN (
    SELECT place_id FROM place_amenity${criteria.amenitiesLength >0 ?' WHERE amenity_id IN(?)':''}       
    GROUP BY place_id
    HAVING count(place_id) >= ?
)
AND A.number_rooms >= ?
And A.max_guest <= ? 
AND A.price_by_night <=?
LIMIT 1`;

//this is to check if the user doesn't check any option
//if the user doesn't check any option, the criteria.amenitiesLength will not be sent into the query
if(criteria.amenitiesLength >0)
    {
        let safeQuery = mysql.functions.format(query, [criteria.amenities, criteria.amenitiesLength, criteria.number_rooms, criteria.guests, criteria.price_by_night]);
        return querySql(safeQuery);
    }
else
    {
        let safeQuery = mysql.functions.format(query, [ criteria.amenitiesLength, criteria.number_rooms, criteria.guests,criteria.price_by_night]);
        return querySql(safeQuery);
    }
}

//query all the states
function findStatesList() {
    let query = `SELECT * FROM states`;
    return querySql(query);
}

//query all the cities
function findCitiesList() {
    let query = `SELECT * FROM cities`;
    return querySql(query);
}

//query to filter the cityList based on the selected state
function findStatesCityList(criteria) {
    let query = `SELECT * FROM cities where state_id = ?`;
    let safeQuery = mysql.functions.format(query, [criteria]);
    return querySql(safeQuery);
}

// list all the matched result based on user's choice (in listing-many page)
function findListings(criteria) {
    let selectQuery = `SELECT A.*, B.name as cityName, C.name as stateName FROM places A
        JOIN cities B ON A.city_id = B.id
        JOIN states C on B.state_id = C.id
        WHERE number_rooms >= ? AND A.city_id = ?`;
    let safeQuery = mysql.functions.format(selectQuery, [criteria.number_rooms, criteria.cities]);
    return querySql(safeQuery);
}

//query to get the place's information (in listing-many page)
function findPlace(criteria) {
    let query = `SELECT A.*, C.name as amenitiesName, D.first_name, D.last_name, D.email, E.name as cityName, F.name as stateName FROM places A
    JOIN users D on A.user_id  = D.id
    JOIN cities E on A.city_id = E.id
    JOIN states F on F.id = E.state_id
    JOIN place_amenity B on A.id = B.place_id
    left outer JOIN amenities C on B.amenity_id = C.id where A.id = ?;`;

    let safeQuery = mysql.functions.format(query, [criteria]);
    return querySql(safeQuery);
}

//find amenities for selected place (in listing-many page)
function findAmenities(placeId){
    let query = `SELECT A.name FROM amenities A join place_amenity B on A.id = B.amenity_id where B.place_id = ?`;
    let safeQuery = mysql.functions.format(query, [placeId]);
    return querySql(safeQuery);
}

//export all the result to server
module.exports = {
    "findListing": findListing,
    "findListings": findListings,
    "findStatesList": findStatesList,
    "findCitiesList": findCitiesList,
    "findStatesCityList": findStatesCityList,
    "findAmenities":findAmenities,
    "findPlace": findPlace
};


/*****************************************************************
 *        You can ignore everything below here!
 *****************************************************************/

// don't worry too much about this function! 
// it has been written to return the data from your database query
// *** it DOES NOT need modifying! ***
function querySql(sql) {
    let con = mysql.getCon();

    con.connect(function (error) {
        if (error) {
            return console.error(error);
        }
    });

    return new Promise((resolve, reject) => {
        con.query(sql, (error, sqlResult) => {
            if (error) {
                return reject(error);
            }

            return resolve(sqlResult);
        });

        con.end();
    });
}