
const dataObject = {};
const savedData = JSON.parse(localStorage.getItem("dataObject"));

if(!!savedData) {
  const {...savedData} = dataObject;
}

const $section = $('#calorie-logs-section');
const $addFood = $("#calorie-form button");

const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];


// ADDING A NEW FOOD ITEM
$addFood.on("click", function(event) {
  event.preventDefault();

  const $date = $('#date').val();

  // CREATE THE DAY IF IT IS THE FIRST LOG OF THE DAY
  if($section.children(`#${$date}`).length < 1) {
    daysFirstLog($date);
  }

  // FEED THE DATA-OBJECT
  const logObj = {
    food: `${$('#food').val()}`,
    weight: `${$('#weight').val()}`,
    unitCalorie: `${$('#calorie').val()}`
  }
  logObj.calories = (+logObj.weight) * (+logObj.unitCalorie) / 100;
  const logsArr = dataObject[`${$date}`].logs;
  logsArr.push(logObj);
  const rowNum = logsArr.length;

  // CHECK IF ALL INPUTS ARE FILLED
  if (Object.values(logObj).some( el => !el) || !$date) {
    alert("THERE IS AT LEAST ONE INPUT MISSING!!!");
    return;
  }

  // ADDING THE NEW FOOD LOG
  const $th = $('<th>').attr('scope', 'row').text(rowNum);
  const $td1 = $('<td>').text(logObj.food);
  const $td2 = $('<td>').text(Math.round(logObj.weight));
  const $td3 = $('<td>').text(Math.round(logObj.unitCalorie));
  const $td4 = $('<td>').text(Math.round(logObj.calories));
  const $td5 = $('<td>').append(deleteButton('delete-log'));
  const $tr = $('<tr>').append($th).append($td1).append($td2).append($td3).append($td4).append($td5);

  $(`#${$date} tbody`).append($tr);

  // CALORIE INTAKE & DIFFERENCE CALCULATION
  const o = dataObject[`${$date}`];
  o.intake = (+o.intake) + logObj.calories;
  o.difference = (+o.difference) - logObj.calories;
  $(`#${$date} .intake`).text(Math.round(o.intake));
  $(`#${$date} .difference`).text(Math.round(o.difference));

  localStorage.setItem("dataObject", JSON.stringify(dataObject));

});


// DELETE THE DAY
$section.on('click', '.delete-day', function(event) {
  const $dayDiv = $(event.target).closest('.day-div');
  const res = confirm("DO YOU CONFIRM TO DELETE THE DAY?");
  if (res) {
    const date = $dayDiv.attr("id");

    // delete the dayObj
    delete dataObject.date;

    // delete the day in the DOM
    $dayDiv.remove();

    localStorage.setItem("dataObject", JSON.stringify(dataObject));
  }
});


// DELETE ONE LOG
$section.on('click', '.delete-log', function(event) {

  const $tr = $(event.target).closest('tr');   // row to delete
  const $dayDiv = $(event.target).closest('.day-div');  // get date id
  const rowNum = +$tr.find("th").text();   // row #

  const date = $dayDiv.attr("id");

  // pick dayObj with date

  const dayObj = dataObject[`${date}`];
  const calories = dayObj.logs[rowNum - 1].calories;
  dayObj.intake -= calories;
  dayObj.difference += calories;

  // write the updates to the DOM
  $dayDiv.find('.intake').text(Math.round(dayObj.intake));
  $dayDiv.find('.difference').text(Math.round(dayObj.difference));

  // delete the log array item (data)
  dayObj.logs.splice(rowNum - 1, 1);

  localStorage.setItem("dataObject", JSON.stringify(dataObject));

  // delete the log in DOM
  $tr.remove();

  // RECALCULATE TABLE NUMBERS
  let num = 0;
  $('tbody th').each(function() {
    num++;
    $(this).text(num);
  });
});




