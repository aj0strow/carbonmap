// constants

var AGENT = [
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_3)',
  'AppleWebKit/537.36 (KHTML, like Gecko)',
  'Chrome/35.0.1916.153 Safari/537.36',
].join(' ')

var HEADERS = {
  'accept-encoding': 'gzip,deflate,sdch',
  'accept-language': 'en-US,en;q=0.8',
  'cache-control': 'max-age=0',
  'connection': 'keep-alive',
  'user-agent': AGENT,
}

// dependencies

var request = require('request');
var moment = require('moment');
var cheerio = require('cheerio');
var qs = require('querystring');
var fs = require('fs');

var jar = request.jar()
var req = request.defaults({
  jar: jar,
  headers: HEADERS
})

module.exports = scrape

function scrape (errorHandler) {
  var accounts = []; // the list of accounts from the index page
  var account = {};  // a single account from that list
  var download_link;  
  var download_form;
  var form;
  var i;

  function startDownloadProcedureForNextAccount() {
    console.log("Progress : " + (i+1) + "/" + accounts.length);
    account = accounts[i];
    if(i < accounts.length) next(steps.selectAccount);
    i++;
  }

  function saveFile(res) {
    var file = fs.openSync(
      account.account_no + '-' +
      moment().subtract('1', 'month').startOf('month').format('YYYY-MM') +
      '.csv', 'w');
    fs.writeSync(file, res.body);
  }

  var steps = {

    // Simulate browsing to the login page to obtain the initial cookies
    getLoginPage: function () {
      console.log('1. Login Page ');
      var url = 'https://my.utilitieskingston.com/app/login.jsp';
      req({
        method: 'GET',
        url: url
      }, function (e, res) {
        if (e) return errorHandler(e);
        if (res.statusCode !== 200) throw res;
        var $ = cheerio.load(res.body);
        console.log("HTML PAGE TITLE : " + $('title').text() + '\n');
        next(steps.login);
      });
    },

    // POST user + id to login
    login: function () {
      console.log('2. Submit Form');
      var url = 'https://my.utilitieskingston.com/app/capricorn?para=index';
      req({
        method: 'POST',
        url: url,
        form: {
          'accessCode': 'gm@ksh.coop',
          'password': '397brock'
        }
      }, function (e, res) {
        if (e) return errorHandler(e);
        if (res.statusCode !== 200) throw res;
        var $ = cheerio.load(res.body);
        console.log("HTML PAGE TITLE : " + $('title').text() + '\n');
        next(steps.getListOfAccounts);
      });

    },

    // Browse to the accounts page and scrape the table into an array of accounts
    getListOfAccounts: function () {
      console.log('3. Go To Index');
      var url = 'https://my.utilitieskingston.com/app/capricorn';
      req({
        method: 'POST',
        url: url,
        form: {
          'para': 'selectAccount',
          'userAction': 'search',
          'switchAccount': 'Switch Account'
        }
      }, function (e, res) {

        if (e) return errorHandler(e);
        if (res.statusCode !== 200) throw res;
        var $ = cheerio.load(res.body);
        console.log("HTML PAGE TITLE : " + $('title').text() + '\n');
        var column_map = {
          1: 'account_no', // second column => account_no, etc. 
          2: 'meter_no',
          3: 'address',
        };
        $('table table table table table') // find the table in the page 
        .find('tr').each(function() {      // then, for each rows in that table
          var row = {};
          $(this).find('td').each(function(j) {  
            if(j === 1) row.url = $(this).find('a').attr('href'); // extract the link for the account
            if(column_map[j])
              row[column_map[j]] = $(this).text().trim(); // store the info from the table in the object
          });
          if (row['address'] && row['url'])
            accounts.push(row);  // when done with that row, push it to the accounts array
        }) ;
        i = 0; 
        startDownloadProcedureForNextAccount(); 
      });
    },

    // select an account by following the extracted link from the table 
    selectAccount: function () {
      console.log('4. Select Account');
      console.log(account)
      var url = 'https://my.utilitieskingston.com' + account['url'];
      req({
        method: 'GET',
        url: url,
      }, function (e, res) {
        if (e) return errorHandler(e);
        if (res.statusCode !== 200) throw res;
        var $ = cheerio.load(res.body);
        console.log("HTML PAGE TITLE : " + $('title').text() + '\n');
        next(steps.getTimeOfUsePage);
      });
    },

    // Follow the corresponding My Time Of Use Data link
    getTimeOfUsePage: function () {
      console.log('5. Time Of Use Data');
      var url = 'https://my.utilitieskingston.com/app/capricorn?';
      url += qs.stringify({
        para: 'greenButtonPrompt'
      });
      req({
        method: 'GET',
        url: url,
      }, function (e, res) {
        if (e) return errorHandler(e);
        if (res.statusCode !== 200) throw res;
        var $ = cheerio.load(res.body);
        console.log("HTML PAGE TITLE : " + $('title').text() + '\n');
        download_form = $('form[name="downloadGB"]');
        next(steps.clickDownloadButton);
      });
    },

    // Click the download button 
    // This generates a link in the downloadData2Spreadsheet form action.
    // Extract that download_link
    clickDownloadButton: function () {
      console.log('6. Click the button');
      var url = 'https://my.utilitieskingston.com/app/capricorn?';
      url += qs.stringify({
        para: 'greenButtonDownload'
      });

      var date_to = moment().startOf('month');
      var date_from = moment().subtract('1', 'month').startOf('month'); 
      form = {
        para: 'greenButtonDownload',
        downloadConsumption: 'Y', // Y for XLS, comment out for XLS
        userAction: '',
        hourlyOrDaily: 'Hourly',

        GB_iso_fromDate: date_from.format("YYYY-MM-DD"),
        GB_fromDate: date_from.format("DD/MM/YYYY"),
        GB_day_from: date_from.format("DD"),
        GB_month_from: date_from.format("MM"),
        GB_year_from: date_from.format("YYYY"),

        GB_iso_toDate: date_to.format("YYYY-MM-DD"),
        GB_toDate: date_to.format("DD/MM/YYYY"),
        GB_day_to: date_to.format("DD"),
        GB_month_to: date_to.format("MM"),
        GB_year_to: date_to.format("YYYY"),
      };

      req({
        method: 'POST',
        url: url,
        form: form
      }, function (e, res) {
        if (e) return errorHandler(e);
        if (res.statusCode !== 200) throw res;
        var $ = cheerio.load(res.body);
        console.log("HTML PAGE TITLE : " + $('title').text() + '\n');
        download_link = $('form[name="downloadData2Spreadsheet"]').attr('action');
        next(steps.download);
      });
    },

    // use the download link
    download: function () {
      console.log('7. Download Xls');
      var url = 'https://my.utilitieskingston.com' + download_link; 
      req({
        method: 'POST',
        url: url,
        form: form
      }, function (e, res) {
        if (e) return errorHandler(e);
        if (res.statusCode !== 200) throw res;
        console.log("URL : " + download_link + '\n');
        saveFile(res); 
        startDownloadProcedureForNextAccount();
      });
    }
  };

  steps.getLoginPage();
};

function next (cb) {
  setTimeout(cb, Math.floor(Math.random() * 500 + 500));
}
