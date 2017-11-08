/*******************************************************************************
* Filename: final.js                                                           *
* Author:   Daniel Wilson                                                      *
* E-mail:   wilsond3@oregonstate.edu                                           *
* Date:     6 August 2017                                                      *
*                                                                              *
* Description: Implements a single-page web application which is intended to be*
*    used as a workout journal. The page will display a list of workout        *
*    routines, along with related information, in a tabular form and allow the *
*    user to edit, add, and delete items from the table using asynchronous     *
*    JavaScript calls which allow the results to be shown without a page       *
*    refresh. This application will persist even after the user logs out, so it*
*    will be an interface to a MySQL database, as opposed to keeping data local*
*    in some cookies using sessions.                                           *
*                                                                              *
*******************************************************************************/

var express    = require('express');
var app        = express();
var mysql      = require('./dbcon.js');
var handlebars = require('express-handlebars').create({defaultLayout:'main'});

app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');
app.set('port', /*PRIVATE*/);
app.use(express.static('public'));


/*******************************************************************************
******************************* ROUTE DEFINITIONS ******************************
*******************************************************************************/

/*******************************************************************************
* Route Address: "/"                                                           *
*  Request Type: GET                                                           *
*                                                                              *
*   Description: Loads all previous entries from the workout database for the  *
*                user and displays all those entires in a formatted table.     *
*                At the top of the page is a form to add a new entry into the  *
*                database and will update the table without a page refresh.    *
*                Alongside each of the table rows, will be buttons that allow  *
*                the user to edit or delete each entry.                        *
*******************************************************************************/
app.get('/',function(req, res, next) {
   var context = {};
   var exerciseInfo = [];

   context.script = '<script src="js/buttonScript.js"></script>';
   context.css =    '<link rel="stylesheet" href="css/table.css">';

   mysql.pool.query('SELECT * FROM workouts', function(err, rows, fields) {
      if(err){
         next(err);
         return;
      }

      rows.forEach(function(currentEntry) {
         var weight = (currentEntry.weight === 0 ? "–"   : currentEntry.weight);
         var reps   = (currentEntry.reps   === 0 ? "–"   : currentEntry.reps);
         var units  = (currentEntry.lbs    === 0 ? "kgs" : "lbs");

         exerciseInfo.push({"id"   : currentEntry.id,   "weight": weight,
                            "date" : currentEntry.date, "units" : units,
                            "name" : currentEntry.name, "reps"  : reps});
      });

      context.exercises = exerciseInfo;
      res.render('workoutTracker', context);
   });
});


/*******************************************************************************
* Route Address: "/insert"                                                     *
*  Request Type: GET                                                           *
*                                                                              *
*   Description: Takes a query string (requires a name) and uses that data to  *
*                create a new entry in our database.                           *
*                                                                              *
* Credit: Modified from  CS290 lecture examples                                *
*******************************************************************************/
app.get('/insert',function(req, res, next){
  var context  = {};
  var columns  = "(name, weight, lbs, reps, date)";
  var values   = "(?, ?, ?, ?, ?)";
  var reqArray = [req.query.name, req.query.weight, req.query.units, 
                  req.query.reps, req.query.date];

  mysql.pool.query("INSERT INTO workouts " + columns + " VALUES " + values,
                   reqArray, function(err, result) {
     if (err) {
        next(err);
        return;
     }

        /* Despite not actually wanting to go to this page, the homepage will
           not dynamically update its HTML with a render call here, I'm unsure
           why. Further research needed...
        */
     res.render("insert", context);
   });
});


/*******************************************************************************
* Route Address: "/edit"                                                       *
*  Request Type: GET                                                           *
*                                                                              *
*   Description: Takes a query string (requires an id) and uses that data to   *
*                load a page with a pre-filled form of that id's database      *
*                contents and allows the user to update the values.            *
*                                                                              *
* Credit: Modified from  CS290 lecture examples                                *
*******************************************************************************/
app.get('/edit', function(req, res, next) {
   var context = {};
   context.script = '<script src="js/editScript.js"></script>';

   mysql.pool.query("SELECT * FROM workouts WHERE id=?", [req.query.id],
                    function(err, result) {
      if (err) {
         next(err);
         return;
      }

         // Pre-fills out form with data from given id entry in database
      context.name   = result[0].name;
      context.weight = result[0].weight;
      context.reps   = result[0].reps;
      context.id     = result[0].id;
      context.date   = (result[0].date === "" ? "0000-00-00" : result[0].date);
      
      if (result[0].lbs === 1)
         context.isPounds = true;

      res.render("edit", context);
   });
});


