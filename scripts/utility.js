// Urls of remote data storage bin and secret key to access the data.
const urlList = {
    //"projects": "https://api.jsonbin.io/b/5f9fab6347077d298f5b955e", // Old
    "projects":"https://api.jsonbin.io/b/5faa45da48818715939e953e",
    "resources":"https://api.jsonbin.io/b/5faa457abd01877eecdc148e",
    "statusReport":"https://api.jsonbin.io/b/5faa46822769cc5b06ada086"
    // "resources": "https://api.jsonbin.io/b/5f9fabb447077d298f5b9576" // Old 
}

// const secretKey = "$2b$10$13A5uhCyWMeIqOInL3bdeuAlJSI2Nx5J2h2HciLIGw1nb6Xm/NwRe"; // Old
const secretKey = "$2b$10$1KZ6VDOn5QBsDQ6Fk2BGdeDrxrbQVt6vqpDTnFlM5xykGvBmx7hkC"

let get = function (url, secretKey, callback) {
    let req = new XMLHttpRequest();

    req.onreadystatechange = () => {
        if (req.readyState == XMLHttpRequest.DONE) {
            callback(JSON.parse(req.responseText));
        }
    };

    req.open("GET", url, false);
    req.setRequestHeader("secret-key", secretKey);
    req.send();
}

// Prints whatever is passed to it.
function printResult(res) {
    console.log(res);
}

function storeProjectData(res) {
    projects = res;
    latestOfflineProjects = res
}

function storeResourceData(res) {
    resources = res;
    latestOfflineResources = res
}

let put = function (url, secretKey, obj, callback) {
    let req = new XMLHttpRequest();

    req.onreadystatechange = () => {
        if (req.readyState == XMLHttpRequest.DONE) {
            console.log(JSON.parse(req.responseText));
            callback(JSON.parse(req.responseText));
        }
    };

    req.open("PUT", url, true);
    req.setRequestHeader("Content-Type", "application/json");
    req.setRequestHeader("secret-key", secretKey);
    req.setRequestHeader("versioning", false);
    req.send(JSON.stringify(obj));
}

// User login options
document.getElementById('user').addEventListener('click', _ => {
    const logoutStatus = document.getElementById("logout-button")
    // Show logout button
    if (logoutStatus.style.display == "none") {
        logoutStatus.style.display = "flex"
        document.getElementById('user').style.cssText = "background-color: rgb(14, 20, 24);"
    }
    else {
        logoutStatus.style.display = "none"
        document.getElementById('user').style.cssText = "background-color: var(--primary-color);"
    }
})

//Check whether input has only alphabets
RegExp.prototype.isAlpha = function (input) { return /^[A-Za-z ]*$/.test(input) }

// Function to create circular progress bar. 
function createProgressBar(percent, main = false) {
    const progressBar = document.createElement('span');

    progressBar.style.background = `linear-gradient(to top, var(--primary-color) ${percent}%, var(--font-color) 1%`;
    const progressPercent = createSpanTag(`${percent}%`);
    if (percent < 50) progressPercent.style.color = "var(--primary-color)";
    if (main === true) {
        progressBar.classList.add('circular--main', 'display-flex', 'flex-center');
        progressPercent.classList.add('inner--main', 'display-flex', 'flex-center');
    } else {
        progressBar.classList.add('circular', 'display-flex', 'flex-center');
        progressPercent.classList.add('inner', 'display-flex', 'flex-center');
    }
    progressBar.appendChild(progressPercent);
    return progressBar;
}

// Creates span tag, adds its innerText, and returns the tag.
function createSpanTag(text) {
    const spanTag = document.createElement('span');
    spanTag.innerText = text;
    return spanTag;
}

// Creates table cell (td tag), stores its innerText, right aligns numeric content, and returns cell.
function createTableCell(value) {
    const cell = document.createElement('td');
    cell.innerText = value;
    if (typeof (value) === 'number') {
        cell.style.textAlign = 'right';
    }
    return cell;
}


