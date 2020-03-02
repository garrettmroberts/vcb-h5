// Only runs once document is fully loaded
$(document).ready(function() {

  // Sets date and time in planner landing
  $("#dayPlaceholder").text(moment().format("MMM Do YYYY"));
  $("#timePlaceholder").text(moment().format("LT"));

  // Initializes form table when page loads
  buildTable();

  // Processes the Edit Button
  $("button").on("click", $("button"), function(event) {
    var toDoArea = $(this).parent().prev().children(); // Returns adjacent ToDo section

    // Updates screen with user input if valid
    if (toDoArea.last().attr("data-is-editing") === "true") {
      var userInput = toDoArea.last().val();
      if (userInput !== "") {
        toDoArea.first().text(userInput)
        toDoArea.last().attr("data-is-editing", "false").addClass("d-none");
        var time = toDoArea.parent().parent().attr("id");
        setUserData(time, userInput);
      }
    
    // Otherwise, brings back edit bar .
    } else {
      toDoArea.last().removeClass("d-none").attr("data-is-editing", "true");
    };
  });

  // Builds out Table
  function buildTable() {
    var planner = $("#planner");
    for (var i = 6; i < 21; i++) {
      
      // Create elements for each hour
      var row = $("<tr>").addClass("dataRow")
      var time = $("<td>")
      var toDos = $("<td>");
      var updateButton = $("<td>");

      // Sets Row IDs
      if (i < 10) {
        row.attr("id", "0" + i);
      } else {
        row.attr("id", i);
      }

      // Formats Time Slots
      if (i < 12) {
        time.text(i + ":00 AM")
      } else if (i > 12) {
        time.text((i % 12) + ":00 PM");
      } else {
        time.text(i + ":00 PM");
      };
      
      // Formats toDo portion
      toDos.append($("<div>")).addClass("todoListItems");
      toDos.append($("<input>").attr({ "type": "text", "class": "form-control", "data-is-editing": true,}));

      // Formats updateButton
      var button = $("<button>").attr({"type": "submit", "class": "btn btn-primary", "id": i }).text("Edit ");
      var buttonText =$("<i>").attr("class", "fa fa-edit fa-lg");
      button.append(buttonText);
      updateButton.append(button);

      // Completes row and appends to table
      row.append(time);
      row.append(toDos);
      row.append(updateButton);
      planner.append(row);

    }
    setRowColors();
    updateWithUserData();
  };

  // Sets row color based on time of day
  function setRowColors() {
    var currentHour = moment().format("H");
    var rows = $(".dataRow");
    rows.each(function() {
      var rowID = $(this).attr("id");
        if (rowID < parseInt(currentHour)) {
          $(this).addClass("table-danger");
        } else if (rowID > parseInt(currentHour)) {
          $(this).addClass("table-success");
        } else {
          $(this).addClass("table-primary");
        }
    })
  }

  // Updates JSON object with new toDos
  function setUserData(time, userInput) {

    // retrieves savedData Array
    var oldArr = JSON.parse(localStorage.getItem("savedData")) || [];
    

    // Erases old versions of timeslot/toDo
    oldArr.forEach(function(arrItem, index) {
      if (arrItem.timeSlot === time) {
          oldArr.splice(index, 1);
      };
    })

    // Prepares date str for new KeyValObj
    var today = moment().format("MM DD YYYY");
    var day = today.slice(3, 5);
    
    // Creates new key/val pair
    var keyValObj = {
      eventName: userInput,
      timeSlot: time,
      date: day
    };
    // Pushes event to savedData
    oldArr.push(keyValObj)

    // Sorts elements by timeSlot value
    oldArr.sort((a, b) => parseFloat(a.timeSlot) - parseFloat(b.timeSlot));

    // Saves updated array to local storage
    localStorage.setItem("savedData", JSON.stringify(oldArr))
  }

  // Populates planner with previously saved data
  function updateWithUserData() {
    var savedEvents = JSON.parse(localStorage.getItem("savedData"));

    // Checks if anything is saved in local storage.  Only runs if there is.
    if (savedEvents !== null) {
      console.log(savedEvents[0].date)
      // Clears localStorage if a new day has begun.
      if (savedEvents[0].date < moment().format(DD)) {
        localStorage.clear();
        return;
      }
      // Checks each dataRow against local storage.
      var rows = $(".dataRow")
      rows.each(function() {
        var thisIndex = $(this).attr("id");
        var todoArea = $(this).children(".todoListItems").children().first();
        var inputArea = $(this).children(".todoListItems").children().last();
        savedEvents.forEach(function(savedEvent) {
          
          // Updates UI if local storage matches timeslot.
          if (savedEvent.timeSlot === thisIndex) {
            todoArea.text(savedEvent.eventName);
            inputArea.addClass("d-none").attr("data-is-editing", "false");
          };  
        });
      });
    };
  };
});