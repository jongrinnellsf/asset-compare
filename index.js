'use strict';

const apiKey = 'dVeg7VQM1O9f0aYslbducBwQ6HyhY6byxkvuZBJ1Tkl4FVZtB58xgtNmOHte'; 
const IexAPIkey = 'pk_91657a0b579f4a76b63293f0eedc0272';
const cryptoURL = 'https://data.messari.io/api/v1/assets/';
const stockURL = 'https://cloud.iexapis.com/v1/stock/';


function formatQueryParams(params) {
  const queryItems = Object.keys(params)
    .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
  return queryItems.join('&');
}

function displayStockResults(responseJson) {
    let marketCap = responseJson.marketCap.toFixed(2)
    console.log(responseJson);
        $('#results-list').append(
        `<li id= "${responseJson.symbol}"><img src="assets/c2.png">
        <h4>${responseJson.companyName} (${responseJson.symbol})</h4>
        <p>Current price: $${responseJson.latestPrice}</p>
        <p>Market cap: <span id="${marketCap}"> $${formatToUnits(marketCap, 2)}</span></p>
        <button id="deleteAsset"><i class="fas fa-times"></i></button>
        </li>`);
    $('#asset-list').removeClass('hidden');
    addData(responseJson.symbol, marketCap, 'rgb(33, 206, 153, 0.4)');
}

function displayCryptoResults(responseJson) {
    console.log(responseJson);
    const marketCap = responseJson.data.marketcap.current_marketcap_usd.toFixed(2);
    const symbol = responseJson.data.symbol;
    const price = responseJson.data.market_data.price_usd.toFixed(2);
        $('#results-list').append(
        `<li id = "${symbol}"><img src="assets/s2.png">
        <h4>${responseJson.data.name} (${symbol})</h4>
        <p>Current price: $${price}</p>
        <p>Market cap: <span id="${marketCap}"> $${formatToUnits(marketCap, 2)}</span></p>
        <button id="deleteAsset"><i class="fas fa-times"></i></button>
        </li>`);
    $('#asset-list').removeClass('hidden');
    addData(symbol, marketCap, 'rgb(75, 0, 130, 0.4)'); 
}

function getStockData(query) {
    const params = {
        token: IexAPIkey,
    };
    const queryString = formatQueryParams(params)
    const url = stockURL + query + '/quote?' + queryString
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
        $('#js-error-message').text(`Ah sorry, we could not find that asset. Please try again. `);
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
    $('#js-error-message').text(`Ah sorry, we could not find that asset. Please try again.`);
    });
}

//chartJS 
const ctx = document.getElementById('myChart').getContext('2d');
const myChart = new Chart(ctx, {
    type: 'bar',
    data: {
        labels: [],
        datasets: [{
            label: 'Market Cap',
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
                    callback: function formatToUnits(number) {
                        const abbrev = ['', 'K', 'M', 'B', 'T'];
                        const unrangifiedOrder = Math.floor(Math.log10(Math.abs(number)) / 3)
                        const order = Math.max(0, Math.min(unrangifiedOrder, abbrev.length -1 ))
                        const suffix = abbrev[order];
                        return '$' + (number / Math.pow(10, order * 3)) + suffix;
                    }
                },
                gridLines: {
                    color: "transparent",
                },      
            }],
            xAxes: [{
                gridLines: {
                    color: "transparent"
                }
            }]
        }
    }
});


function formatToUnits(number, precision) {
    const abbrev = ['', 'K', 'M', 'B', 'T'];
    const unrangifiedOrder = Math.floor(Math.log10(Math.abs(number)) / 3)
    const order = Math.max(0, Math.min(unrangifiedOrder, abbrev.length -1 ))
    const suffix = abbrev[order];
    return (number / Math.pow(10, order * 3)).toFixed(precision) + suffix;
}


function resetCenter() {
    let list = $('#results-list li')
    if (list.length === 0) {
        $('#asset-list').addClass("hidden");
    }
}

function addData(label, data, color) {
    myChart.data.labels.push(label);
    myChart.data.datasets.forEach(dataset => dataset.data.push(data));
    myChart.data.datasets.forEach(dataset => dataset.backgroundColor.push(color));
    myChart.update();
}

function handleDeleteItemClicked() {
    $('#results-list').on('click', '#deleteAsset', event =>{
    deleteItemClicked();
    resetCenter();
    });
}

function deleteItemClicked() {
    const id = $(event.target).closest('li').attr('id');
    const num = $(event.target).closest('li').find('p > span').attr('id');
    const labelIndex = myChart.data.labels.findIndex(item => item === id);
    myChart.data.labels.splice(labelIndex, 1);
    const valueIndex = myChart.data.datasets[0].data.findIndex(item => item === num);
    myChart.data.datasets[0].data.splice(valueIndex, 1);
    myChart.data.datasets[0].backgroundColor.splice(labelIndex, 1);
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
        }
        if (crypto.length > 0){
            getCryptoData(crypto);
        }
        $('#stock-search-term, #crypto-search-term').val("");
  });
}




$(watchForm);
$(handleDeleteItemClicked)
