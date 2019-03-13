const https = require('https');


// for (let lat = 24; lat <= 50; lat += .25) {
//   for (let lon = -125; lon <= -65; lon += .25) {
async function doChevron() {
  let total = 0;
  for (let lat = 42; lat <= 46; lat += .25) {
    console.log(`\n\nLat - ${lat}\n------------------\n`);
    for (let lon = -125; lon <= -116; lon += .25) {
      await new Promise(function (resolve, reject) {
        let data = '';
        https.get(`https://www.chevronwithtechron.com/webservices/ws_getChevronTexacoNearMe_r2.aspx?lat=${lat}&lng=${lon}&radius=35`, (res) => {
          res.on('data', (d) => {
            data += d;
          });

          res.on('end', function () {
            const d = JSON.parse(data);
            let count = 0;
            for (let s of d.stations) {

              count++;
            }

            total += count;
            resolve(count);
          });

        }).on('error', (e) => {
          console.error('error', e);
        });
      });
    }
  }
  console.log('total', total);
}

doChevron();




