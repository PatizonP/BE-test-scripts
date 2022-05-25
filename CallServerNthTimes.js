const xmlrpc = require('@sklik/xml-rpc');
const http = require('http');
const _ = require('lodash');
const fs = require('fs');
const path = require('path');

const client = xmlrpc.createClient({
  // host: 'sortserver.sklik-master.dev.dszn.cz',//dev
  host: 'sortserver-web',//prod
  port: 3367,
});

function callSortserver() {
  return new Promise((resolve) => {
    client.methodCall(
      'campaign.filter2',
      [
        // { ids: [3055622], logUserId: 659675, user: { ids: [659675] } }, //dev
        { ids: [3579625,3579631], logUserId: 675349, user: { ids: [750824] } }, //prod
        { limit: 1, offset: 0, sortColumns: ['name'], sortDirection: 'ASC' },
        {
          displayColumns: [
            'actualClicks',
            'adSelection',
            'budget.dayBudget',
            'capping.maxImpressions',
            'capping.maxImpressionsPeriod',
            'capping.minDelay',
            'capping.minDelayPeriod',
            'context',
            'contextNetwork',
            'createDate',
            'defaultPremiseId',
            'defaultPremiseMode',
            'deleted',
            'deviceDesktop',
            'deviceMobil',
            'deviceOther',
            'deviceTablet',
            'devices.deviceId',
            'devices.maxCpcMultiplier',
            'disableOnFakeNews',
            'draft',
            'endDate',
            'excludedSearchServices',
            'excludedUrls',
            'exhaustedDayBudget',
            'exhaustedTotalBudget',
            'floating',
            'fulltext',
            'guaranteed',
            'id',
            'isProduct',
            'name',
            'optimalBudget.clicksIncrease7d',
            'optimalBudget.exhaustedBudget7d',
            'optimalBudget.ish7d',
            'optimalBudget.optimalBudget7d',
            'order.businessId',
            'order.id',
            'order.name',
            'orderedStatusId',
            'overdraftEnabled',
            'paymentMethod',
            'phoneNumber',
            'premiseId',
            'products.maxCpcMultiplier',
            'products.productId',
            'regionalizationEnabled',
            'regions.id',
            'schedule',
            'scheduleEnabled',
            'sharedBudget.id',
            'simpleAds',
            'startDate',
            'status',
            'totalBudget',
            'totalClicks',
            'type',
            'videoFormat',
            'websites.maxCpcMultiplier',
            'websites.webId',
            'zboziPremiseBidding',
            'zboziPremiseId'
          ]
        }
      ],
      (error, val) => {
        if(error){
          console.log('Error',error);
        }

        resolve(_.pick(val, 'stats', 'totalCount', 'status'));
      }
    );
  });
}
const timer = (ms) => new Promise((res) => setTimeout(res, ms));

(async () => {
  console.log('Script started...');
  const results = [];

  for (let i = 0; i < 5; i++) {
    const result = await callSortserver();
    if (
      results.every(
        (val) => !_.isEqual(_.omit(val, 'numberOfResponses'), result)
      )
    ) {
      results.push(result);
    }

    results.forEach((res) => {
      if (_.isEqual(_.omit(res, 'numberOfResponses'), result)) {
        if (res.numberOfResponses) {
          res.numberOfResponses += 1;
        } else {
          res.numberOfResponses = 1;
        }
      }
    });

    await timer(200);
    console.log(i);
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
