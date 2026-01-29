// Dados extraídos das tabelas PDF
// Estrutura: taxas[plano][bandeira][modalidade]
// Para crédito, é um array onde o index 0 = 1x, index 1 = 2x, etc.
const rates = {
    plus: {
        visa_master: {
            debit: 2.50,
            pix: 2.50,
            credit: [5.63, 7.04, 7.65, 8.25, 8.95, 9.65, 10.40, 11.15, 11.75, 12.25, 13.15, 13.65, 15.15, 15.86, 16.57, 17.28, 17.99, 18.70, 19.70, 20.40, 21.00]
        },
        elo: {
            debit: 4.05,
            pix: 2.50,
            credit: [6.10, 7.92, 8.54, 9.10, 9.80, 10.50, 11.25, 12.00, 12.75, 13.50, 14.00, 14.75, 15.87, 16.57, 17.27, 17.98, 18.68, 19.39, 20.09, 20.40, 21.10]
        },
        hiper: {
            debit: null, // Não especificado na tabela para débito
            pix: 2.50,
            credit: [5.72, 7.62, 8.33, 9.33, 9.74, 10.35, 11.34, 12.04, 12.75, 13.75, 14.16, 14.86, 15.57, 16.27, 16.97, 17.68, 18.38, 19.09, 19.79, 20.49, 21.19]
        },
        amex: {
            debit: null,
            pix: 2.50,
            credit: [6.75, 8.12, 8.82, 9.53, 10.23, 10.93, 11.83, 12.53, 13.23, 13.94, 14.64, 15.34, 16.04, 16.75, 16.45, 18.15, 18.86, 19.56, 20.25, 20.95, 21.65]
        },
        cabal: {
            debit: 7.75,
            pix: 2.50,
            credit: [9.38, 10.02, 10.73, 11.44, 12.15, 12.85, 13.89, 14.59, 15.30, 16.00, 16.71, 17.41, 18.12, 18.82, 19.53, 20.23, 20.94, 21.64, null, null, null]
        }
    },
    premium: {
        visa_master: {
            debit: 2.40,
            pix: 1.75,
            credit: [4.63, 6.04, 6.65, 7.25, 7.95, 8.65, 9.40, 10.15, 10.75, 11.25, 12.15, 12.65, 14.15, 14.86, 15.57, 16.28, 16.99, 17.70, 18.70, 19.40, 20.00]
        },
        elo: {
            debit: 3.05,
            pix: 1.75,
            credit: [5.10, 6.92, 7.54, 8.10, 8.80, 9.50, 10.25, 11.00, 11.75, 12.50, 13.00, 13.75, 14.87, 15.57, 16.27, 16.98, 17.68, 18.39, 19.09, 19.40, 20.10]
        },
        hiper: {
            debit: null,
            pix: 1.75,
            credit: [4.72, 6.62, 7.33, 8.33, 8.74, 9.93, 10.34, 11.04, 11.75, 12.75, 13.16, 14.34, 14.57, 15.27, 15.45, 16.68, 17.38, 18.56, 18.79, 19.95, 20.19]
        },
        amex: {
            debit: null,
            pix: 1.75,
            credit: [5.75, 7.12, 7.82, 8.53, 9.23, 9.35, 10.83, 11.53, 12.23, 12.94, 13.64, 13.86, 15.04, 15.75, 15.97, 17.15, 17.86, 18.09, 19.25, 19.49, 20.65]
        },
        cabal: {
            debit: 6.75,
            pix: 1.75,
            credit: [8.38, 9.02, 9.73, 10.44, 11.15, 11.85, 12.89, 13.59, 14.30, 15.00, 15.71, 16.41, 17.12, 17.82, 18.53, 19.23, 19.94, 20.64, null, null, null]
        }
    }
};

