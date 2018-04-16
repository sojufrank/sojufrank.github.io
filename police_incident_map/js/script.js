/*
  This grabs data from from data.seattle.gov.  1. List of 1000 police reports
  The data is written to a google map
  App is organized in a MVC (model, view, controller).
*/

/* initMap() cannot be called as a callback from the <script src="callback">
    if it is put into a module design pattern.  For that reason I had to
    create this ultra long function.
*/
function initMap() {
  definePopupClass();

  const data = controller.getReports();
  console.log(data);

  const map = mapModule.makeMap();

  data.forEach(item => {
    const myLatLng = mapModule.getCoords(item.latitude, item.longitude, item.location);
    const marker = mapModule.makeMarker(map, myLatLng, item.summarized_offense_description);
    const content = mapModule.makeContent(item);

    //unable to put add listener method to map module due to error with popup window
    marker.addListener('click', (e) => {

      const contentParent = document.querySelector('.content-parent');
      const removalNode = document.querySelectorAll('.popup-tip-anchor');

      //try to find parent element and remove node that contains popupwindow arrow
      try {
        removalNode.forEach(item => {
          item.parentElement.removeChild(item);
        })
      } catch (error) {}

      let node = document.createElement('div');
      node.classList.add('content')
      contentParent.appendChild(node);

      let contentDiv = document.querySelector('.content');
      contentDiv.innerHTML = content
      const popup = new Popup(
        new google.maps.LatLng(item.latitude, item.longitude),
        contentDiv);
      popup.setMap(map);
    });
  });
}

let mapModule = {

  // creates map and sets origin coordinates to Seattle
  makeMap: () => {
    const map = document.querySelector('#map');
    const seattle = {
      lat: 47.6097,
      lng: -122.3331
    };
    return new google.maps.Map(map, {
      zoom: 15,
      center: seattle,
      gestureHandling: 'greedy',
      styles: style,
      mapTypeControl: false
    });
  },

  //returns a google coordinate object
  getCoords: (latitude, longitude, location) => {
    let coords = {};
    (latitude && longitude) ?
    coords = new google.maps.LatLng(latitude, longitude):
      coords = new google.maps.LatLng(location.latitude, location.longitude);
    return coords;
  },

  //returns a google map marker object with coordinates and icon
  makeMarker: (m, c, item) => {
    return new google.maps.Marker({
      position: c,
      map: m,
      icon: iconSwitch(item)
    });
  },

  //returns content to put into popup window
  makeContent: (data) => {
    //return data.offense_type;

    return `
      <h2 class="title">${data.summarized_offense_description}</h2>
      <p><label>Date: </label> ${data.date}</p>
      <p><label>Address: </label> ${data.hundred_block_location}</p>
    `
  }
}

let model = {
  init: () => {
    this.uri = `https://data.seattle.gov/resource/policereport.json`;
  },
  reports: {},
  getUrl: () => {
    return self.uri;
  },
  getData: (url) => {
    return
  },
  getReports: () => {
    return model.reports;
  }
}

let controller = {
  init: () => {
    model.init();
    controller.getData(model.getUrl())
  },
  getData: (url) => {
    fetch(url)
      .then(res => res.json())
      .catch(err => console.log(err))
      .then(data => {
        model.reports = controller.setDate(data);
        view.init();
      })
  },
  getReports: () => {
    return model.reports;
  },
  setDate: (d) => {
    return d.map(item => {
      const date = new Date(item.date_reported);
      const fixedDate = `${date.getMonth()}/${date.getDate()}/${date.getFullYear()}`
      item['date'] = fixedDate;
      return item;
    });
  }
}

let view = {
  init: () => {
    const load = document.querySelector('.loader');
    load.classList.add('hidden');

    view.loadMap();
  },
  /*this is a weird place to put this function but it technically writes a
    html script tag to the dom so i placed it in the view
    */
  loadMap: () => {
    const api = "AIzaSyDbESV5B5nIlPyzvqKs02R1HfcBC59RL8I"
    const js_file = document.createElement('script');
    js_file.type = 'text/javascript';
    /*
      within the <script> the callback, I cant seem to get it to execute a function
      written in a module pattern so i had to use a global function initMap to get things started
    */
    js_file.src = `https://maps.googleapis.com/maps/api/js?key=${api}&callback=initMap`;
    document.getElementsByTagName('head')[0].appendChild(js_file);
  }
}

controller.init();

