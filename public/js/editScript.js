/*******************************************************************************
* Filename: editScript.js                                                      *
* Author:   Daniel Wilson                                                      *
* E-mail:   wilsond3@oregonstate.edu                                           *
* Date:     9 August 2017                                                      *
*                                                                              *
* Description: Provides the definition for the function that will be called    *
*    when the user clicks on the button to update the content of a given data  *
*	 entry when they're on the /edit page.                                      *
*                                                                              *
*******************************************************************************/

document.addEventListener("DOMContentLoaded", function() {
   var editButton = document.getElementsByName("updateExercise")[0];
   
   editButton.addEventListener("click", function(event) {
      var id     = event.target.id;
      var name   = document.getElementById("exerciseName").value;
      var weight = document.getElementById("exerciseWeight").value;
      var reps   = document.getElementById("exerciseReps").value;
      var date   = document.getElementById("exerciseDate").value;
      var lbs    = document.getElementById("exerciseUnits").value;
   
      var queryString = "?id="     + id     + "&name=" + name +
                        "&weight=" + weight + "&reps=" + reps +
                        "&date="   + date   + "&lbs="  + lbs;

      var req = new XMLHttpRequest();
      req.open("GET", "/safe-update" + queryString, true);

      req.addEventListener("load", function() {
         if (req.status >= 200 && req.status < 400)
            window.location.href = "/";
         else
            console.log("Error in network request: " + req.statusText);
      });

      req.send(null);
   });
});
