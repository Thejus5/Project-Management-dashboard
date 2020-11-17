let getApi = function (url, callback) {
 // comment
  let xhr = new XMLHttpRequest()

  xhr.onload = function () {
    if (this.status === 200) {
      try {
        let responseArray = JSON.parse(this.responseText)
        console.log(JSON.parse(responseArray[0].technologies))
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

  xhr.open('GET',url)
  xhr.send()
}




