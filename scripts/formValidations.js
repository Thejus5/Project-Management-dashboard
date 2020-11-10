/****************************************************************** 
        *   GENERAL FORM VALIDATION AND MESSAGE DISPLAY FUNCTIONS * 
*******************************************************************/

const displayTimedMessage = (htmlElement, color, displayType) => {
    if (displayType == "show") htmlElement.style.border = `1.6px solid ${color}`
    else if (displayType == "hide") setTimeout(() => { htmlElement.style.border = "none" }, 5500)
}
const clearHighlight = (targetElement) => {
    displayTimedMessage(targetElement, "green", "show")
    displayTimedMessage(targetElement, "", "hide")
}
const errorMessages = (targetLabel, targetElementId, errorMsg) => {
    document.querySelector(targetElementId).textContent = errorMsg
    displayTimedMessage(targetLabel, "red", "show")
}

const emailPatternCheck = (email) => {
    const emailPattern = new RegExp("^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$", "g")
    if (email.match(emailPattern)) return true
    else return false
}


/********************************************************************************************************  
        *   PROJECT FORM VALIDATION  * 
******************************************************************************************************** */
const progress = document.getElementById("range")

// Project Progress
progress.addEventListener("change", (e) => document.querySelector(".range-label").textContent = e.currentTarget.value)

// Date validation
const startDate = document.getElementById("start-date"),
    endDate = document.getElementById("end-date"),
    dates = document.querySelector(".dates")

const formatDate = (date) => {
    let d = new Date(date),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;

    return [year, month, day].join('-');
}

startDate.setAttribute("min", formatDate(new Date()))
endDate.setAttribute("min", formatDate(new Date()))

// Number of days left value
const daysLeft = Math.round(Math.abs(((new Date("10/31/2020").getTime() - new Date().getTime()) / (24 * 60 * 60 * 1000))))

// Get form details
const projectName = document.getElementById("project-name"), //keyup
    clientName = document.getElementById("client-name"), //keyup
    projectManager = document.getElementById("project-manager"), //keyup
    description = document.getElementById("description"), //keydown
    newProjectForm = document.getElementById("project-form")

projectName.addEventListener('keyup', _ => {
    document.querySelector("#pname-error").textContent = ""
    clearHighlight(projectName)
})

clientName.addEventListener('keyup', _ => {
    document.querySelector("#cname-error").textContent = ""
    clearHighlight(clientName)
})

projectManager.addEventListener('keyup', _ => {
    document.querySelector("#pmname-error").textContent = ""
    clearHighlight(projectManager)
})

description.addEventListener('keydown', _ => {
    document.querySelector("#description-error").textContent = ""
    clearHighlight(description)
})

dates.addEventListener('click', _ => {
    document.querySelector("#dates-error").textContent = ""
    clearHighlight(endDate)
})


/*************************************************************************************************
        *   RESOURCE FORM VALIDATION  * 
**************************************************************************************************/

const resourceName = document.getElementById("name"), 
email = document.getElementById("email"),
role = document.getElementById("role"), 
billableStatus = document.getElementById("billable"), 
rate = document.getElementById("rate")

resourceName.addEventListener('keyup', _ => {
    document.querySelector("#name-error").textContent = ""
    clearHighlight(resourceName)
})

email.addEventListener('keyup', _ => {
    document.querySelector("#email-error").textContent = ""
    clearHighlight(email)
})

role.addEventListener('keyup', _ => {
    document.querySelector("#role-error").textContent = ""
    clearHighlight(role)
})

billableStatus.addEventListener('click', _ => {
    document.querySelector("#rate-error").textContent = ""
    clearHighlight(rate)
})

rate.addEventListener('keyup', _ => {
    document.querySelector("#rate-error").textContent = ""
    clearHighlight(rate)
})

// Variables to switch the visibility of different forms.
const formsContainer = document.querySelector('#forms-modal'),
    projectFormModal = document.querySelector('#modal-content-project'),
    resourceFormModal = document.querySelector('#modal-content--resource'),
    deleteResourceConfirmationModal = document.querySelector('#modal-content--delete-resource');