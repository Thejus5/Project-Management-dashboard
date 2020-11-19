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
        iii. Status sort dropdown.
    8. Field validations.
        i. Date validation.
        ii. Working hours validation.
    9. Load status history.
    10. Upload data to server.
    11. Success message on adding status report.
----------------------------------------------------------------*/

/*---------------- Global variables -----------------------------*/
const activitiesList = ['Coding', 'Training', 'Marketing', 'Project Management', 'Training', 'Architecting',
  'Requirement analysis', 'System design', 'Graphic design', 'Testing', 'HTML/CSS', 'Pre-sales', 'Tech support', 'UX design', 'Marketing', 'Business analysis', 'Recruitment & HR', 'Other']

const today = new Date()
const formattedToday = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`

// This is used to reset the status reports data in server and offline
let sample = [
  {
    project_id: -1,
    date: "2020-11-10",
    posted_date: formattedToday,
    resources: "Haripriya",
    activities: "Coding",
    hours: 15
  }
]

/*---------------- API call -------------------------------------*/
function startingPoint() {
  statusTabLoader()
  statusHistoryLoader()  // This function is written way below. Check the content list.
}

/*---------------- Load contents of status report ---------------*/
function statusTabLoader() {
  let selectedProjectId = document.querySelector('.selection').dataset['projectid']
  if (offlineReports && offlineReports.length > 0) {
    resourceDropDown(selectedProjectId)
    activitiesDropDown()
    setDate()
    document.querySelector('#hours-worked').value = null
  }
  else {
    console.log('No report')
  }
}

/*---------------- Set value to resource dropdown ----------------*/
function resourceDropDown(projectId) {
  let selectorForResources = document.querySelector('#resources-dropdown')
  selectorForResources.innerHTML = `<option value="Select Resource">Select Resource</option>`
  let resourceOfSelected = resources.filter((resource) => resource.project_id == projectId)

  if (resourceOfSelected) {
    resourceOfSelected.forEach((resource) => {
      let option = document.createElement('option')
      option.value = resource.id
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
  const dateSelector = document.querySelector('#status-date')
  const dayLimit = 7
  dateSelector.innerHTML = ''
  let previousDay = new Date(today)

  for (let i = 0; i < dayLimit; i++) {
    previousDay.setDate(today.getDate() - i)
    let option = document.createElement('option')
    option.value = `${previousDay.getFullYear()}-${previousDay.getMonth() + 1}-${previousDay.getDate()}`
    option.textContent = `${previousDay.getFullYear()}-${previousDay.getMonth() + 1}-${previousDay.getDate()}`
    dateSelector.appendChild(option)
  }
}

// Make the API call
startingPoint()

/*---------------- Event Listeners ---------------------------------*/
const statusTabButton = document.querySelector('#project-headings--status')
statusTabButton.addEventListener('click', () => {
  resetAllErrors()
  statusTabLoader()
  statusHistoryLoader()
})

// For Project Cards
let projectCards = document.querySelectorAll('.project-list__item')
projectCards.forEach((card) => {
  card.addEventListener('click', () => {
    resetAllErrors()
    statusTabLoader()
    statusHistoryLoader()
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

// For status report sort (dropdown)
let sorterDropDown = document.querySelector('#sort-status')
sorterDropDown.onchange = () => {
  let selectedProjectId = document.querySelector('.selection').dataset['projectid']
  loadHistory(selectedProjectId, sorterDropDown.value)
}


/*---------------- Field validations --------------------------------*/
function validate(resource, date, hour) {
  // Check if any resource is selected
  if (resource.value === 'Select Resource') {
    setError(resource, 'Select a resource')
  }
  else {
    clearError(resource)
  }

  validateHours(hour)
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

/*---------------- Load status history ---------------------------*/
function statusHistoryLoader() {
  let selectedProjectId = document.querySelector('.selection').dataset['projectid']
  let reportedResources = [...new Set(offlineReports.filter((reports) => reports.project_id == selectedProjectId).reduce((acc, cur) => [...acc, cur.resource_id], []))]

  // Create the sorting dropdown
  if (reportedResources) {
    let sorter = document.querySelector('#sort-status')
    sorter.innerHTML = ''
    let allOption = document.createElement('option')
    allOption.value = 'All'
    allOption.innerHTML = 'All'
    sorter.appendChild(allOption)

    reportedResources.forEach((report) => {
      let option = document.createElement('option')
      option.value = report
      option.innerHTML = (resources.find((resource) => resource.id == report)).name
      sorter.appendChild(option)
    })

    loadHistory(selectedProjectId)
  }
}

function loadHistory(id, resourceSelector = 'All') {
  let reports = offlineReports.filter((report) => report.project_id == id)
  if (resourceSelector != 'All') {
    reports = reports.filter((report) => report.resource_id == resourceSelector)
  }

  // Sorting filtered report by date
  let sortedReports = reports.sort((a, b) => (new Date(a.date).getTime() > new Date(b.date).getTime()) ? -1 : ((new Date(a.date).getTime() < new Date(b.date).getTime()) ? 1 : 0))

  let container = document.querySelector('.status-report-container')
  container.innerHTML = ''

  sortedReports.forEach((report) => {
    const oldReports = generateStatusCard(report)
    container.appendChild(oldReports)
  })

}

// Returns the card that can be appended to container
function generateStatusCard(report) {
  let resourceName = (resources.find((resource) => resource.id == report.resource_id)).name
  const oldReports = document.createElement('div')
  oldReports.className = 'old-report'

  const postedDateBox = document.createElement('div')
  postedDateBox.className = 'posted-on'

  const postedHead = document.createElement('p')
  postedHead.innerHTML = 'Posted On:'
  postedDateBox.appendChild(postedHead)

  const thisDay = document.createElement('p')
  thisDay.className = 'current-date'
  thisDay.innerHTML = report.posted_date
  postedDateBox.appendChild(thisDay)

  const detailsBox = document.createElement('div')
  detailsBox.className = 'report-details'

  const date = document.createElement('p')
  date.className = 'date'
  date.innerHTML = report.date
  detailsBox.appendChild(date)

  const hours = document.createElement('p')
  hours.className = 'hours'
  hours.innerHTML = `${report.hours} hour(s) of ${report.activities}`
  detailsBox.appendChild(hours)

  const resource = document.createElement('p')
  resource.className = 'resource-name'
  resource.innerHTML = resourceName
  detailsBox.appendChild(resource)

  oldReports.appendChild(postedDateBox)
  oldReports.appendChild(detailsBox)

  return oldReports
}



/*---------------- Upload data to server -------------------------*/
function putToServer(activityField, resourceField, dateField, hoursField) {
  let selectedProjectId = document.querySelector('.selection').dataset['projectid']

  // Create the new report object
  const newReport = {
    project_id: parseInt(selectedProjectId),
    date: dateField.value,
    posted_date: formattedToday,
    resource_id: parseInt(resourceField.value),
    activities: activityField.value,
    hours: parseInt(hoursField.value)
  }

  // Check whether the same report is already there in database
  let sameReport = offlineReports.find((report) => (report.project_id === newReport.project_id && report.date === newReport.date && report.resource_id === newReport.resource_id && report.activities === newReport.activities))

  const mainError = document.querySelector('.main-error')
  if (sameReport) {
    mainError.innerHTML = "This report has already been submitted"
    mainError.style.visibility = 'visible'
  }
  else {
    let previousTotalTime = offlineReports.filter((reports) => (reports.project_id === newReport.project_id && reports.resource_id === newReport.resource_id && reports.date === newReport.date)).reduce((acc, cur) => acc + cur.hours, 0)

    if ((previousTotalTime + newReport.hours) > 16) {
      mainError.innerHTML = "This resource has exceeded the per day time limit"
      mainError.style.visibility = 'visible'
    }
    else {
      offlineReports.push(newReport)
      mainError.innerHTML = ""
      mainError.style.visibility = 'hidden'

      postAPI('http://localhost:8080/status', newReport, (res) => {
        statusHistoryLoader()
      })
    }
  }
}

/*---------------- Success message on adding status report -------*/
function successResponse(textField) {
  textField.innerHTML = "Report added successfully"
  textField.style.color = '#31e657'
  textField.style.visibility = 'visible'
  setTimeout(() => {
    textField.innerHTML = ""
    textField.style.color = '#de2727'
    textField.style.visibility = 'hidden'
  }, 2000)
}

