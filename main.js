const API_KEY = "replace_with_your_api_key";

const createElement = (tag) => document.createElement(tag);
const getElement = (id) => document.getElementById(id);

const elements = {
  baseCurrencyInput: getElement("baseCurrencyInput"),
  baseCurrencyOptions: getElement("baseCurrencyOptions"),
  targetCurrencyInput: getElement("targetCurrencyInput"),
  targetCurrencyOptions: getElement("targetCurrencyOptions"),
  amountInput: getElement("amountInput"),
  convertBtn: getElement("convertBtn"),
  resultDiv: getElement("resultDiv"),
  swapBtn: getElement("swapBtn"),
  resetBtn: getElement("resetBtn"),
  modalCloseBtn: getElement("modalCloseBtn"),
  dialog: getElement("instructions"),
};

const currencies = [
  { code: "ARS", name: "Argentine Peso" },
  { code: "AUD", name: "Australian Dollar" },
  { code: "BCH", name: "Bitcoin Cash" },
  { code: "BGN", name: "Bulgarian Lev" },
  { code: "BNB", name: "Binance Coin" },
  { code: "BRL", name: "Brazilian Real" },
  { code: "BTC", name: "Bitcoin" },
  { code: "CAD", name: "Canadian Dollar" },
  { code: "CHF", name: "Swiss Franc" },
  { code: "CNY", name: "Chinese Yuan" },
  { code: "CZK", name: "Czech Republic Koruna" },
  { code: "DKK", name: "Danish Krone" },
  { code: "DOGE", name: "Dogecoin" },
  { code: "DZD", name: "Algerian Dinar" },
  { code: "ETH", name: "Ethereum" },
  { code: "EUR", name: "Euro" },
  { code: "GBP", name: "British Pound Sterling" },
  { code: "HKD", name: "Hong Kong Dollar" },
  { code: "HRK", name: "Croatian Kuna" },
  { code: "HUF", name: "Hungarian Forint" },
  { code: "IDR", name: "Indonesian Rupiah" },
  { code: "ILS", name: "Israeli New Sheqel" },
  { code: "INR", name: "Indian Rupee" },
  { code: "ISK", name: "Icelandic Króna" },
  { code: "JPY", name: "Japanese Yen" },
  { code: "KRW", name: "South Korean Won" },
  { code: "LTC", name: "Litecoin" },
  { code: "MAD", name: "Moroccan Dirham" },
  { code: "MXN", name: "Mexican Peso" },
  { code: "MYR", name: "Malaysian Ringgit" },
  { code: "NOK", name: "Norwegian Krone" },
  { code: "NZD", name: "New Zealand Dollar" },
  { code: "PHP", name: "Philippine Peso" },
  { code: "PLN", name: "Polish Zloty" },
  { code: "RON", name: "Romanian Leu" },
  { code: "RUB", name: "Russian Ruble" },
  { code: "SEK", name: "Swedish Krona" },
  { code: "SGD", name: "Singapore Dollar" },
  { code: "THB", name: "Thai Baht" },
  { code: "TRY", name: "Turkish Lira" },
  { code: "TWD", name: "New Taiwan Dollar" },
  { code: "USD", name: "US Dollar" },
  { code: "XRP", name: "Ripple" },
  { code: "ZAR", name: "South African Rand" }
  ];


let baseCurrency = null;
let targetCurrency = null;

const createApiUrl = () => `https://exchange-rates.abstractapi.com/v1/convert?api_key=${API_KEY}&base=${baseCurrency.code}&target=${targetCurrency.code}&base_amount=${elements.amountInput.value}`;

const filterOptions = (searchTerm, currencyOptions) => currencyOptions.filter(currency =>
  currency.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
  currency.code.toLowerCase().includes(searchTerm.toLowerCase())
);

