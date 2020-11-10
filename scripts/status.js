/*---------------------------------------------------------------
 >> STATUS.JS
 - This js file includes all features for the status tab.

 >> CONTENTS
    1. Global variables.
    2. API call.
    3. Load contents of status report tab.
    4. Set value to resource dropdown.
    5. Set value to activities dropdown.
    6. Set current date.
    7. Event Listeners
        i. For Project Cards
        ii. For Submit Button.
    8. Field validations.
        i. Date validation.
        ii. Working hours validation.
    9. Upload data to server.
----------------------------------------------------------------*/

/*---------------- Global variables -----------------------------*/
let activitiesList = ['Coding', 'Training', 'Marketing']
let sample = [
  {
    project_id: -1,
    date: "2020-11-10",
    resources: "Haripriya",
    activities: "Coding",
    hours: 15
  }
]

/*---------------- API call -------------------------------------*/
function apiCall() {
  get(urlList.statusReport, secretKey, (reports) => {
    if (reports && reports.length > 0) {
      // offlineReports = sample
      offlineReports = reports
      statusTabLoader()
    }
  })
}

/*---------------- Load contents of status report ---------------*/
function statusTabLoader() {
  let selectedProjectId = document.querySelector('.selection').dataset['projectid']
  if (offlineReports && offlineReports.length > 0) {
    resourceDropDown(selectedProjectId)
    activitiesDropDown()
    setDate()
    document.querySelector('#hours-worked').value = null

    console.log(offlineReports)
  }
  else {
    console.log('No report')
  }
}

/*---------------- Set value to resource dropdown ----------------*/
function resourceDropDown(projectId) {
  let selectorForResources = document.querySelector('#resources-dropdown')
  selectorForResources.innerHTML = `<option value="Select Resource">Select Resource</option>`
  let resourceOfSelected = latestOfflineResources[projectId]

  if (resourceOfSelected) {
    resourceOfSelected.forEach((resource) => {
      let option = document.createElement('option')
      option.value = resource.name
      option.textContent = resource.name
      selectorForResources.appendChild(option)
    })
  }
}

/*---------------- Set value to activities dropdown ----------------*/
function activitiesDropDown() {
  let selectorForActivity = document.querySelector('#activity-dropdown')
  selectorForActivity.innerHTML = ''

  activitiesList.forEach((activity) => {
    let option = document.createElement('option')
    option.value = activity
    option.textContent = activity
    selectorForActivity.appendChild(option)
  })
}

/*---------------- Set current date --------------------------------*/
function setDate() {
  let day = new Date().getDate().toString()
  let month = (new Date().getMonth() + 1).toString()
  let year = new Date().getFullYear().toString()

  if (day.length < 2) day = `0${day}`
  if (month.length < 2) month = `0${month}`

  document.querySelector('#status-date').value = `${year}-${month}-${day}`
}

// Make the API call
apiCall()

/*---------------- Event Listeners ---------------------------------*/
// For Project Cards
let projectCards = document.querySelectorAll('.project-list__item')
projectCards.forEach((card) => {
  card.addEventListener('click', () => {
    resetAllErrors()
    statusTabLoader()
  })
})

// For Submit Button
let isReadyToUpload = true
let btn = document.querySelector('.status-submit')
btn.addEventListener('click', () => {
  resetAllErrors()
  isReadyToUpload = true
  const activityField = document.querySelector('#activity-dropdown')
  const resourceField = document.querySelector('#resources-dropdown')
  const dateField = document.querySelector('#status-date')
  const hoursField = document.querySelector('#hours-worked')

  validate(resourceField, dateField, hoursField)
  if (isReadyToUpload) {
    putToServer(activityField, resourceField, dateField, hoursField)
  }
})


/*---------------- Field validations --------------------------------*/
function validate(resource, date, hour) {
  // Check if any resource is selected
  if (resource.value === 'Select Resource') {
    setError(resource, 'Select a resource')
  }
  else {
    clearError(resource)
  }

  validateDate(date)
  validateHours(hour)
}

// Date validation
function validateDate(dateField) {
  const inputDate = new Date(dateField.value)
  const curDate = new Date()
  let difference = inputDate.getTime() - curDate.getTime()
  const eightDayMilliseconds = 691200000  // Total milliseconds in 8 days

  if (difference < -eightDayMilliseconds) { // Difference of 8 days
    setError(dateField, 'Date should be within 7 days.')
  }
  else if (inputDate.getTime() > curDate.getTime()) { // Future dates
    setError(dateField, 'Future status cannot be entered.')
  }
  else {
    clearError(dateField)
  }
}

// Working hours validation
function validateHours(hourField) {
  if (!hourField.value) {
    setError(hourField, 'Hours cannot be empty')
  }
  else {
    if (hourField.value > 16 || hourField.value < 0) {
      setError(hourField, 'Invalid working hours.')
    }
    else {
      clearError(hourField)
    }
  }
}



function setError(field, msg) {
  let error = document.querySelector(`.${field.id}-error`)
  error.textContent = msg
  error.style.visibility = 'visible'
  isReadyToUpload = false
}

function clearError(field) {
  let error = document.querySelector(`.${field.id}-error`)
  error.textContent = ''
  error.style.visibility = 'hidden'
}

function resetAllErrors() {
  document.querySelectorAll('.status-error').forEach((error) => {
    error.textContent = ''
    error.style.visibility = 'hidden'
  })
}

/*---------------- Upload data to server -------------------------*/
function putToServer(activityField, resourceField, dateField, hoursField) {
  let selectedProjectId = document.querySelector('.selection').dataset['projectid']

  // Create the new report object
  const newReport = {
    project_id: parseInt(selectedProjectId),
    date: dateField.value,
    resources: resourceField.value,
    activities: activityField.value,
    hours: parseInt(hoursField.value)
  }

  // Check whether the same report is already there in database
  let sameReport = offlineReports.find((report) => (report.project_id === newReport.project_id && report.date === newReport.date && report.resources === newReport.resources))

  if (sameReport) {
    let mainError = document.querySelector('.main-error')
    mainError.innerHTML = "Error"
    mainError.style.visibility = 'visible'
  }
  else {
    offlineReports.push(newReport)
    let mainError = document.querySelector('.main-error')
    mainError.innerHTML = ""
    mainError.style.visibility = 'hidden'
  }

  console.log(offlineReports)
  put(urlList.statusReport,secretKey,offlineReports,(res)=>{
    console.log(res)
  })
}