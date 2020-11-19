// Globally accessible variable to store whether function should add a new project or update an existing project.
let addProjectFunctionality = true;

// Invoke function to initialize tagify variable which makes technologies input field a tagged input field.
inputTags(document.querySelector('#technologies'), technologiesList);

function addOrUpdateProject(e) {
  e.preventDefault()

  // Check if all form input fields are valid.
  const projectNameStatus = projectName.value.length == 0 ? false : true,
    clientNameStatus = clientName.value.length == 0 ? false : true,
    projectManagerStatus = RegExp.prototype.isAlpha(projectManager.value) && projectManager.value.length != 0 ? true : false,
    dateStatus = startDate.value < endDate.value ? true : false,
    descriptionStatus = description.value.length == 0 ? false : true

  if (projectNameStatus && clientNameStatus && projectManagerStatus && descriptionStatus && dateStatus) {
    projectFormModal.style.display = "none";
    formsContainer.style.display = "none";

    const projectDetails = {
      name: projectName.value,
      client: clientName.value,
      manager: projectManager.value,
      status: 'Open',
      start_date: startDate.value,
      end_date: endDate.value,
      progress: progress.value || 0,
      description: description.value,
      technologies: technologies.value ? JSON.parse(technologies.value).map(tech => tech.value) : []
    }

    // If a new user-entered tag is not there in technologies array, add it to the array.
    if (addProjectFunctionality) {
      postAPI(urlList.projects, projectDetails, (res) => {
        console.log('Data Added')
        document.location.reload()
      })
    } else {
      putAPI(`${urlList.projects}/${selectedProjectId}`, projectDetails, (res) => {
        console.log(projectDetails)
        updateProjectToLocal({projectId: selectedProjectId, ...projectDetails})
        loadProjectList() // This updates everything
      })
    }

  } // Display error messages
  else {
    if (!projectNameStatus) errorMessages(projectName, "#pname-error", "This field cannot be empty")
    if (!clientNameStatus) errorMessages(clientName, "#cname-error", "This field cannot be empty")
    if (!projectManagerStatus) {
      if (projectManager.value.length == 0) errorMessages(projectManager, "#pmname-error", "This field cannot be empty")
      else errorMessages(projectManager, "#pmname-error", "Only alphabets and spaces are allowed")
    }
    if (!dateStatus) errorMessages(endDate, "#dates-error", "Enter a valid end date")
    if (!descriptionStatus) errorMessages(description, "#description-error", "This field cannot be empty")
  }
}

function updateProjectToLocal(projectToDatabase) {

  let projectToUpdate = projects.find((project) => project.projectId == selectedProjectId)
  projectToUpdate.projectName = projectToDatabase.name
  projectToUpdate.clientName = projectToDatabase.client
  projectToUpdate.projectManager = projectToDatabase.manager
  projectToUpdate.projectStatus = 'Open'
  projectToUpdate.startDate = projectToDatabase.start_date
  projectToUpdate.endDate = projectToDatabase.end_date
  projectToUpdate.progress = projectToDatabase.progress
  projectToUpdate.description = projectToDatabase.description
  projectToUpdate.technologies = JSON.stringify(projectToDatabase.technologies)

}

// Add new project event listener.
const addProject = document.querySelector('#new-project');
addProject.addEventListener('click', function (e) {

  document.querySelector('#project-form').reset();
  clearProjectErrorMessages();

  // Change form heading and submit button text.
  const formTitle = document.querySelector('#project-form--title'),
    submitButton = document.querySelector('#submit-project--button');
  const updateText = 'Add Project';
  formTitle.innerText = updateText;
  submitButton.value = updateText;

  // Display add project form.
  formsContainer.style.display = "flex";
  projectFormModal.style.display = "block";
  resourceFormModal.style.display = "none";
  deleteResourceConfirmationModal.style.display = "none";

  // Hide progress slider
  document.getElementById("form-project-progress").style.display = "none";

  projectName.readOnly = false;
  clientName.readOnly = false;

});


// Update project details event listener.
const updateProject = document.querySelector('#project-headings--edit');
updateProject.addEventListener('click', function (e) {

  // Add project functionality set to false. (ie, update functionality is now true.)
  addProjectFunctionality = false;

  clearProjectErrorMessages();

  const projectName = document.querySelector('#project-name'),
    clientName = document.querySelector('#client-name'),
    projectManager = document.getElementById("project-manager"),
    startDate = document.querySelector('#start-date'),
    endDate = document.querySelector('#end-date'),
    technologies = document.querySelector('#technologies'),
    progress = document.getElementById("range"),
    progressLabel = document.querySelector('#progress-label'),
    description = document.getElementById("description"),
    formTitle = document.querySelector('#project-form--title'),
    submitButton = document.querySelector('#submit-project--button');


  // Display update project details form.
  formsContainer.style.display = "flex";
  projectFormModal.style.display = "block";
  resourceFormModal.style.display = "none";
  deleteResourceConfirmationModal.style.display = "none";

  // Display slider and change button text
  document.getElementById("form-project-progress").style.display = "block";


  // Change form heading and submit button text.
  const updateText = 'Update Project';
  formTitle.innerText = updateText;
  submitButton.value = updateText;

  // Set project name and client name as non-editable.
  projectName.readOnly = true;
  clientName.readOnly = true;

  // Identify currently active project and populate update form fields with existing values.
  let selectedProject = projects.find((project) => project.projectId == selectedProjectId);
  projectName.value = selectedProject.projectName;
  clientName.value = selectedProject.clientName;
  projectManager.value = selectedProject.projectManager;
  startDate.value = selectedProject.startDate;
  endDate.value = selectedProject.endDate;
  progress.value = selectedProject.progress;
  progressLabel.innerText = selectedProject.progress;
  description.value = selectedProject.description;

  tagify.addTags(JSON.parse(selectedProject.technologies));
})

function clearProjectErrorMessages() {
  const projectNameError = document.querySelector('#pname-error'),
    clientNameError = document.querySelector('#cname-error'),
    projectManagerError = document.querySelector("#pmname-error"),
    datesError = document.querySelector('#dates-error'),
    descriptionError = document.querySelector("#description-error"),
    projectName = document.querySelector('#project-name'),
    clientName = document.querySelector('#client-name'),
    projectManager = document.getElementById("project-manager"),
    endDate = document.querySelector('#end-date');

  projectNameError.innerText = '';
  clientNameError.innerText = '';
  projectManagerError.innerText = '';
  datesError.innerText = '';
  descriptionError.innerText = '';
  projectName.style.border = 'none';
  clientName.style.border = 'none';
  projectManager.style.border = 'none';
  endDate.style.border = 'none';
  description.style.border = 'none';
}

// Project form submit button event listener. It calls addOrUpdateProject().
const submitProjectForm = document.querySelector('#submit-project--button');
submitProjectForm.addEventListener('click', addOrUpdateProject);

// Pressing cancel on the project form will reload the page (to clear current form state) and set addProjectFunctionality to true.
const cancelProject = document.getElementById("cancel");
cancelProject.addEventListener('click', _ => {
  clearProjectErrorMessages();
  formsContainer.style.display = "none";
  addProjectFunctionality = true;
  tagify.removeAllTags();
});