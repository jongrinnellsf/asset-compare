'use strict';

const apiKey = 'dVeg7VQM1O9f0aYslbducBwQ6HyhY6byxkvuZBJ1Tkl4FVZtB58xgtNmOHte'; 
const stockURL = 'https://api.worldtradingdata.com/api/v1/';
const cryptoURL = 'https://data.messari.io/api/v1/assets/';

function formatQueryParams(params) {
  const queryItems = Object.keys(params)
    .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
  return queryItems.join('&');
}

function displayStockResults(responseJson) {
  console.log(responseJson);
    for (let i = 0; i < responseJson.data.length; i++){
        $('#stocks-results-list').append(
        `<li id= "${responseJson.data[i].symbol}"><h4>${responseJson.data[i].name} (${responseJson.data[i].symbol})</h4>
        <p class="cp">Current price: ${responseJson.data[i].price} ${responseJson.data[i].currency}</p>
        </li>`)
    }
  $('#stocks').removeClass('hidden');
}

function appendStockResults(responseJson) {
    const newObj = Object.values(responseJson.history);
    const firstPrice = newObj[0];
    const lastPrice = newObj[newObj.length-1];
    const name = responseJson.name;
    parseFloat(firstPrice.close, lastPrice.close);
    if (performance(firstPrice.close, lastPrice.close).includes('-')) {
        $('#stocks-results-list li').last('li').append(
        `<p class="loss">1 year return: <span id="${performance(firstPrice.close, lastPrice.close)}">${performance(firstPrice.close, lastPrice.close)}</span>%</p>
        <button id="deleteAsset">
        <div class="button-label">Remove</div>
        </button>`)
    }
    else { 
        $('#stocks-results-list li').last('li').append(
        `<p class="gain">1 year return: +<span id="${performance(firstPrice.close, lastPrice.close)}">${performance(firstPrice.close, lastPrice.close)}</span>%</p>
        <button id="deleteAsset">
        <div class="button-label">Remove</div>
        </button>`)
    }
    addData(name, performance(firstPrice.close, lastPrice.close));
}   

function displayCryptoResults(responseJson) {
    console.log(responseJson);
    const cryptoReturn = responseJson.data.roi_data.percent_change_last_1_year.toFixed(2);
    const currentPrice = responseJson.data.market_data.price_usd.toFixed(2);
    const symbol = responseJson.data.symbol;
    if (cryptoReturn.includes('-')) {
        $('#crypto-results-list').append(
        `<li id = "${symbol}"><h4>${responseJson.data.name} (${symbol})</h4>
        <p class="cp"> Current price: ${currentPrice} USD</p>
        <p class="loss">1 year return: <span id="${cryptoReturn}">${cryptoReturn}%</span></p>
        <button id="deleteAsset">
        <div class="button-label">Remove</div>
        </button>
        </li>`)
    }
    else { 
        $('#crypto-results-list').append(
        `<li id = "${symbol}"><h4>${responseJson.data.name} (${responseJson.data.symbol})</h4>
        <p class="cp"> Current price: ${currentPrice} USD</p>
        <p class="gain">1 year return: +<span id="${cryptoReturn}">${cryptoReturn}%</span></p>
        <button id="deleteAsset">
        <div class="button-label">Remove</div>
        </button>
        </li>`)
    }
    addData(symbol, cryptoReturn); 
    $('#crypto').removeClass('hidden');
}

function getStockData(query) {
  const params = {
    symbol: query,
    api_token: apiKey,
  };
  const queryString = formatQueryParams(params)
  const url = stockURL + 'stock?' + queryString;
  console.log(url);
  fetch(url)
    .then(response => {
      if (response.ok) {
        return response.json();
      }
      throw new Error(response.statusText);
    })
    .then(responseJson => displayStockResults(responseJson))
    .catch(err => {
      $('#js-error-message').text(`Something went wrong: ${err.message}`);
    });
}

//calculcate annual percent return for stocks (don't need for crypto, because API has that data)
function performance (now, past) {
    const performancePercent = ((now - past)/past * 100);
    return performancePercent.toFixed(2);
};

