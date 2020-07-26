//const geoNearBy = require("geo-nearby");

export class nearByRepository {

    findAll() {
        return new Promise(async (resolve, reject) => {
          try {
             const Geo = require('geo-nearby');
             const dataSet = [{ i: 'Perth', g: 3149853951719405}];
            const geo = new Geo(dataSet);

            const data= geo.nearBy(-33.87, 151.2, 5000);

            return resolve(data);
          } catch (e) {
            reject(e);
          }
        });
      }

}

