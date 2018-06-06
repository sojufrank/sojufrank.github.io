/*
  This grabs data from 2 api endpoints from data.seattle.gov.  1. list of cars sold at auction. 2. List of cars currently up for auction.
  The data is parsed, sorted, and displayed on a webpage and categories are collapasable upon click.
  data is organized via vehicle Make -> vehicle Model -> vehicle sold price.
  App is organized in a MVC (model, view, controller).
*/

let model = {
  init: () => {
    const uri1 = 'https://data.seattle.gov/resource/gh64-vd9r.json?$limit=50000';
    const uri2 = 'https://data.seattle.gov/resource/tqh5-8vm2.json?$limit=50000';

    /*
    fetch json data from rest api, parse and label with tenerary operator because
    promise.all does not recieve json in order sent.
    */
    Promise.all([model.apiCall(uri1, 'sold'), model.apiCall(uri2, 'forsale')])
      .then(res => {
        let data = {};
        (res[0][0] === 'sold') ? data['sold'] = res[0][1]: data['sold'] = res[1][1];
        (res[1][0] === 'forsale') ? data['forsale'] = res[1][1]: data['forsale'] = res[0][1];
        model.setCarsObj(data);
      })
      .then(res => view.init())
  },

  //main data objects
  carsObj: {
    'sold': {},
    'forsale': {}
  },
  countObj: {
    'sold': 0,
    'forsale': 0
  },

  //apicall for use in getting json data via promise.all in parallel
  apiCall: (url, filterType) => {
    return fetch(url)
      .then(res => res.json())
      .then(data => [filterType, data]);
  },

  //fill carsObj object
  setCarsObj: (data) => {
    let sold = data['sold'];
    let forsale = data['forsale'];

    //set car makes
    model.carsObj.sold = model.reduceCars(sold, 'make');
    model.carsObj.forsale = model.reduceCars(forsale, 'make');

    //set car models and insert cars into models via array
    model.setCarModels(forsale, 'forsale');
    model.setCarModels(sold, 'sold');

    //count cars
    model.setCarCount('forsale');
    model.setCarCount('sold');

    model.sortSoldPrice();
    model.setForsaleAverage();
  },

  //parse cars by model and push to carsObj
  setCarModels: (carData, type) => {
    carData.map(item => {
      const car = model['carsObj'][type][item.make][item.model];
      if (!model['carsObj'][type][item.make][item.model]) {
        model['carsObj'][type][item.make][item.model] = [];
      }
      model['carsObj'][type][item.make][item.model].push(item);

      //parse and set date object
      //sale date and retirement date
      if ('sale_date' in item) {
        item.sale_date = model.parseDate(item.sale_date);
      }
      if ('retirement_date' in item) {
        item.retirement_date = model.parseDate(item.retirement_date);
      }
    });
  },

  //returns parsed date object
  parseDate: (date) => {
    const d = new Date(date);
    const month = d.getMonth();
    const day = d.getDate();
    const year = d.getFullYear();
    const parsedDate = `${month+1} / ${day} / ${year}`;
    return parsedDate;
  },

  //add car make count to countObj
  setCarCount: (type) => {
    let count = 0;
    for (key in model['carsObj'][type]) {
      count++;
    }
    model['countObj'][type] = count;
  },

  //remove duplicates of car makes
  reduceCars: (carData, type) => {
    let obj = {};
    carData.map(item => item[type])
      .filter((elem, index, self) => index === self.indexOf(elem))
      .map(item => obj[item] = {});
    return obj;
  },

  //sort sold cars by price
  sortSoldPrice: () => {
    Object.keys(model.carsObj.sold).forEach(make => {
      Object.keys(model.carsObj.sold[make]).forEach(carModel => {

        //Math.round the car sale price. sort and return
        model.carsObj.sold[make][carModel].forEach(car => car.sale_price = Math.round(car.sale_price))
        model.carsObj.sold[make][carModel] = model.carsObj.sold[make][carModel].sort((a, b) => {
          if (parseInt(a.sale_price) > parseInt(b.sale_price)) {
            return 1;
          } else {
            return -1;
          }
        });
      })
    })
  },

  //get data from sold cars and obtain average selling price
  //add this data to forsale object
  setForsaleAverage: () => {
    let cars = model.carsObj.forsale;
    Object.keys(cars).forEach(make => {
      Object.keys(cars[make]).forEach(carModel => {
        
        try{
          cars[make][carModel].map(item => item['average_price'] = 1000)
        }
        catch (error){
          const car = model.carsObj.sold[make][carModel];
          if (car) {
            const arr = car.map(item => item.sale_price);
            const sum = arr.reduce((a, b) => a + b);
            const average = Math.round(sum / arr.length);
            cars[make][carModel].map(item => item['average_price'] = average)
          }
        }
      })
    })
  }
}

let controller = {
  init: () => {
    model.init();
  },
  getforsale: () => {
    return model.carsObj['forsale'];
  },
  getsold: () => {
    return model.carsObj['sold'];
  }
}

