const API_KEY = "paste_your_api_key_here";
const API_URL = "https://exchange-rates.abstractapi.com/v1/convert";

let baseCurrency = null;
let targetCurrency = null;
const history = JSON.parse(localStorage.getItem("currencifyHistory")) || [];

const el = {
  amount: document.getElementById("amountInput"),
  baseInput: document.getElementById("baseCurrencyInput"),
  baseList: document.getElementById("baseCurrencyOptions"),
  targetInput: document.getElementById("targetCurrencyInput"),
  targetList: document.getElementById("targetCurrencyOptions"),
  btnConvert: document.getElementById("convertBtn"),
  btnSwap: document.getElementById("swapBtn"),
  btnReset: document.getElementById("resetBtn"),
  btnHistory: document.getElementById("historyBtn"),
  btnHelp: document.getElementById("helpBtn"),
  btnCloseHelp: document.getElementById("helpCloseBtn"),
  result: document.getElementById("resultDiv"),
  modalHelp: document.getElementById("instructions"),
  modalHistory: document.getElementById("historyModal"),
  historyContent: document.getElementById("historyModalContent"),
  yearText: document.getElementById("year"),
};

if (el.yearText) el.yearText.textContent = new Date().getFullYear();

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
  { code: "ZAR", name: "South African Rand" },
];

const debounce = (func, delay = 300) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

const renderOptions = (input, list, searchTerm = "") => {
  const query = searchTerm.toLowerCase();
  const filtered = currencies.filter(
    (c) =>
      c.name.toLowerCase().includes(query) ||
      c.code.toLowerCase().includes(query),
  );

  list.innerHTML = "";
  if (!filtered.length) {
    list.style.display = "none";
    return;
  }

  // Use document fragment for performance optimization
  const fragment = document.createDocumentFragment();
  filtered.forEach((c) => {
    const li = document.createElement("li");
    li.textContent = `${c.name} (${c.code})`;
    li.className = "option";
    li.addEventListener("mousedown", (e) => {
      e.preventDefault();
      selectCurrency(input, c);
    });
    fragment.appendChild(li);
  });

  list.appendChild(fragment);
  list.style.display = "block";
};

const selectCurrency = (input, currency) => {
  input.value = `${currency.name} (${currency.code})`;

  if (input.id === "baseCurrencyInput") baseCurrency = currency;
  else targetCurrency = currency;

  input.nextElementSibling.style.display = "none";
};

document.addEventListener("click", (e) => {
  [el.baseInput, el.targetInput].forEach((input) => {
    const list = input.nextElementSibling;
    if (!input.contains(e.target) && !list.contains(e.target)) {
      list.style.display = "none";
    }
  });
});

[el.baseInput, el.targetInput].forEach((input) => {
  const list = input.nextElementSibling;

  input.addEventListener(
    "input",
    debounce((e) => renderOptions(input, list, e.target.value), 200),
  );

  input.addEventListener("focus", () =>
    renderOptions(input, list, input.value),
  );
});

const showError = (msg) => {
  el.result.innerHTML = `<p style="color: #ef4444; font-weight: 500;">${msg}</p>`;
  el.result.style.display = "block";
  el.result.style.borderColor = "rgba(239, 68, 68, 0.3)";
  el.result.style.backgroundColor = "rgba(239, 68, 68, 0.05)";
};

const showResult = (data, amount, resultText) => {
  el.result.innerHTML = `
    <p>Exchange rate</p>
    <p>1 ${baseCurrency.code} = ${data.exchange_rate.toFixed(4)} ${targetCurrency.code}</p>
    <hr>
    <p><strong>Result</strong></p>
    <h2>${resultText}</h2>
  `;
  el.result.style.display = "block";
  el.result.style.borderColor = "rgba(59, 130, 246, 0.2)";
  el.result.style.backgroundColor = "rgba(59, 130, 246, 0.05)";
};

const performConversion = async () => {
  const amount = parseFloat(el.amount.value);

  if (isNaN(amount) || amount <= 0 || !baseCurrency || !targetCurrency) {
    return showError("Please enter a valid amount and select both currencies.");
  }

  const prevBtnText = el.btnConvert.textContent;
  el.btnConvert.disabled = true;
  el.btnConvert.textContent = "Converting...";

  try {
    const url = `${API_URL}?api_key=${API_KEY}&base=${baseCurrency.code}&target=${targetCurrency.code}&base_amount=${amount}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error("API responded with an error");

    const data = await response.json();
    const convertedAmount = data.converted_amount.toFixed(2);
    const resultText = `${amount} ${baseCurrency.code} = ${convertedAmount} ${targetCurrency.code}`;

    showResult(data, amount, resultText);

    history.unshift(resultText);
    if (history.length > 20) history.pop();
    localStorage.setItem("currencifyHistory", JSON.stringify(history));
  } catch (error) {
    console.error("Conversion failed:", error);
    showError(
      "Could not connect to exchange API. Please verify network or try again.",
    );
  } finally {
    el.btnConvert.disabled = false;
    el.btnConvert.textContent = prevBtnText;
  }
};

const handleSwap = () => {
  if (!baseCurrency && !targetCurrency) return;

  [baseCurrency, targetCurrency] = [targetCurrency, baseCurrency];

  el.baseInput.value = baseCurrency
    ? `${baseCurrency.name} (${baseCurrency.code})`
    : "";
  el.targetInput.value = targetCurrency
    ? `${targetCurrency.name} (${targetCurrency.code})`
    : "";

  el.result.style.display = "none";
};

const handleReset = () => {
  baseCurrency = null;
  targetCurrency = null;
  el.amount.value = "";
  el.baseInput.value = "";
  el.targetInput.value = "";
  el.result.style.display = "none";
};

const showHistory = () => {
  el.historyContent.innerHTML = `<h2>History</h2>`;

  if (!history.length) {
    el.historyContent.innerHTML += `<p>No previous results are available.</p>`;
  } else {
    const listHtml = history.map((item) => `<li>${item}</li>`).join("");
    el.historyContent.innerHTML += `<ul>${listHtml}</ul>`;
  }

  const closeBtn = document.createElement("button");
  closeBtn.textContent = "Close";
  closeBtn.className = "btn btn-secondary w-full mt-4";
  closeBtn.addEventListener("click", () => el.modalHistory.close());
  el.historyContent.appendChild(closeBtn);

  el.modalHistory.showModal();
};

el.btnConvert.addEventListener("click", (e) => {
  e.preventDefault();
  performConversion();
});

el.btnSwap.addEventListener("click", (e) => {
  e.preventDefault();
  handleSwap();
});

el.btnReset.addEventListener("click", (e) => {
  e.preventDefault();
  handleReset();
});

el.btnHistory.addEventListener("click", showHistory);

el.btnHelp.addEventListener("click", () => el.modalHelp.showModal());

el.btnCloseHelp.addEventListener("click", () => el.modalHelp.close());

[el.modalHelp, el.modalHistory].forEach((modal) => {
  modal.addEventListener("click", (e) => {
    if (e.target === modal) modal.close();
  });
});
