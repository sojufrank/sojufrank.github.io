const model = {
  init: () => {
    const self = this

    const url1 = "https://data.seattle.gov/resource/64yg-jvpt.json?$limit=10000"
    const url2 = "https://data.seattle.gov/resource/ajyh-m2d3.json?$limit=10000"
    const url3 = "https://data.seattle.gov/resource/yqis-cv5h.json?$limit=10000"

    this.urlArray = [fetch(url1),fetch(url2),fetch(url3)]
    controller.fetchData(this.urlArray)
  },
  parkData: {}
}

const controller = {
  init: () => {
    model.init()
  },
  fetchData: (arr) => {
    Promise.all(arr)
      .then(res => Promise.all(res.map(r => r.json())))
      .then(dataArray => {
        controller.parseData(dataArray)
        mapController.init()
      })
  },
  parseData: (d) => {
    const data1 = controller.parseD1(d[0],d[1])

    let obj1 = data1[0]
    let obj2 = data1[1]
    let missing = data1[2]

    obj1 = controller.deleteMissing(obj1, missing)
    const addy = controller.makeAddy(obj2)
    const final = controller.makeFinal(obj1,addy)

    model.parkData = final
  },
  parseD1: (data, data2) => {
    /*
      sort by parks management id number and if missing lat or long
      add to missing set for memoization
      add data to obj by pmaid number
    */
    let obj1 = {}
    let missing = new Set()
    data.sort((a,b) => a.pmaid - b.pmaid)
    data.forEach(item => {
      if(item.location_1 == undefined){
        missing.add(item.pmaid)
      }
      if(!obj1.hasOwnProperty(item.pmaid)) obj1[item.pmaid] = []
      obj1[item.pmaid].push(item)
    })
    /*
      iterate through object and add if pmaid is missing from 2nd api data
      add to new object to check vs missing set and add lat lng coordinates
      to obj1
    */
    let obj2 = {}
    data2.sort((a,b) => a.pmaid - b.pmaid)
    data2.forEach(item => {
      if(!obj2.hasOwnProperty(item.pmaid)) obj2[item.pmaid] = []
      obj2[item.pmaid].push(item)
      if(missing.has(item.pmaid)){
        obj1[item.pmaid].forEach(obj => {
          obj.xpos = item.x_coord
          obj.ypos = item.y_coord
          obj.location_1 = item.location_1
        })
      }
    })
    return [obj1,obj2,missing]
  },
  //delete item with no lat or lng
  deleteMissing: (obj1, missing) => {
    missing.forEach(pid => {
      obj1[pid].forEach(item => {
        if(item['xpos'] == undefined || item['ypos']  == undefined || item['location_1'] == undefined){
          delete obj1[item.pmaid]
        }
      })
    })
    return obj1
  },
  //returns object that contains park name, address, coordinates
  makeAddy: (obj2) => {
    let temp = {}
    for(const key in obj2){
      if(!temp.hasOwnProperty(key)){
        temp[key] = {}
      }

      obj2[key].forEach(item => {
        if(temp.hasOwnProperty(key)){
          temp[key]['name'] = item.name
          temp[key]['address'] = item.address
          temp[key]['x'] = item.x_coord
          temp[key]['y'] = item.y_coord
          temp[key]['zipcode'] = item.zip_code
        }
      })
    }
    return temp
  },
  //creates final object for app
  makeFinal: (obj1, addy) => {
    let temp = {}
    for(const key in obj1){
      if(!temp.hasOwnProperty(key)){
        temp[key] = {}
      }
      let s = new Set()
      obj1[key].forEach(item  => {
        if(temp.hasOwnProperty(key)){
          if(!temp[key].hasOwnProperty('name')){
            temp[key]['name'] = item.name

            if(!addy[key]){

              temp[key]['x'] = obj1[key][0].xpos
              temp[key]['y'] = obj1[key][0].ypos
              temp[key]['zipcode'] = "98116"
            } else {
              temp[key]['x'] = addy[key].x
              temp[key]['y'] = addy[key].y
              temp[key]['zipcode'] = addy[key].zipcode
            }

            if(!item.location_1_address){
              temp[key]['address'] = addy[key].address
            } else{
              temp[key]['address'] = item.location_1_address
            }
          }

          s.add(item.feature_desc)
        }
      })
      temp[key]['features'] = Array.from(s)
    }
    return temp
  }
}

let map
/* Global function is needed to be used as a callback for html script tag that calls on google api */
function initMap() {

  map = mapController.makeMap()

  const d = model.parkData

  for(key in d){
    const marker = mapController.makeMarker(d[key])
    const content = mapController.makeContent(d[key])
    const infoWindow = mapController.makeInfo(content)

    mapController.clickHandler(map, marker, infoWindow)
  }
}

const mapController = {
  init: () => {
    mapController.loadMapsScript()
  },
  loadMapsScript: () => {
    const api = "AIzaSyDbESV5B5nIlPyzvqKs02R1HfcBC59RL8I"
    const script = document.createElement('script')
    script.type = 'text/javascript'
    script.src = `https://maps.googleapis.com/maps/api/js?key=${api}&callback=initMap`
    document.body.appendChild(script)
  },

  makeMap: () => {
    const seattle = new google.maps.LatLng(47.6097,-122.3331)
    return new google.maps.Map(document.getElementById('map'), {
      center: seattle,
      zoom: 15
    })
  },
  makeMarker: (data) => {
    const x = parseFloat(data.x)
    const y = parseFloat(data.y)
    return new google.maps.Marker({
      position:new google.maps.LatLng(y,x),
      map: map,
      title: data.name
    })
  },
  makeContent: (data) => {
    return `
      <div>${data.name}</div>
      <div>${data.address}</div>
      <div>
        <div>
        ${data.features.join('</div><div>')}
        </div>
      </div>
    `
  },
  makeInfo: (content) => {
    return new google.maps.InfoWindow({
      content: content
    })
  },
  clickHandler: (map, marker, infoWindow) => {
    marker.addListener('click',()=>{
      infoWindow.open(map,marker)
    })
  }
}

controller.init()