let view = {
  init: () => {
    const forsale = controller.getforsale();

    view.setButtons();
    view.writeApp(forsale)
  },

  //set click handlers on buttons to switch between sold and forsale data
  setButtons: () => {
    const soldButton = document.querySelector('#sold');
    const forsaleButton = document.querySelector('#forsale');
    const text = document.querySelector('#content-title-text');

    const forsaleData = controller.getforsale();
    const soldData = controller.getsold();
    document.querySelector('.makes-list').innerHTML = '';

    soldButton.addEventListener('click', (e) => {
      document.querySelector('.makes-list').innerHTML = '';
      view.writeApp(soldData);
      text.innerHTML = 'Vehicles previously sold at auction';
    });
    forsaleButton.addEventListener('click', (e) => {
      document.querySelector('.makes-list').innerHTML = '';
      view.writeApp(forsaleData);
      text.innerHTML = 'Vehicles currently for sale at auction';
    });
  },

  //method used to write the view
  writeApp: (type) => {
    view.writeMakes(type);
    view.writeModels(type);
    view.writeCars(type);
    view.writeCarInfo(type);
    view.clickHandlers();
  },

  //writes vehicle make to the document
  writeMakes:(data) => {
    const node = document.querySelector('.makes-list');

    node.innerHTML = `
        ${Object.keys(data).sort().map(item => {
          return `
            <div class="makes-container">
              <div class="makes-text skip">
                ${item}
              </div>
              <div class="drawer makes-drawer hidden" name="${item}" data-make="${item}"></div>
            </div>
          `
        }).join('')}
    `;
  },

  //writes vehicle model to the document
  writeModels: (data) => {
    const makes = document.querySelectorAll('.makes-drawer');
    makes.forEach(make => {
      const name = make.getAttribute('name');

      //write html node and fill it with vehicle model data from model.carsObj
      make.innerHTML = `
          ${Object.keys(data[name]).sort().map(item => {
            return `
              <div class="models-container">
                <div class="models-text skip">${item}</div>
                <div class="drawer models-drawer hidden" name="${item}" data-make="${make.dataset.make}" data-model="${item}"></div>
              </div>
            `
          }).join('')}
      `;
    })
  },

  //writes vehicle's to the document
  writeCars: (data) => {
    const models = document.querySelectorAll('.models-drawer');
    models.forEach(model => {
      const carMake = model.dataset.make;
      const carModel = model.dataset.model;

      //write html node and fill it with vehicle's data from model.carsObj
      model.innerHTML = `
          ${data[carMake][carModel].map((item, index) => {
            return `
              <div class="vehicle-container">
                <div class="vehicle-text skip">
                  ${item.description} :
                  ${item.sale_price? `sold price: `+item.sale_price: `average price: `+item.average_price}
                </div>
                <div class="drawer vehicle-drawer hidden" data-make="${carMake}" data-model="${carModel}" data-index="${index}"></div>
              </div>
            `
          }).join('')}
      `;
    });
  },

  //writes specific vehicle data
  writeCarInfo: (data) => {
    const vehicles = document.querySelectorAll('.vehicle-drawer');
    vehicles.forEach(vehicle => {
      const make = vehicle.dataset.make;
      const model = vehicle.dataset.model;
      const index = vehicle.getAttribute('data-index');
      const shortVariable = data[make][model][index];

      //writes all vehicle data into list nodes
      vehicle.innerHTML = `
        <div class="carInfo-container noHide">
          <table class="car-table noHide">
            ${Object.keys(shortVariable).map(item => {
              return `
                <tr class="noHide">
                  <td>${item.replace("_", " ")}: </td>
                  <td>${shortVariable[item]}</td>
                </tr>
              `
            }).join('')}
          </table>
        </div>
      `;
    })
  },

  //set click handlers to all vehicles makes, models
  clickHandlers: () => {
    const makes = document.querySelectorAll('.makes-text');
    const models = document.querySelectorAll('.models-text');
    const cars = document.querySelectorAll('.vehicle-text');

    view.setClick(makes);
    view.setClick(models);
    view.setClick(cars);

  },

  //sets specific behavior on click
  setClick: (arr) => {
    arr.forEach(item => {
      item.addEventListener('click', (e) => {
        e.stopPropagation();
        let domNode = e.target.nextElementSibling;

        if(domNode.classList.contains('hidden')){
          domNode.classList.remove('hidden')
        } else {
          domNode.classList.add('hidden');
          rec(domNode)
        }
      });

      /* recursive funtion to traverse dom and returning on if conditions
        upon release of stack, adds hidden class to any div with classList 'drawer'
      */
      function rec(data){

        if(data.classList.contains('noHide') || data.classList.contains('skip')) return;

        const arr = Array.from(data.children);

        arr.forEach(item => {
          rec(item);
          if(item.classList.contains('drawer')){
            item.classList.add('hidden');
          }
        })
      }
    });
  },
}

controller.init();
