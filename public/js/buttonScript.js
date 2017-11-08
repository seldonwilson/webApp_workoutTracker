/*******************************************************************************
* Filename: buttonScript.js                                                    *
* Author:   Daniel Wilson                                                      *
* E-mail:   wilsond3@oregonstate.edu                                           *
* Date:     9 August 2017                                                      *
*                                                                              *
* Description: Implements all the functionality of the buttons on the home     *
*    page. When the user interacts with these buttons, the displayed table will*
*    dynamically be changed through DOM manipulation and when the page is      *
*    refreshed, the table will still look the same but those DOM nodes will    *
*    instead be populated directly from the database.                          *
*                                                                              *
*******************************************************************************/

   // When the DOM tree is loaded, add listeners on all buttons
document.addEventListener("DOMContentLoaded", function() {
   var currentID = 1;
   var allDeleteButtons  = document.querySelectorAll(".delete");
   var allEditButtons    = document.querySelectorAll(".edit");
   var addExerciseButton = document.getElementById("addExercise");

   for (var i = 0; i < allDeleteButtons.length; ++i)
      allDeleteButtons[i].addEventListener("click", deleteRow);

   for (var i = 0; i < allEditButtons.length; ++i)
      allEditButtons[i].addEventListener("click", editRow);

   addExerciseButton.addEventListener("click", addExercise);
});


/*******************************************************************************
* Function Name: editRow                                                       *
*                                                                              *
* Function Type: GET request and page redirect                                 *
*                                                                              *
*   Description: Function to be called when the edit button is click on a data *
*                entry row. Clicking the button sends the user to another URL  *
*                where they can edit the data entry.                           *
*                                                                              *
*  Inputs: event - firing input                                                *
*******************************************************************************/
function editRow(event) {
   var clickedButton = event.target;
   var rowToEdit     = clickedButton.parentElement.parentElement;
   var queryString   = "?id=" + rowToEdit.id;

   var req  = new XMLHttpRequest();
   req.open("GET", "/edit" + queryString, true);

   req.addEventListener("load", function() {
      if (req.status >= 200 && req.status < 400) {
         rowToEdit.remove();
         window.location.href = "/edit" + queryString;
      }
      else 
         console.log("Error in network request: " + req.statusText);
   });

   req.send(null);
}


/*******************************************************************************
* Function Name: addExercise                                                   *
*                                                                              *
* Function Type: GET request and DOM manipulation (add <tr> nodes)             *
*                                                                              *
*   Description: Function to be called when the "Add Exercise" button is       *
*                clicked. This function dynamically adds the new exercise to   *
*                the table displayed on the page, unless it has not name, then *
*                it's not added at all. If the exercises it added, it's also   *
*                added to the database. New row elements have listeners applied*
*                to their buttons on creation.                                 *
*                                                                              *
*  Inputs: event - firing input                                                *
*******************************************************************************/
function addExercise(event) {
   event.preventDefault();

   var name = document.getElementById("exerciseName").value;

      // If user didn't supply an exercise name, don't add it to database   
   if (name === "")
      return;

    var allDataRows = document.querySelectorAll("tr");

    if (allDataRows.length == 1)
    	currentID = 1;
    else {
    	var lastRow = allDataRows[allDataRows.length - 1];
    	currentID = Number(lastRow.id) + 1;
    }

    var weight = document.getElementById("exerciseWeight").value;
    var units  = document.getElementById("exerciseUnits").value;
    var reps   = document.getElementById("exerciseReps").value;
    var date   = document.getElementById("exerciseDate").value;

    if (weight != "")
       weight = Math.round(weight);

    var queryString = "?name="   + name   + 
                      "&weight=" + weight + 
                      "&units="  + units  + 
                      "&reps="   + reps   +
                      "&date="   + date;

    var req  = new XMLHttpRequest();
    req.open("GET", "/insert" + queryString, true);

    req.addEventListener("load", function() {
       if (req.status >= 200 && req.status < 400) {
          var table      = document.getElementById("exerciseTable");
          var newRow     = document.createElement("tr");
          newRow.id = currentID++;

          var nameData   = document.createElement("td");
          var weightData = document.createElement("td");
          var unitData   = document.createElement("td");
          var repsData   = document.createElement("td");
          var dateData   = document.createElement("td");
          var edit       = document.createElement("td");
          var remove     = document.createElement("td");

          var editButton = document.createElement("input");
          editButton.type = "button";
          editButton.value = "Edit";
          editButton.className = "edit";
          edit.appendChild(editButton);

          var removeButton = document.createElement("input");
          removeButton.type = "button";
          removeButton.value = "Delete";
          removeButton.className = "delete";
          remove.appendChild(removeButton);
          
          nameData.textContent   = name;
          dateData.textContent   = (date === "" ? "0000-00-00" : date);
          weightData.textContent = (weight === "" ? "–" : weight);
          unitData.textContent   = (units === "1" ? "lbs" : "kgs");
          repsData.textContent   = (reps === "" ? "–" : reps);

          newRow.appendChild(dateData);
          newRow.appendChild(nameData);
          newRow.appendChild(weightData);
          newRow.appendChild(unitData);
          newRow.appendChild(repsData);
          newRow.appendChild(edit);
          newRow.appendChild(remove);

          table.appendChild(newRow);

          removeButton.addEventListener("click", deleteRow);
          editButton.addEventListener("click", editRow);
       }
       else 
          console.log("Error in network request: " + req.statusText);
    });

    req.send(null)
}


/*******************************************************************************
* Function Name: deleteRow                                                     *
*                                                                              *
* Function Type: GET request and DOM manipulation (add <tr> nodes)             *
*                                                                              *
*   Description: Function to be called when the "Delete" button is clicked.    *
*                When the function is called, the <tr> element is removed and  *
*                the corresponding item is removed from the database.          *
*                                                                              *
*  Inputs: event - firing input                                                *
*******************************************************************************/
function deleteRow(event) {
   var clickedButton = event.target;
   var rowToDelete   = clickedButton.parentElement.parentElement;
   var idToDelete    = rowToDelete.id;
   var rowIndex      = rowToDelete.index;

   var queryString = "?id=" + idToDelete;

   var req  = new XMLHttpRequest();
   req.open("GET", "/delete" + queryString, true);

   req.addEventListener("load", function() {
      if (req.status >= 200 && req.status < 400)
         rowToDelete.remove();
      else
         console.log("Error in network request: " + req.statusText);
   });

   req.send(null);
}