const updateOptionsList = (inputElement, optionsList, currencyOptions) => {
  const searchTerm = inputElement.value;
  const filteredOptions = filterOptions(searchTerm, currencyOptions);
  optionsList.innerHTML = "";

  filteredOptions.forEach(currency => {
    const liElement = createElement("li");
    liElement.textContent = `${currency.name} (${currency.code})`;
    liElement.classList.add("option");
    liElement.addEventListener("click", () => selectOption(inputElement, currency));
    optionsList.appendChild(liElement);
  });

  optionsList.style.display = filteredOptions.length ? "inline-block" : "none";
};

const selectOption = (inputElement, currency) => {
  inputElement.value = `${currency.name} (${currency.code})`;

  if (inputElement.id === "baseCurrencyInput") {
    baseCurrency = currency;
  } else if (inputElement.id === "targetCurrencyInput") {
    targetCurrency = currency;
  }

  inputElement.nextElementSibling.style.display = "none";
};

const handleDocumentClick = (event, inputElement, optionsList) => {
  const isClickInside = inputElement.contains(event.target) || optionsList.contains(event.target);
  if (!isClickInside) {
    optionsList.style.display = "none";
  }
};

const convertCurrency = () => {
  const amount = parseFloat(elements.amountInput.value);
  if (isNaN(amount) || amount <= 0 || !baseCurrency || !targetCurrency) {
    elements.resultDiv.innerHTML = "<p>Invalid input. Please enter a valid amount and select both base and target currencies.</p>";
    elements.resultDiv.style.cssText = "display: block; color: orangered;";
    return;
  }

  fetch(createApiUrl())
    .then(response => response.json())
    .then(data => {
      const convertedAmount = data.converted_amount.toFixed(2);
      const exchangeRate = data.exchange_rate.toFixed(4);

      elements.resultDiv.innerHTML =
        `<p>Exchange rate:</p>
        <p>1 ${baseCurrency.code} = ${exchangeRate} ${targetCurrency.code}</p>
        <hr>
         <p><strong>Result:</strong></p>
         <h2>${amount} ${baseCurrency.code} = ${convertedAmount} ${targetCurrency.code}</h2>`;

      elements.resultDiv.style.cssText = "display: block; color: inherit;";
    })
    .catch(error => {
      elements.resultDiv.innerHTML = "<p>Error fetching conversion rate. Please try again later.</p>";
      elements.resultDiv.style.cssText = "display: block; color: orangered;";
      console.error(error);
    });
};

const swapCurrencies = () => {
  const temp = baseCurrency;
  baseCurrency = targetCurrency;
  targetCurrency = temp;

  elements.baseCurrencyInput.value = baseCurrency ? `${baseCurrency.name} (${baseCurrency.code})` : "";
  elements.targetCurrencyInput.value = targetCurrency ? `${targetCurrency.name} (${targetCurrency.code})` : "";

  elements.resultDiv.innerHTML = "";
  elements.resultDiv.style.display = "none";
};

elements.resetBtn.addEventListener("click", () => {
  [baseCurrency, targetCurrency] = [null, null];
  elements.amountInput.value = "";
  elements.baseCurrencyInput.value = "";
  elements.targetCurrencyInput.value = "";
  elements.resultDiv.innerHTML = "";
  elements.resultDiv.style.display = "none";
});

const inputElements = [elements.baseCurrencyInput, elements.targetCurrencyInput];

inputElements.forEach(inputEl => {
  inputEl.addEventListener("input", () => updateOptionsList(inputEl, inputEl.nextElementSibling, currencies));
  inputEl.addEventListener("focus", () => updateOptionsList(inputEl, inputEl.nextElementSibling, currencies));
});

document.addEventListener("click", (event) => {
  inputElements.forEach((inputEl) => handleDocumentClick(event, inputEl, inputEl.nextElementSibling));
});

elements.convertBtn.addEventListener("click", convertCurrency);
elements.swapBtn.addEventListener("click", swapCurrencies);
elements.modalCloseBtn.addEventListener("click", () => {
  elements.dialog.close();
});