// CREATING A NEW DAY FRAME & ATTACHING IN DOM
function daysFirstLog($date) {
  $theDay = createTheTopOfDay($date);
  
  $theDay.append(createTable());


  // PUT THE NEW DAY IN THE RIGHT PLACE IN SECTION
  const $secDiv = $('section > div');
  if($secDiv.length <1) {
    $section.append($theDay);
  } else {
    console.log($secDiv);   // TEST
    const $dateId = parseInt($date.slice(0,4) + $date.slice(5,7) + $date.slice(8,10));

    let flag = true;
    $secDiv.each(function() {
      // console.log(this);   // TEST
      const d = this.id;
      // console.log(`d is ${d}`);   // TEST
      const $dayElId = parseInt(d.slice(0,4) + d.slice(5,7) + d.slice(8,10));
      // console.log(`$dateId is ${$dateId} & $dayElId is ${$dayElId}`);   // TEST
      if ($dateId > $dayElId) {
        // console.log("$dateId IS GREATER THAN $dayElId");   // TEST
        // $theDay.insertAfter($secDivIt);
        $theDay.insertBefore(this);
        flag = false;
        return false;
      }
    });

    if(flag) {
      $section.append($theDay);
    }
  }
  
}




// FORMATTING THE DATE
function formatDate(dateVal) {
  const dateObj = new Date(dateVal);
  const weekDay = dateObj.getUTCDay();   // 0-6
  const day = dateObj.getUTCDate();   // 1-31
  const month = dateObj.getUTCMonth();   // 0-11
  const year = dateObj.getUTCFullYear();   // like 2020
  const date = `${months[+month]} ${day}, ${year} / ${days[+weekDay]}\t`;
  return date;
}


// CREATE DELETE BUTTON
function deleteButton(idClass) {
  const $i = $('<i>').addClass("fas fa-trash-alt fa-sm");
  const $delBtn = $('<button>').addClass(`btn btn-sm btn-danger ${idClass}`);
  $delBtn.append($i);
  return $delBtn;
}


// THE DATE OF DAY AND CALORIE TOTALS
function createTheTopOfDay($date) {

  // initiate the dayObj & add to dataObj
  const dayObj = {
    need: 2490,
    limit: 1900,
    intake: 0,
    logs: []
  };
  dayObj.difference = dayObj.limit - dayObj.intake;
  dataObject[`${$date}`] = dayObj;
  console.log('dataObject: ', dataObject);

  // build the HTML part
  const $formattedDate = formatDate($date);
  const $delBtn = deleteButton('delete-day');
  const $dateHead = $('<h3>').append($formattedDate).append($delBtn);
  
  const $theDay = $('<div>').addClass("day-div border-top border-success p-2").attr('id', $date)

  const $row = $('<div>').addClass('row');

  const $dailyNeed = $('<div>').addClass('col alert alert-primary');
  $dailyNeed.text("Daily Need: ").append($('<b>').append($('<span>').addClass("need").text(dayObj.need)));

  const $dietLimit = $('<div>').addClass('col alert alert-danger');
  $dietLimit.text("Diet Limit: ").append($('<b>').append($('<span>').addClass("limit").text(dayObj.limit)));
  
  const $intake = $('<div>').addClass('col alert alert-success');
  $intake.text("Intake: ").append($('<b>').append($('<span>').addClass("intake").text(dayObj.intake)));

  const $difference = $('<div>').addClass('col alert alert-info');
  $difference.text("+ / - : ").append($('<b>').append($('<span>').addClass("difference").text(dayObj.difference)));

  $row.append($dailyNeed).append($dietLimit).append($intake).append($difference);

  $theDay.append($dateHead).append($row);

  return $theDay;

}

// CREATE TABLE
function createTable() {
  const $th = $('<th>').attr("scope", "col");
  const headings = ['#', 'Food', 'Grams', 'kcal/100g', 'kcal', 'Delete'];
  const $tr = $('<tr>');
  for (heading of headings) {
    // $tr.append($th.text(heading));
    $tr.append($('<th>').attr("scope", "col").text(heading));
  }
  const $thead = $('<thead>').append($tr);
  const $table = $('<table>').addClass("table table-striped table-sm");
  $table.append($thead).append($('<tbody>'));
  return $table;
}