//switch that assigns proper icon to the map marker
function iconSwitch(description){
  let icon;
  switch (description) {
    //person icons
    case "ASSAULT":
      icon = "images/person/Assault.png";
      break;
    case "WEAPON":
      icon = "images/person/DriveBy.png";
      break;
    case "DISPUTE":
      icon = "images/person/DriveBy.png";
      break;
    case "HOMICIDE":
      icon = "images/person/Homicide.png";
      break;
    case "ROBBERY":
      icon = "images/person/Robbery.png";
      break;
    case "THREATS":
      icon = "images/person/Threats.png";
      break;

      //drugs and vice icons
    case "LIQUOR VIOLATION":
      icon = "images/drugsAndVice/Liquor Violation.png";
      break;
    case "NARCOTICS":
      icon = "images/drugsAndVice/Narcotics.png";
      break;
    case "OTHER VICE":
      icon = "images/drugsAndVice/Other Vice.png";
      break;
    case "PROSTITUTION":
      icon = "images/drugsAndVice/Prostitution.png";
      break;
    case "OBSTRUCT":
      icon = "images/drugsAndVice/Stay Out of Area of Drugs.png";
      break;
    case "STAY OUT OF AREA OF PROSTITUTION":
      icon = "images/drugsAndVice/Stay Out of Area of Prostitution.png";
      break;

      //property theft and crime
    case "BIKE THEFT":
      icon = "images/propertyTheftAndCrime/Bike Theft.png";
      break;
    case "THEFT OF SERVICES":
      icon = "images/propertyTheftAndCrime/Other Property.png";
      break;
    case "STOLEN PROPERTY":
      icon = "images/propertyTheftAndCrime/Pickpocket.png";
      break;
    case "LOST PROPERTY":
      icon = "images/propertyTheftAndCrime/Fraud and Financial.png";
      break;
    case "EMBEZZLE":
      icon = "images/propertyTheftAndCrime/Fraud and Financial.png";
      break;
    case "EXTORTION":
      icon = "images/propertyTheftAndCrime/Fraud and Financial.png";
      break;
    case "BURGLARY":
      icon = "images/propertyTheftAndCrime/Burglary.png";
      break;
    case "CAR PROWL":
      icon = "images/propertyTheftAndCrime/Car Prowl.png";
      break;
    case "FRAUD":
      icon = "images/propertyTheftAndCrime/Fraud and Financial.png";
      break;
    case "COUNTERFEIT":
      icon = "images/propertyTheftAndCrime/Other Property.png";
      break;
    case "MAIL THEFT":
      icon = "images/propertyTheftAndCrime/Mail Theft.png";
      break;
    case "OTHER PROPERTY":
      icon = "images/propertyTheftAndCrime/Other Property.png";
      break;
    case "PROPERTY DAMAGE":
      icon = "images/propertyTheftAndCrime/Property Damage.png";
      break;
    case "PICKPOCKET":
      icon = "images/propertyTheftAndCrime/Pickpocket.png";
      break;
    case "SHOPLIFTING":
      icon = "images/propertyTheftAndCrime/Shoplifting.png";
      break;
    case "VEHICLE THEFT":
      icon = "images/propertyTheftAndCrime/Vehicle Theft.png";
      break;

      //transportation icons
    case "DUI":
      icon = "images/transportation/DUI.png";
      break;
    case "HARBOR":
      icon = "images/transportation/Harbor.png";
      break;
    case "METRO":
      icon = "images/transportation/Metro.png";
      break;
    case "TRAFFIC":
      icon = "images/transportation/Traffic.png";
      break;

      //misc icons
    case "ANIMAL COMPLAINT":
      icon = "images/misc/Animal Complaint.png";
      break;
    case "VIOLATION OF COURT ORDER":
      icon = "images/misc/Disorderly Conduct.png";
      break;
    case "WARRANT ARREST":
      icon = "images/misc/Arrest.png";
      break;
    case "DISORDERLY CONDUCT":
      icon = "images/misc/Disorderly Conduct.png";
      break;
    case "DISTURBANCE":
      icon = "images/misc/Disturbance.png";
      break;
    case "FALSE ALARM":
      icon = "images/misc/False Alarm.png";
      break;
    case "FALSE REPORT":
      icon = "images/misc/False Alarm.png";
      break;
    case "ILLEGAL DUMPING":
      icon = "images/misc/Illegal Dumping.png";
      break;
    case "INJURY":
      icon = "images/misc/Injury.png";
      break;
    case "TRESPASS":
      icon = "images/misc/Trespass.png";
      break;
    case "BURGLARY-SECURE PARKING-RES":
      icon = "images/misc/Unsafe Conditions.png";
      break;
    default:
      icon = "images/drugsAndVice/Other Vice.png"
  }
  return icon;
}
