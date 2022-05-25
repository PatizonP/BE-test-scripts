const xmlrpc = require('@sklik/xml-rpc');
const http = require('http');
const _ = require('lodash');
const fs = require('fs');
const path = require('path');
const data = require('./data.json')

//Copy display options to https://regex101.com/ and paste this regexp \s(\w+[.\w]*): then uncheck "include full match in exported data" and then data.map(d=>d[0].content) paste to data.json

const client = xmlrpc.createClient({
  host: 'sortserver.sklik-master.dev.dszn.cz',//dev
  // host: 'sortserver-web',//prod
   port: 3367,
});

function callSortserver(displayOption) {
  return new Promise((resolve) => {
    client.methodCall(
      'gender.filter2',
      [
        { group:{ids: [114511159]}, dateFrom: new Date('2020-05-20T00:00:00.000Z'), dateTo: new Date('2022-05-20T00:00:00.000Z'), logUserId: 659675, user: { ids: [659675] } }, //dev
        // { ids: [3579625,3579631], logUserId: 675349, user: { ids: [750824] } }, //prod
        { limit: 1, offset: 0, sortColumns: ['id'], sortDirection: 'ASC' },
        {
          displayColumns: [displayOption]
        }
      ],
      (error, val) => {
        if(error || val.status !== 200){
          resolve({ displayOption, message: val.statusMessage })
        }

        resolve(null);
      }
    );
  });
}
const timer = (ms) => new Promise((res) => setTimeout(res, ms));

(async () => {
  console.log('Script started...');
  const results = [];
  const messages = [];

  let i = 1;
  for(name of data){

    const res = await callSortserver(name);

    console.log(res)

    if(res){
      results.push(name)
    }
    await timer(100);
    console.log(i);
    i++;
  }
 
  console.log('Saving results...');

  fs.writeFileSync(
    path.resolve(__dirname, 'results.json'),
    JSON.stringify(results)
  );

  console.log(
    'Results are saved in ' + path.resolve(__dirname, 'results.json')
  );

  console.log('Finished');
})();