// Elementos do DOM
const els = {
    amount: document.getElementById('amount'),
    brand: document.getElementById('brand'),
    method: document.getElementById('method'),
    installments: document.getElementById('installments'),
    planToggle: document.getElementById('planToggle'), // Checked = Premium
    passFees: document.getElementById('passFees'),
    receiveAmount: document.getElementById('receiveAmount'),
    chargeAmount: document.getElementById('chargeAmount'),
    planLabelPlus: document.querySelector('.plan-label:nth-child(1)'),
    planLabelPremium: document.querySelector('.plan-label:nth-child(3)')
};

// Inicialização
function init() {
    populateInstallments();
    addEventListeners();
    calculate();
}

// Popula o select de parcelas (1x a 21x)
function populateInstallments() {
    els.installments.innerHTML = '';
    for (let i = 1; i <= 21; i++) {
        const option = document.createElement('option');
        option.value = i;
        option.text = `${i}x`;
        els.installments.appendChild(option);
    }
}

// Event Listeners
function addEventListeners() {
    const inputs = [els.amount, els.brand, els.method, els.installments, els.passFees, els.planToggle];
    inputs.forEach(el => el.addEventListener('input', calculate));
    
    els.planToggle.addEventListener('change', updatePlanLabels);
    els.method.addEventListener('change', toggleInstallmentsVisibility);
}

function updatePlanLabels() {
    const isPremium = els.planToggle.checked;
    if (isPremium) {
        els.planLabelPremium.classList.add('active-plan');
        els.planLabelPlus.classList.remove('active-plan');
    } else {
        els.planLabelPlus.classList.add('active-plan');
        els.planLabelPremium.classList.remove('active-plan');
    }
    calculate();
}

function toggleInstallmentsVisibility() {
    const method = els.method.value;
    // Oculta parcelas se não for crédito
    if (method === 'credit') {
        els.installments.style.display = 'block';
    } else {
        els.installments.style.display = 'none';
    }
    calculate();
}

function adjustAmount(delta) {
    let val = parseFloat(els.amount.value) || 0;
    val += delta;
    if (val < 0) val = 0;
    els.amount.value = val.toFixed(2);
    calculate();
}

// Lógica de Cálculo Principal
function calculate() {
    const amount = parseFloat(els.amount.value) || 0;
    const plan = els.planToggle.checked ? 'premium' : 'plus';
    const brand = els.brand.value;
    const method = els.method.value;
    const passFees = els.passFees.checked;
    
    let rate = 0;

    // Busca a taxa correta
    if (method === 'pix') {
        rate = rates[plan][brand].pix;
    } else if (method === 'debit') {
        rate = rates[plan][brand].debit;
        // Fallback se a bandeira não tiver débito (ex: Amex/Hiper às vezes não tem)
        if (rate === null) {
            alert("Opção de débito indisponível para esta bandeira.");
            // Reseta para crédito para evitar erro
            els.method.value = 'credit';
            toggleInstallmentsVisibility();
            return calculate();
        }
    } else if (method === 'credit') {
        const installments = parseInt(els.installments.value) - 1; // Array começa em 0
        const brandRates = rates[plan][brand].credit;
        
        // Verifica se a parcela existe para aquela bandeira
        if (brandRates[installments] !== undefined && brandRates[installments] !== null) {
            rate = brandRates[installments];
        } else {
            // Caso Cabal > 18x
            rate = 0; // Ou tratar erro
        }
    }

    // Cálculos Financeiros
    let finalReceive = 0;
    let finalCharge = 0;

    if (passFees) {
        // Taxa Repassada: Cliente paga a mais para você receber o valor cheio
        // Fórmula: Valor / (1 - (taxa/100))
        finalCharge = amount / (1 - (rate / 100));
        finalReceive = amount;
    } else {
        // Taxa Padrão: Desconta do seu valor
        finalCharge = amount;
        finalReceive = amount - (amount * (rate / 100));
    }

    // Atualiza UI
    els.receiveAmount.innerText = formatCurrency(finalReceive);
    els.chargeAmount.innerText = formatCurrency(finalCharge);
}

function formatCurrency(val) {
    return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

// Inicia
init();
