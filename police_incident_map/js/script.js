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
    const marker = mapModule.makeMarker(map, myLatLng);
    const content = mapModule.makeContent(item);

    //unable to put add listener method to map module due to error with popup window
    marker.addListener('click', (e) => {

      const contentParent = document.querySelector('.content-parent');

      try {
        const removalNode = document.querySelector('.popup-tip-anchor');
        contentParent.removeChild(removalNode);
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
  getCoords: (latitude, longitude, location) => {
    let coords = {};
    (latitude && longitude) ?
    coords = new google.maps.LatLng(latitude, longitude):
      coords = new google.maps.LatLng(location.latitude, location.longitude);
    return coords;
  },
  makeMarker: (m, c) => {
    return new google.maps.Marker({
      position: c,
      map: m,
    });
  },
  makeContent: (data) => {
    return data.offense_type;
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
        model.reports = data;
        view.init();
      })
  },
  getReports: () => {
    return model.reports;
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