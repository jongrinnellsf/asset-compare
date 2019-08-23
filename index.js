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
        $('#results-list').append(
        `<li id= "${responseJson.data[i].symbol}" class="equity"><img src="assets/c2.png">
        <h4>${responseJson.data[i].name} (${responseJson.data[i].symbol})</h4>
        <p class="cp">Price: ${responseJson.data[i].price} ${responseJson.data[i].currency}</p>
        </li>`)
    }; 
  $('#asset-list').removeClass('hidden');
}

function appendStockResults(responseJson) {
    const newObj = Object.values(responseJson.history);
    const firstPrice = newObj[0];
    const lastPrice = newObj[newObj.length-1];
    console.log(`this is the last price: ${lastPrice.close}`);
    const name = responseJson.name;
    parseFloat(firstPrice.close, lastPrice.close);
    if ($('.equity').last().attr('id') === name) {
        addData(name, performance(firstPrice.close, lastPrice.close), 'rgb(33, 206, 153, 0.4)');
        if (performance(firstPrice.close, lastPrice.close).includes('-')) {
            $('.equity').last().append(
            `<p class="loss">1 yr: <i class="fas fa-caret-down"></i><span id="${performance(firstPrice.close, lastPrice.close)}"> ${performance(firstPrice.close, lastPrice.close)}</span>%</p>
            <button id="deleteAsset"><i class="fas fa-times"></i></button>`)
        }
        else { 
            $('.equity').last().append(
            `<p class="gain">1 yr: <i class="fas fa-caret-up"></i><span id="${performance(firstPrice.close, lastPrice.close)}"> +${performance(firstPrice.close, lastPrice.close)}</span>%</p>
            <button id="deleteAsset"><i class="fas fa-times"></i></button>`)
        }
    }
} 


function displayCryptoResults(responseJson) {
    console.log(responseJson);
    const cryptoReturn = responseJson.data.roi_data.percent_change_last_1_year.toFixed(2);
    const currentPrice = responseJson.data.market_data.price_usd.toFixed(2);
    const symbol = responseJson.data.symbol;
    if (cryptoReturn.includes('-')) {
        $('#results-list').append(
        `<li id = "${symbol}"><img src="assets/s2.png"><h4>${responseJson.data.name} (${symbol})</h4>
        <p class="cp"> Price: ${currentPrice} USD</p>
        <p class="loss">1 yr: <i class="fas fa-caret-down"></i><span id="${cryptoReturn}"> ${cryptoReturn}%</span></p>
        <button id="deleteAsset"><i class="fas fa-times"></i></button>
        </li>`)
    }
    else { 
        $('#results-list').append(
        `<li id = "${symbol}"><img src="assets/s2.png"><h4>${responseJson.data.name} (${responseJson.data.symbol})</h4>
        <p class="cp"> Price: ${currentPrice} USD</p>
        <p class="gain">1 yr: <i class="fas fa-caret-up"></i><span id="${cryptoReturn}"> +${cryptoReturn}%</span></p>
        <button id="deleteAsset"><i class="fas fa-times"></i></button>
        </li>`)
    }
    addData(symbol, cryptoReturn, 'rgb(75, 0, 130, 0.4)'); 
    $('#asset-list').removeClass('hidden');
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
            label: 'annual % return',
            data: [],
            backgroundColor: [],
            borderColor: [],
            borderWidth: 0
        }],
    },
    options: {
        resonsive: true,
        maintainAspectRatio: false,
        legend: {
            labels: {
                defaultFontFamily: "sans serif",
            }
        },
        scales: {
            yAxes: [{
                ticks: {
                    beginAtZero: true,
                    callback: function(value, index, values) {
                        return value + '%';
                    }
                },
                gridLines: {
                    color: "transparent",
                    display: true,
                    drawBorder: false,
                    zeroLineColor: "#ccc",
                    zeroLineWidth: 1
                }      
            }],
            xAxes: [{
                gridLines: {
                    color: "transparent"
                }
            }]
        }
    }
});

function addData(label, data, color) {
    myChart.data.labels.push(label);
    myChart.data.datasets.forEach(dataset => dataset.data.push(data));
    myChart.data.datasets.forEach(dataset => dataset.backgroundColor.push(color));
    myChart.update();
}

function handleDeleteItemClicked() {
    $('#results-list').on('click', '#deleteAsset', event =>{
    deleteItemClicked();
    });
}

function deleteItemClicked() {
    const id = $(event.target).closest('li').attr('id');
    const num = $(event.target).closest('li').find('p > span').attr('id');
    const labelIndex = myChart.data.labels.findIndex(item => item === id)
    myChart.data.labels.splice(labelIndex, 1);
    const valueIndex = myChart.data.datasets[0].data.findIndex(item => item === num)
    myChart.data.datasets[0].data.splice(valueIndex, 1);
    myChart.data.datasets[0].backgroundColor.splice(valueIndex, 1);
    myChart.update();
    $(event.target).closest('li').remove();
}

function noSpaces() {
    $('form').on('keypress', function(event) {
        if (event.which == 32)
            return false;
    });
};

function watchForm() {
    noSpaces();
    $('#asset-form').submit(event => {
        event.preventDefault();
        $('#js-error-message').empty();
        const stock = $('#stock-search-term').val();
        const crypto = $('#crypto-search-term').val();
        if (stock.length > 0) {
            getStockData(stock);
            getHistoricalStockData(stock);
        }
        if (crypto.length > 0){
            getCryptoData(crypto);
        }
        $('#stock-search-term, #crypto-search-term').val("");
  });
}

$(watchForm);
$(handleDeleteItemClicked)

