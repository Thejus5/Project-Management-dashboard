
let getApi = function (url, callback) {
  let xhr = new XMLHttpRequest()

  xhr.onload = function () {
    if (this.status === 200) {
      try {
        let responseArray = JSON.parse(this.responseText)
        callback(responseArray)
      }
      catch {
        console.warn('JSON not parsed')
      }
    }
    else {
      console.warn('JSON not found')
    }
  }

  xhr.open('GET', url, false)
  xhr.send()
}


let postAPI = function (url, body, callback) {
  let xhrp = new XMLHttpRequest();
  xhrp.onload = function () {
    if (this.status === 200) {
      try {
        let responseArray = JSON.parse(this.responseText);
        callback(responseArray)
      }
      catch {
        console.warn('JSON not parsed 1')
        callback('responseArray')
      }
    }
    else {
      console.warn('JSON not found 2')
    }
  }

  xhrp.open('POST', url, true);
  xhrp.setRequestHeader('Content-type', 'application/json; charset=utf-8');
  xhrp.send(JSON.stringify(body));
}

let putAPI = function (url, body, callback) {
  let xhrp = new XMLHttpRequest();
  xhrp.onload = function () {
    if (this.status === 200) {
      try {
        let responseArray = JSON.parse(this.responseText);
        callback(responseArray)
      }
      catch {
        console.warn('JSON not parsed 1')
        callback('responseArray')
      }
    }
    else {
      console.warn('JSON not found 2')
    }
  }

  xhrp.open('PUT', url, true);
  xhrp.setRequestHeader('Content-type', 'application/json; charset=utf-8');
  xhrp.send(JSON.stringify(body));
}

let deleteApi = function (url, callback) {
  let xhr = new XMLHttpRequest()

  xhr.onload = function () {
    if (this.status === 200) {
      try {
        let responseArray = JSON.parse(this.responseText)
        callback(responseArray)
      }
      catch {
        console.warn('JSON not parsed')
        callback('responseArray')
      }
    }
    else {
      console.warn('JSON not found')
    }
  }

  xhr.open('DELETE', url, false)
  xhr.send()
}