/*******************************************************************************
* Route Address: "/reset-table"                                                *
*  Request Type: GET                                                           *
*                                                                              *
*   Description: Removes all entries from the database when the user goes to   *
*                this URL. This is understood to be poor practice in a         *
*                professional setting.                                         *
*                                                                              *
* Credit: Modified from  CS290 lecture examples                                *
*******************************************************************************/
app.get('/reset-table',function(req, res, next) {
   mysql.pool.query("DROP TABLE IF EXISTS workouts", function(err) {
      var createString = "CREATE TABLE workouts("                 +
                         "id     INT PRIMARY KEY AUTO_INCREMENT," +
                         "name   VARCHAR(255) NOT NULL,"          +
                         "reps   INT,"                            +
                         "weight INT,"                            +
                         "date   DATE,"                           +
                         "lbs    BOOLEAN)";

      mysql.pool.query(createString, function(err) {
         res.render('home');
      });
   });
});


/*******************************************************************************
* Route Address: "/delete"                                                     *
*  Request Type: GET                                                           *
*                                                                              *
*   Description: Takes a query string (requires an id) and uses that data to   *
*                remove an existing entry from our database.                   *
*                                                                              *
* Credit: Modified from  CS290 lecture examples                                *
*******************************************************************************/
app.get('/delete',function(req, res, next) {
   mysql.pool.query("DELETE FROM workouts WHERE id=?", [req.query.id],
                    function(err, result) {
      if(err){
         next(err);
         return;
      }

      res.render('delete');
  });
});


/*******************************************************************************
* Route Address: "/safe-update"                                                *
*  Request Type: GET                                                           *
*                                                                              *
*   Description: Takes a query string (requires an id) and uses that data to   *
*                load a page with a pre-filled form of that id's database      *
*                contents and allows the user to update the values.            *
*                                                                              *
* Credit: Modified from  CS290 lecture examples                                *
*******************************************************************************/
app.get('/safe-update',function(req, res, next) {
   mysql.pool.query("SELECT * FROM workouts WHERE id=?", [req.query.id],
                    function(err, result){
      if(err) {
         next(err);
         return;
      }

      if(result.length == 1) {
         var curVals       = result[0];
         var updateThese   = "name=?, reps=?, weight=?, date=?, lbs=?";
         var updatedValues = [req.query.name   || curVals.name, 
                              req.query.reps   || curVals.reps, 
                              req.query.weight || curVals.weight, 
                              req.query.date   || curVals.date, 
                              req.query.lbs    || curVals.lbs, 
                              req.query.id];

         mysql.pool.query("UPDATE workouts SET " + updateThese + " WHERE id=?",
                          updatedValues, function(err, result) {
            if (err) {
               next(err);
               return;
            }

            res.render('insert');
         });
      }
   });
});


/*******************************************************************************
********************************* ERROR HANDLING *******************************
*******************************************************************************/

/*******************************************************************************
* Error Number: 404                                                            *
*   Error Type: Not Found                                                      *
*                                                                              *
*   Description: Takes the user to a predefined error 404 page.                *
*                                                                              *
* Credit: Taken from  CS290 lecture examples                                   *
*******************************************************************************/
app.use(function(req, res){
   res.status(404);
   res.render('404');
});


/*******************************************************************************
* Error Number: 500                                                            *
*   Error Type: Internal Server Error                                          *
*                                                                              *
*   Description: Takes the user to a predefined error 500 page.                *
*                                                                              *
* Credit: Taken from  CS290 lecture examples                                   *
*******************************************************************************/
app.use(function(err, req, res, next){
   console.error(err.stack);
   res.status(500);
   res.render('500');
});


   // Sets up the server to listen in for traffic on the preset port
app.listen(app.get('port'), function(){
   console.log('Express started on http://localhost:' + app.get('port') +
               '; press Ctrl-C to terminate.');
});