// Creates table cell with edit/delete button and returns cell.
function createButtonCell(buttonCollection) {
    const cell = document.createElement('td');
    cell.classList.add('remove-background');
    buttonCollection.forEach(button => {
        if (button.buttonType === 'edit') {
            [src, alt, classListArray, attributeName, attributeValue] = ['images/edit.png', 'Pen icon', ['table-icons', 'edit-icon', 'margin-right10'], button.attribute, button.row]
            const tableButton = createImageTag(src, alt, classListArray)
            tableButton.setAttribute(attributeName, attributeValue)
            tableButton.addEventListener('click', function (e) { displayEditResourceForm(e); });
            cell.appendChild(tableButton)
        }
        else {
            [src, alt, classListArray, attributeName, attributeValue] = ['images/delete-icon.png', 'Trash bin icon', ['table-icons', 'delete-icon'], button.attribute, button.row];
            const tableButton = createImageTag(src, alt, classListArray)
            tableButton.setAttribute(attributeName, attributeValue)
            tableButton.addEventListener('click', function (e) { displayDeleteResourceModal(e); });
            cell.appendChild(tableButton)
        }

    })
    return cell;
}

// Creates and returns image tag with src, alt, and classes added to it.
function createImageTag(src, alt, classListArray) {
    const imageTag = document.createElement('img');
    imageTag.src = src;
    imageTag.alt = alt;
    classListArray.forEach(className => {
        imageTag.classList.add(className);
    });
    return imageTag;
}

//Function to remove all child nodes of parent node.
function removeChildNodes(parentNode) {
    while (parentNode.firstChild) {
        parentNode.removeChild(parentNode.firstChild);
    }
}

// Globally accessible variable to tagify technologies input field.
let tagify;
// Function initializes tagify variable.
function inputTags(inputElm, whitelist) {
    // Initialize Tagify on the received input node reference.
    tagify = new Tagify(inputElm, {
        transformTag: transformTag,
        dropdown: {
            enabled: 1,            // show suggestion after 1 typed character
            fuzzySearch: true,    // match only suggestions that starts with the typed characters
            caseSensitive: false,   // allow adding duplicate items if their case is different
        }
    });

    // Event listener.
    tagify.on('input', onInput);

    const mockAjax = (function mockAjax() {
        let timeout;
        return function (duration) {
            clearTimeout(timeout); // abort last request
            return new Promise(function (resolve, reject) {
                timeout = setTimeout(resolve, duration || 700, whitelist)
            })
        }
    })();

    // On character(s) added/removed (user is typing/deleting)
    function onInput(e) {
        tagify.settings.whitelist.length = 0; // reset current whitelist
        tagify.loading(true) // show the loader animation

        // get new whitelist from a delayed mocked request (Promise)
        mockAjax()
            .then(function (result) {
                // replace tagify "whitelist" array values with new values
                // and add back the ones already choses as Tags
                tagify.settings.whitelist.push(...result, ...tagify.value)

                tagify
                    .loading(false)
                    // render the suggestions dropdown.
                    .dropdown.show.call(tagify, e.detail.value);
            })
            .catch(err => tagify.dropdown.hide.call(tagify))
    }
}

// Transforms tag value to lowercase.
function transformTag(tagData) {
    // tagData.style = "--tag-bg:" + getRandomColor();
    tagData.value = tagData.value.toLowerCase();
}

// Function to create a chart
function createChart(canvas, labels, legendLabel, dataValues, backgroundColorValue, borderColorValue) {
    let graph = new Chart(canvas, {
        type: 'bar',
        data: {
            labels: labels,
            responsive: true,
            maintainAspectRatio: true,
            datasets: [{
                label: legendLabel,
                data: dataValues,
                backgroundColor: backgroundColorValue,
                borderWidth: 1,
                borderColor: borderColorValue
            }]
        },
        options: {
            tooltips: {
                backgroundColor: '#000000',
                titleFontColor: borderColorValue,
                bodyFontColor: borderColorValue
            },
            scales: {
                xAxes: [{
                    ticks: {
                        display: false
                    }
                }],
                yAxes: [{
                    ticks: {
                        beginAtZero: true,
                        precision: 0
                    }
                }]
            },
        }
    })
}

let latestOfflineResources, latestOfflineProjects, offlineReports