//calculcate ISO date for 1 year ago, for date_from parameter in getHistoricalStockData
function minusOneYear() {
    let startDate = new Date();
    startDate.setFullYear(startDate.getFullYear() - 1)
    let oneYearAgo = startDate.toISOString().slice(0, 10);
    return oneYearAgo;
}

//set the ISO date for today, for date_to paramter is getHistoricalStockData
function today() {
    let startDate = new Date();
    startDate.setFullYear(startDate.getFullYear())
    let todaysDate = startDate.toISOString().slice(0, 10);
    return todaysDate;
}

function getHistoricalStockData(query) {
    const params = {
      symbol: query,
      api_token: apiKey,
      sort: 'newest',
      date_to: today(),
      date_from: minusOneYear(),
    };
    const queryString = formatQueryParams(params)
    const url = stockURL + 'history?' + queryString;
    console.log(url);
    fetch(url)
    .then(response => {
        if (response.ok) {
          return response.json();
        }
        throw new Error(response.statusText);
    })
    .then(responseJson => appendStockResults(responseJson))
    .catch(err => {
        $('#js-error-message').text(`Something went wrong: ${err.message}`);
    });
}

function getCryptoData(query) {
    const url = cryptoURL + query + '/metrics'
    console.log(url);
    fetch(url)
    .then(response => {
    if (response.ok) {
        return response.json();
    }
    throw new Error(response.statusText);
    })
    .then(responseJson => displayCryptoResults(responseJson))
    .catch(err => {
    $('#js-error-message').text(`Something went wrong: ${err.message}`);
    });
}

//chartJS 
const ctx = document.getElementById('myChart').getContext('2d');
const myChart = new Chart(ctx, {
    type: 'bar',
    data: {
        labels: [],
        datasets: [{
            label: 'Annual percent return',
            data: [],
            backgroundColor: [
                'rgba(255, 99, 132, 0.2)',
                'rgba(54, 162, 235, 0.2)',
                'rgba(255, 206, 86, 0.2)',
                'rgba(75, 192, 192, 0.2)',
                'rgba(153, 102, 255, 0.2)',
                'rgba(255, 159, 64, 0.2)'
            ],
            borderColor: [
                'rgba(255, 99, 132, 1)',
                'rgba(54, 162, 235, 1)',
                'rgba(255, 206, 86, 1)',
                'rgba(75, 192, 192, 1)',
                'rgba(153, 102, 255, 1)',
                'rgba(255, 159, 64, 1)'
            ],
            borderWidth: 0
        }]
    },
    options: {
        resonsive: true,
        maintainAspectRatio: false,
        scales: {
            yAxes: [{
                ticks: {
                    beginAtZero: true,
                    callback: function(value, index, values) {
                        return value + '%';
                    }
                }
            }]
        }
    }
});

function addData(label, data) {
    myChart.data.labels.push(label);
    myChart.data.datasets.forEach(dataset => dataset.data.push(data));
    myChart.update();
}

function handleDeleteItemClicked() {
    $('#stocks-results-list, #crypto-results-list').on('click', '.button-label', event =>
    {
    const id = $(event.target).closest('li').attr('id');
    const num = $(event.target).closest('li').find('p > span').attr('id');
    const labelIndex = myChart.data.labels.findIndex(item => item === id)
    myChart.data.labels.splice(labelIndex, 1);
    const valueIndex = myChart.data.datasets[0].data.findIndex(item => item === num)
    myChart.data.datasets[0].data.splice(valueIndex, 1);
    myChart.update();
    $(event.target).closest('li').empty();
    });
}

function noSpaces() {
    $('form').on('keypress', function(event) {
        if (event.which == 32)
            return false;
    });
};

function watchStockForm() {
    noSpaces();
    $('#stock-form').submit(event => {
        event.preventDefault();
        $('#js-error-message').empty();
        const symbol = $('#stock-search-term').val();
        getStockData(symbol);
        getHistoricalStockData(symbol);
  });
}

function watchCryptoForm() {
    noSpaces();
    $('#crypto-form').submit(event => {
        event.preventDefault();
        $('#js-error-message').empty();
        const symbol = $('#crypto-search-term').val();
        getCryptoData(symbol);
    });
}

$(watchStockForm);
$(watchCryptoForm);
$(handleDeleteItemClicked)

