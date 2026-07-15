let optionsList = [];

// Event listeners per i pulsanti
document.getElementById('buyPut').addEventListener('click', () => addOption('Compra', 'PUT'));
document.getElementById('sellPut').addEventListener('click', () => addOption('Vendi', 'PUT'));
document.getElementById('buyCall').addEventListener('click', () => addOption('Compra', 'CALL'));
document.getElementById('sellCall').addEventListener('click', () => addOption('Vendi', 'CALL'));
document.getElementById('strategy-preset').addEventListener('change', (event) => loadPresetStrategy(event.target.value));
document.getElementById('openOptionStrat').addEventListener('click', openOptionStrat);
document.getElementById('clearAll').addEventListener('click', clearAll);

document.getElementById('strike').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        const ticker = document.getElementById('ticker').value.trim();
        if (ticker) addOption('Compra', 'CALL');
    }
});

function addOption(action, type) {
    const ticker = document.getElementById('ticker').value.trim();
    const expiration = document.getElementById('expiration').value.trim();
    const strike = document.getElementById('strike').value.trim();
    const price = document.getElementById('price').value.trim();

    if (!ticker || !expiration || !strike) {
        alert('Per favore, compila ticker, scadenza e strike.');
        return;
    }

    // Validazione formato scadenza YYMMDD
    if (!/^\d{6}$/.test(expiration)) {
        alert('Scadenza deve essere in formato YYMMDD (es. 260430)');
        return;
    }

    const option = {
        action: action,
        type: type,
        ticker: ticker.toUpperCase(),
        expiration: expiration,
        strike: strike,
        price: price || null
    };

    optionsList.push(option);
    updateDisplay();
    
    // Pulisci i campi input
    document.getElementById('strike').value = '';
    document.getElementById('price').value = '';
    document.getElementById('strike').focus();
}

function removeOption(index) {
    optionsList.splice(index, 1);
    updateDisplay();
}

function clearAll() {
    if (optionsList.length === 0) {
        alert('Nessuna opzione da cancellare');
        return;
    }
    if (confirm('Sei sicuro di voler cancellare tutte le opzioni?')) {
        optionsList = [];
        updateDisplay();
    }
}

function loadPresetStrategy(presetKey) {
    if (!presetKey) return;

    const ticker = document.getElementById('ticker').value.trim().toUpperCase();
    const expiration = document.getElementById('expiration').value.trim();
    if (!ticker || !expiration) {
        alert('Ticker e scadenza devono essere impostati prima di caricare una strategia.');
        document.getElementById('strategy-preset').value = '';
        return;
    }

    const rawStrike = parseInt(document.getElementById('strike').value.trim(), 10);
    const centerStrike = Number.isFinite(rawStrike) ? rawStrike : 150;

    const presets = {
        ironCondor: [
            { action: 'Compra', type: 'PUT', strike: centerStrike - 40 },
            { action: 'Vendi', type: 'PUT', strike: centerStrike - 20 },
            { action: 'Vendi', type: 'CALL', strike: centerStrike + 20 },
            { action: 'Compra', type: 'CALL', strike: centerStrike + 40 }
        ],
        ironButterfly: [
            { action: 'Compra', type: 'PUT', strike: centerStrike - 20 },
            { action: 'Vendi', type: 'PUT', strike: centerStrike },
            { action: 'Vendi', type: 'CALL', strike: centerStrike },
            { action: 'Compra', type: 'CALL', strike: centerStrike + 20 }
        ]
    };

    optionsList = presets[presetKey].map((item) => ({
        ...item,
        ticker,
        expiration,
        price: null
    }));
    updateDisplay();
}

function updateDisplay() {
    const display = document.getElementById('strategy-display');
    const urlPreview = document.getElementById('url-preview');
    const summary = document.getElementById('strategy-summary');

    if (optionsList.length === 0) {
        display.innerHTML = '<div class="empty-state">Nessuna opzione aggiunta. Usa i controlli a destra per iniziare.</div>';
        summary.textContent = 'Nessuna opzione aggiunta';
        urlPreview.textContent = '-';
        document.getElementById('openOptionStrat').disabled = true;
        return;
    }

    summary.textContent = `Opzioni totali: ${optionsList.length}`;
    document.getElementById('openOptionStrat').disabled = false;

    display.innerHTML = `
        <table class="strategy-table">
            <thead>
                <tr>
                    <th>Operazione</th>
                    <th>Ticker</th>
                    <th>Scadenza</th>
                    <th>Strike</th>
                    <th>Prezzo</th>
                    <th></th>
                </tr>
            </thead>
            <tbody>
                ${optionsList.map((option, index) => {
                    const priceValue = option.price ? option.price : '';
                    const rowClass = option.type === 'PUT' ? 'put' : 'call';
                    return `
                        <tr class="${rowClass}">
                            <td>
                                <select onchange="updateOptionField(${index}, 'action', this.value)">
                                    <option value="Compra" ${option.action === 'Compra' ? 'selected' : ''}>Compra</option>
                                    <option value="Vendi" ${option.action === 'Vendi' ? 'selected' : ''}>Vendi</option>
                                </select>
                                <select onchange="updateOptionField(${index}, 'type', this.value)" class="compact-select">
                                    <option value="PUT" ${option.type === 'PUT' ? 'selected' : ''}>PUT</option>
                                    <option value="CALL" ${option.type === 'CALL' ? 'selected' : ''}>CALL</option>
                                </select>
                            </td>
                            <td><input type="text" value="${option.ticker}" onchange="updateOptionField(${index}, 'ticker', this.value)"></td>
                            <td><input type="text" value="${option.expiration}" onchange="updateOptionField(${index}, 'expiration', this.value)"></td>
                            <td><input type="text" value="${option.strike}" onchange="updateOptionField(${index}, 'strike', this.value)"></td>
                            <td><input type="text" value="${priceValue}" onchange="updateOptionField(${index}, 'price', this.value)"></td>
                            <td class="actions"><button class="strategy-remove" onclick="removeOption(${index})">×</button></td>
                        </tr>
                    `;
                }).join('')}
            </tbody>
        </table>
    `;

    const url = buildOptionStratURL();
    urlPreview.textContent = url;
}

function buildOptionStratURL() {
    if (optionsList.length === 0) return '-';

    const ticker = optionsList[0].ticker;
    const optionsString = optionsList.map(option => {
        const sign = option.action === 'Vendi' ? '-' : '';
        const typeCode = option.type === 'PUT' ? 'P' : 'C';
        const pricePart = option.price ? `@${option.price}` : '';
        return `${sign}.${option.ticker}${option.expiration}${typeCode}${option.strike}${pricePart}`;
    }).join(',');

    const encodedOptionsString = encodeURIComponent(optionsString).replace(/%40/g, '@');
    return `https://optionstrat.com/build/custom/${ticker}/${encodedOptionsString}`;
}

function updateOptionField(index, field, value) {
    const option = optionsList[index];
    if (!option) return;

    const normalizedValue = field === 'ticker' ? value.toUpperCase() : value;
    option[field] = normalizedValue;
    updateDisplay();
}

function openOptionStrat() {
    if (optionsList.length === 0) {
        alert('Aggiungi almeno un\'opzione prima di aprire OptionStrat');
        return;
    }
    const url = buildOptionStratURL();
    window.open(url, '_blank');
}

function getTodayExpiration() {
    const today = new Date();
    const year = String(today.getFullYear()).slice(-2);
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}${month}${day}`;
}

window.addEventListener('load', () => {
    document.getElementById('ticker').focus();
    document.getElementById('expiration').value = getTodayExpiration();
});
