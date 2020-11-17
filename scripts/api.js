let getApi = function (url, callback) {
 // comment
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

  xhr.open('GET',url,false)
  xhr.send()
}




