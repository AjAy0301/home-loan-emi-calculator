// ===== STATE MANAGEMENT =====
let calculatorState = {
    loanAmount: 5000000,
    interestRate: 8.5,
    loanTenure: 20,
    tenureUnit: 'years',
    startMonth: 0, // January
    startYear: 2026,
    extraPayment: 0,
    yearlyPayment: 0,
    yearlyPaymentMonth: 0, // January
    lumpsumPayments: [], // Array of {month: number, amount: number}
    emi: 0,
    totalInterest: 0,
    totalAmount: 0,
    actualTenure: 0,
    interestSaved: 0,
    monthsSaved: 0,
    endMonth: 0,
    endYear: 0,
    schedule: []
};

let lumpsumCounter = 0;

// ===== DOM ELEMENTS =====
const elements = {
    // Input sliders
    loanAmountSlider: document.getElementById('loan-amount'),
    interestRateSlider: document.getElementById('interest-rate'),
    loanTenureSlider: document.getElementById('loan-tenure'),
    extraPaymentSlider: document.getElementById('extra-payment'),
    yearlyPaymentSlider: document.getElementById('yearly-payment'),

    // Input fields
    loanAmountInput: document.getElementById('loan-amount-input'),
    interestRateInput: document.getElementById('interest-rate-input'),
    extraPaymentInput: document.getElementById('extra-payment-input'),
    yearlyPaymentInput: document.getElementById('yearly-payment-input'),

    // Date inputs
    startMonth: document.getElementById('start-month'),
    startYear: document.getElementById('start-year'),
    yearlyPaymentMonth: document.getElementById('yearly-payment-month'),
    yearlyMonthWrapper: document.getElementById('yearly-month-wrapper'),

    // Display values
    loanAmountDisplay: document.getElementById('loan-amount-display'),
    interestRateDisplay: document.getElementById('interest-rate-display'),
    loanTenureDisplay: document.getElementById('loan-tenure-display'),
    extraPaymentDisplay: document.getElementById('extra-payment-display'),
    yearlyPaymentDisplay: document.getElementById('yearly-payment-display'),
    loanDatesDisplay: document.getElementById('loan-dates-display'),

    // Results
    emiAmount: document.getElementById('emi-amount'),
    principalAmount: document.getElementById('principal-amount'),
    totalInterest: document.getElementById('total-interest'),
    totalAmount: document.getElementById('total-amount'),
    extraPaymentValue: document.getElementById('extra-payment-value'),
    interestSaved: document.getElementById('interest-saved'),
    monthsSaved: document.getElementById('months-saved'),
    actualTenure: document.getElementById('actual-tenure'),
    loanEndDate: document.getElementById('loan-end-date'),

    // Chart
    donutTotal: document.getElementById('donut-total'),
    principalPercent: document.getElementById('principal-percent'),
    interestPercent: document.getElementById('interest-percent'),

    // Schedule
    scheduleBody: document.getElementById('schedule-body'),

    // Lumpsum
    lumpsumList: document.getElementById('lumpsum-list'),
    addLumpsumBtn: document.getElementById('add-lumpsum-btn'),

    // Buttons
    calculateBtn: document.getElementById('calculate-btn'),
    tenureBtns: document.querySelectorAll('.tenure-btn'),
    viewBtns: document.querySelectorAll('.view-btn')
};

// ===== UTILITY FUNCTIONS =====
function formatCurrency(amount) {
    return `₹${Math.round(amount).toLocaleString('en-IN')}`;
}

function formatCurrencyFull(amount) {
    return `₹${Math.round(amount).toLocaleString('en-IN')}`;
}

function formatMonths(totalMonths) {
    if (totalMonths === 0) return '0 months';

    const years = Math.floor(totalMonths / 12);
    const months = totalMonths % 12;

    if (years === 0) {
        return `${months} month${months !== 1 ? 's' : ''}`;
    } else if (months === 0) {
        return `${years} year${years !== 1 ? 's' : ''}`;
    } else {
        return `${years} year${years !== 1 ? 's' : ''} ${months} month${months !== 1 ? 's' : ''}`;
    }
}

const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const monthNamesFull = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

function formatDate(month, year) {
    return `${monthNames[month]} ${year}`;
}

function calculateEndDate(startMonth, startYear, monthsToAdd) {
    let totalMonths = startYear * 12 + startMonth + monthsToAdd;
    const endYear = Math.floor(totalMonths / 12);
    const endMonth = totalMonths % 12;
    return { month: endMonth, year: endYear };
}

function updateLoanDatesDisplay() {
    const startDate = formatDate(calculatorState.startMonth, calculatorState.startYear);
    const endDate = formatDate(calculatorState.endMonth, calculatorState.endYear);
    elements.loanDatesDisplay.textContent = `${startDate} - ${endDate}`;

    // Also update the loan end date card
    if (elements.loanEndDate) {
        elements.loanEndDate.textContent = endDate;
    }
}

function animateValue(element, start, end, duration = 500) {
    if (!element) return;

    const range = end - start;
    const startTime = performance.now();

    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Easing function (ease-out-cubic)
        const easeProgress = 1 - Math.pow(1 - progress, 3);
        const current = start + (range * easeProgress);

        if (element.id === 'emi-amount' || element.id === 'total-amount' ||
            element.id === 'principal-amount' || element.id === 'total-interest' ||
            element.id === 'extra-payment-value' || element.id === 'interest-saved') {
            element.textContent = formatCurrencyFull(current);
        } else if (element.id === 'months-saved' || element.id === 'actual-tenure') {
            const months = Math.round(current);
            element.textContent = formatMonths(months);
        } else {
            element.textContent = formatCurrency(current);
        }

        if (progress < 1) {
            requestAnimationFrame(update);
        }
    }

    requestAnimationFrame(update);
}

// ===== LUMPSUM MANAGEMENT =====
function addLumpsumPayment(month = '', amount = '') {
    const id = ++lumpsumCounter;
    const item = document.createElement('div');
    item.className = 'lumpsum-item';
    item.dataset.id = id;

    // Generate year options (loan start year to 30 years ahead)
    const startYear = calculatorState.startYear;
    const endYear = startYear + 30;
    let yearOptions = '';
    for (let year = startYear; year <= endYear; year++) {
        yearOptions += `<option value="${year}">${year}</option>`;
    }

    // Month options
    const monthOptions = monthNamesFull.map((name, idx) => {
        return `<option value="${idx}">${name}</option>`;
    }).join('');

    item.innerHTML = `
        <div class="lumpsum-input-group">
            <label class="lumpsum-label">Month</label>
            <select class="lumpsum-input lumpsum-month-select">
                ${monthOptions}
            </select>
        </div>
        <div class="lumpsum-input-group">
            <label class="lumpsum-label">Year</label>
            <select class="lumpsum-input lumpsum-year-select">
                ${yearOptions}
            </select>
        </div>
        <div class="lumpsum-input-group">
            <label class="lumpsum-label">Amount</label>
            <input type="number" class="lumpsum-input lumpsum-amount" min="0" step="1000" value="${amount}" placeholder="Amount">
        </div>
        <button class="remove-lumpsum-btn" data-id="${id}">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
        </button>
    `;

    elements.lumpsumList.appendChild(item);

    // Add event listeners
    const monthSelect = item.querySelector('.lumpsum-month-select');
    const yearSelect = item.querySelector('.lumpsum-year-select');
    const amountInput = item.querySelector('.lumpsum-amount');
    const removeBtn = item.querySelector('.remove-lumpsum-btn');

    monthSelect.addEventListener('change', updateLumpsumPayments);
    yearSelect.addEventListener('change', updateLumpsumPayments);
    amountInput.addEventListener('change', updateLumpsumPayments);

    removeBtn.addEventListener('click', () => {
        item.remove();
        updateLumpsumPayments();
    });
}

function updateLumpsumPayments() {
    const items = elements.lumpsumList.querySelectorAll('.lumpsum-item');
    calculatorState.lumpsumPayments = [];

    items.forEach(item => {
        const monthSelect = item.querySelector('.lumpsum-month-select');
        const yearSelect = item.querySelector('.lumpsum-year-select');
        const amountInput = item.querySelector('.lumpsum-amount');

        const paymentMonth = parseInt(monthSelect.value);
        const paymentYear = parseInt(yearSelect.value);
        const amount = parseInt(amountInput.value);

        if (amount > 0) {
            // Calculate which month number this is from loan start
            const startMonthTotal = calculatorState.startYear * 12 + calculatorState.startMonth;
            const paymentMonthTotal = paymentYear * 12 + paymentMonth;
            const monthNumber = paymentMonthTotal - startMonthTotal + 1;

            // Only add if the payment is after loan start
            if (monthNumber > 0) {
                calculatorState.lumpsumPayments.push({ month: monthNumber, amount });
            }
        }
    });

    // Sort by month
    calculatorState.lumpsumPayments.sort((a, b) => a.month - b.month);

    calculateEMI();
}

// ===== CALCULATION FUNCTIONS =====
function calculateEMI() {
    const P = calculatorState.loanAmount;
    const annualRate = calculatorState.interestRate;
    const r = annualRate / (12 * 100); // Monthly interest rate

    // Convert tenure to months
    let originalTenureMonths;
    if (calculatorState.tenureUnit === 'years') {
        originalTenureMonths = calculatorState.loanTenure * 12;
    } else {
        originalTenureMonths = calculatorState.loanTenure;
    }

    // Calculate base EMI
    let emi;
    if (r === 0) {
        emi = P / originalTenureMonths;
    } else {
        emi = P * r * Math.pow(1 + r, originalTenureMonths) / (Math.pow(1 + r, originalTenureMonths) - 1);
    }

    // Calculate without extra payments (baseline)
    const baselineTotalAmount = emi * originalTenureMonths;
    const baselineTotalInterest = baselineTotalAmount - P;

    // Calculate with extra payments and lumpsums
    const result = calculateWithPrepayments(P, r, originalTenureMonths, emi);

    // Update state
    const oldEmi = calculatorState.emi;
    const oldTotal = calculatorState.totalAmount;
    const oldInterest = calculatorState.totalInterest;

    calculatorState.emi = emi;
    calculatorState.totalAmount = result.totalAmount;
    calculatorState.totalInterest = result.totalInterest;
    calculatorState.actualTenure = result.actualTenure;
    calculatorState.interestSaved = baselineTotalInterest - result.totalInterest;
    calculatorState.monthsSaved = originalTenureMonths - result.actualTenure;
    calculatorState.schedule = result.schedule;

    // Update UI
    animateValue(elements.emiAmount, oldEmi, emi);
    animateValue(elements.principalAmount, P, P, 0);
    animateValue(elements.totalInterest, oldInterest, result.totalInterest);
    animateValue(elements.totalAmount, oldTotal, result.totalAmount);
    animateValue(elements.donutTotal, oldTotal, result.totalAmount);

    // Update extra payment display - show if ANY prepayment exists
    const showExtra = calculatorState.extraPayment > 0 || calculatorState.yearlyPayment > 0 || calculatorState.lumpsumPayments.length > 0;

    // Show monthly extra payment card only if it's set
    if (calculatorState.extraPayment > 0) {
        document.getElementById('extra-payment-stat').style.display = 'flex';
        animateValue(elements.extraPaymentValue, 0, calculatorState.extraPayment, 0);
    } else {
        document.getElementById('extra-payment-stat').style.display = 'none';
    }

    // Show/hide entire savings section
    if (showExtra) {
        document.getElementById('savings-section').style.display = 'block';
        animateValue(elements.interestSaved, 0, calculatorState.interestSaved);
        animateValue(elements.monthsSaved, 0, calculatorState.monthsSaved);
    } else {
        document.getElementById('savings-section').style.display = 'none';
    }

    // Update actual tenure
    animateValue(elements.actualTenure, 0, result.actualTenure);

    // Update percentages
    const principalPercent = (P / result.totalAmount) * 100;
    const interestPercent = (result.totalInterest / result.totalAmount) * 100;

    elements.principalPercent.textContent = `${principalPercent.toFixed(1)}%`;
    elements.interestPercent.textContent = `${interestPercent.toFixed(1)}%`;

    // Update donut chart
    updateDonutChart(principalPercent, interestPercent);

    // Display schedule
    displaySchedule('yearly');
}

function calculateWithPrepayments(principal, monthlyRate, maxMonths, baseEmi) {
    const schedule = [];
    let balance = principal;
    let totalInterest = 0;
    let month = 1;

    while (balance > 0 && month <= maxMonths) {
        const interestPayment = balance * monthlyRate;
        let principalPayment = baseEmi - interestPayment;

        // Calculate current month relative to start month
        const currentMonthOfYear = (calculatorState.startMonth + month - 1) % 12;

        // Add extra payment
        let extraThisMonth = 0;
        if (calculatorState.extraPayment > 0) {
            principalPayment += calculatorState.extraPayment;
            extraThisMonth += calculatorState.extraPayment;
        }

        // Add yearly payment if it's the right month
        let hasYearlyPayment = false;
        if (calculatorState.yearlyPayment > 0 && currentMonthOfYear === calculatorState.yearlyPaymentMonth) {
            principalPayment += calculatorState.yearlyPayment;
            extraThisMonth += calculatorState.yearlyPayment;
            hasYearlyPayment = true;
        }

        // Add lumpsum payment if exists for this month
        const lumpsum = calculatorState.lumpsumPayments.find(l => l.month === month);
        if (lumpsum) {
            principalPayment += lumpsum.amount;
            extraThisMonth += lumpsum.amount;
        }

        // Ensure we don't overpay
        if (principalPayment > balance) {
            principalPayment = balance;
        }

        balance -= principalPayment;
        totalInterest += interestPayment;

        const totalPayment = baseEmi + extraThisMonth;

        // Calculate the actual date for this payment
        const paymentDate = calculateEndDate(calculatorState.startMonth, calculatorState.startYear, month - 1);

        schedule.push({
            month: month,
            date: paymentDate,
            principal: principalPayment,
            interest: interestPayment,
            totalPayment: totalPayment,
            balance: Math.max(0, balance),
            hasLumpsum: !!lumpsum,
            lumpsumAmount: lumpsum ? lumpsum.amount : 0,
            hasYearlyPayment: hasYearlyPayment,
            yearlyPaymentAmount: hasYearlyPayment ? calculatorState.yearlyPayment : 0
        });

        month++;
    }

    // Update end date in state
    if (schedule.length > 0) {
        const lastPayment = schedule[schedule.length - 1];
        calculatorState.endMonth = lastPayment.date.month;
        calculatorState.endYear = lastPayment.date.year;
        updateLoanDatesDisplay();
    }

    return {
        schedule: schedule,
        totalInterest: totalInterest,
        totalAmount: principal + totalInterest,
        actualTenure: schedule.length
    };
}

function updateDonutChart(principalPercent, interestPercent) {
    const circumference = 2 * Math.PI * 80; // 2πr where r = 80

    const principalCircle = document.querySelector('.donut-principal');
    const interestCircle = document.querySelector('.donut-interest');

    const principalDash = (principalPercent / 100) * circumference;
    const interestDash = (interestPercent / 100) * circumference;

    principalCircle.style.strokeDasharray = `${principalDash} ${circumference}`;
    principalCircle.style.strokeDashoffset = '0';

    interestCircle.style.strokeDasharray = `${interestDash} ${circumference}`;
    interestCircle.style.strokeDashoffset = `-${principalDash}`;
}

function displaySchedule(view) {
    const schedule = calculatorState.schedule;
    const tbody = elements.scheduleBody;
    tbody.innerHTML = '';

    if (view === 'yearly') {
        // Group by year
        const years = Math.ceil(schedule.length / 12);

        for (let year = 1; year <= years; year++) {
            const startMonth = (year - 1) * 12;
            const endMonth = Math.min(year * 12, schedule.length);

            let yearPrincipal = 0;
            let yearInterest = 0;
            let yearTotal = 0;
            let yearEndBalance = 0;

            for (let i = startMonth; i < endMonth; i++) {
                yearPrincipal += schedule[i].principal;
                yearInterest += schedule[i].interest;
                yearTotal += schedule[i].totalPayment;
                yearEndBalance = schedule[i].balance;
            }

            const row = document.createElement('tr');
            row.innerHTML = `
                <td><strong>Year ${year}</strong></td>
                <td>${formatCurrencyFull(yearPrincipal)}</td>
                <td>${formatCurrencyFull(yearInterest)}</td>
                <td>${formatCurrencyFull(yearTotal)}</td>
                <td>${formatCurrencyFull(yearEndBalance)}</td>
            `;
            tbody.appendChild(row);

            // Add animation
            row.style.opacity = '0';
            row.style.transform = 'translateY(10px)';
            setTimeout(() => {
                row.style.transition = 'all 0.3s ease';
                row.style.opacity = '1';
                row.style.transform = 'translateY(0)';
            }, year * 30);
        }
    } else {
        // Monthly view
        schedule.forEach((monthData, index) => {
            const row = document.createElement('tr');
            const dateStr = formatDate(monthData.date.month, monthData.date.year);

            // Build payment indicators
            let indicators = [];
            if (monthData.hasLumpsum) {
                indicators.push(`💰 +${formatCurrency(monthData.lumpsumAmount)}`);
            }
            if (monthData.hasYearlyPayment) {
                indicators.push(`📅 +${formatCurrency(monthData.yearlyPaymentAmount)}`);
            }
            const indicatorStr = indicators.length > 0 ? ` (${indicators.join(', ')})` : '';

            row.innerHTML = `
                <td><strong>${dateStr}</strong>${indicatorStr}</td>
                <td>${formatCurrencyFull(monthData.principal)}</td>
                <td>${formatCurrencyFull(monthData.interest)}</td>
                <td>${formatCurrencyFull(monthData.totalPayment)}</td>
                <td>${formatCurrencyFull(monthData.balance)}</td>
            `;

            if (monthData.hasLumpsum || monthData.hasYearlyPayment) {
                row.style.background = 'hsla(140, 70%, 50%, 0.05)';
            }

            tbody.appendChild(row);

            // Add animation (only for first 50 to avoid performance issues)
            if (index < 50) {
                row.style.opacity = '0';
                row.style.transform = 'translateY(10px)';
                setTimeout(() => {
                    row.style.transition = 'all 0.3s ease';
                    row.style.opacity = '1';
                    row.style.transform = 'translateY(0)';
                }, index * 20);
            }
        });
    }
}

// ===== UPDATE DISPLAY FUNCTIONS =====
function updateLoanAmountDisplay(value) {
    calculatorState.loanAmount = parseFloat(value);
    elements.loanAmountDisplay.textContent = formatCurrency(value);
    elements.loanAmountSlider.value = value;
    elements.loanAmountInput.value = value;
}

function updateInterestRateDisplay(value) {
    calculatorState.interestRate = parseFloat(value);
    elements.interestRateDisplay.textContent = `${value}%`;
    elements.interestRateSlider.value = value;
    elements.interestRateInput.value = value;
}

function updateLoanTenureDisplay(value) {
    calculatorState.loanTenure = parseFloat(value);
    const unit = calculatorState.tenureUnit === 'years' ? 'Year' : 'Month';
    const plural = value > 1 ? 's' : '';
    elements.loanTenureDisplay.textContent = `${value} ${unit}${plural}`;
    elements.loanTenureSlider.value = value;
}

function updateExtraPaymentDisplay(value) {
    calculatorState.extraPayment = parseFloat(value);
    elements.extraPaymentDisplay.textContent = formatCurrency(value);
    elements.extraPaymentSlider.value = value;
    elements.extraPaymentInput.value = value;
}

function updateYearlyPaymentDisplay(value) {
    calculatorState.yearlyPayment = parseFloat(value);
    elements.yearlyPaymentDisplay.textContent = formatCurrency(value);
    elements.yearlyPaymentSlider.value = value;
    elements.yearlyPaymentInput.value = value;

    // Show/hide yearly month selector
    if (value > 0) {
        elements.yearlyMonthWrapper.style.display = 'block';
    } else {
        elements.yearlyMonthWrapper.style.display = 'none';
    }
}


function updateTenureSliderRange() {
    if (calculatorState.tenureUnit === 'years') {
        elements.loanTenureSlider.min = 1;
        elements.loanTenureSlider.max = 30;
        elements.loanTenureSlider.value = Math.min(calculatorState.loanTenure, 30);
        const labels = elements.loanTenureSlider.nextElementSibling;
        labels.innerHTML = `
            <span>1 Year</span>
            <span>30 Years</span>
        `;
    } else {
        elements.loanTenureSlider.min = 1;
        elements.loanTenureSlider.max = 360;
        elements.loanTenureSlider.value = calculatorState.loanTenure;
        const labels = elements.loanTenureSlider.nextElementSibling;
        labels.innerHTML = `
            <span>1 Month</span>
            <span>360 Months</span>
        `;
    }
    updateLoanTenureDisplay(elements.loanTenureSlider.value);
}

// ===== EVENT LISTENERS =====
// Loan Amount Slider & Input
elements.loanAmountSlider.addEventListener('input', (e) => {
    updateLoanAmountDisplay(e.target.value);
    calculateEMI();
});

elements.loanAmountInput.addEventListener('input', (e) => {
    let value = parseFloat(e.target.value) || 0;
    value = Math.max(100000, Math.min(50000000, value));
    updateLoanAmountDisplay(value);
    calculateEMI();
});

// Interest Rate Slider & Input
elements.interestRateSlider.addEventListener('input', (e) => {
    updateInterestRateDisplay(e.target.value);
    calculateEMI();
});

elements.interestRateInput.addEventListener('input', (e) => {
    let value = parseFloat(e.target.value) || 0;
    value = Math.max(1, Math.min(20, value));
    updateInterestRateDisplay(value);
    calculateEMI();
});

// Loan Tenure Slider
elements.loanTenureSlider.addEventListener('input', (e) => {
    updateLoanTenureDisplay(e.target.value);
    calculateEMI();
});

// Extra Payment Slider & Input
elements.extraPaymentSlider.addEventListener('input', (e) => {
    updateExtraPaymentDisplay(e.target.value);
    calculateEMI();
});

elements.extraPaymentInput.addEventListener('input', (e) => {
    let value = parseFloat(e.target.value) || 0;
    value = Math.max(0, Math.min(1000000, value));
    updateExtraPaymentDisplay(value);
    calculateEMI();
});

// Yearly Payment Slider & Input
elements.yearlyPaymentSlider.addEventListener('input', (e) => {
    updateYearlyPaymentDisplay(e.target.value);
    calculateEMI();
});

elements.yearlyPaymentInput.addEventListener('input', (e) => {
    let value = parseFloat(e.target.value) || 0;
    value = Math.max(0, Math.min(5000000, value));
    updateYearlyPaymentDisplay(value);
    calculateEMI();
});

// Yearly Payment Month
elements.yearlyPaymentMonth.addEventListener('change', (e) => {
    calculatorState.yearlyPaymentMonth = parseInt(e.target.value);
    calculateEMI();
});

// Start Date
elements.startMonth.addEventListener('change', (e) => {
    calculatorState.startMonth = parseInt(e.target.value);
    calculateEMI();
});

elements.startYear.addEventListener('input', (e) => {
    let value = parseInt(e.target.value) || 2026;
    value = Math.max(2020, Math.min(2050, value));
    calculatorState.startYear = value;
    e.target.value = value;
    calculateEMI();
});

// Tenure Unit Toggle
elements.tenureBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
        elements.tenureBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const unit = btn.dataset.unit;
        const oldUnit = calculatorState.tenureUnit;
        calculatorState.tenureUnit = unit;

        // Convert tenure value
        if (oldUnit === 'years' && unit === 'months') {
            calculatorState.loanTenure = calculatorState.loanTenure * 12;
        } else if (oldUnit === 'months' && unit === 'years') {
            calculatorState.loanTenure = Math.ceil(calculatorState.loanTenure / 12);
        }

        updateTenureSliderRange();
        calculateEMI();
    });
});

// View Toggle (Yearly/Monthly)
elements.viewBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
        elements.viewBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const view = btn.dataset.view;

        // Update table header
        const th = document.querySelector('.schedule-table th:first-child');
        th.textContent = view === 'yearly' ? 'Year' : 'Month';

        displaySchedule(view);
    });
});

// Lumpsum Payments
elements.addLumpsumBtn.addEventListener('click', () => {
    addLumpsumPayment();
});

// Calculate Button
elements.calculateBtn.addEventListener('click', () => {
    // Add ripple effect
    elements.calculateBtn.style.transform = 'scale(0.95)';
    setTimeout(() => {
        elements.calculateBtn.style.transform = '';
    }, 150);

    calculateEMI();
});

// ===== INITIALIZATION =====
function initialize() {
    // Set initial values
    updateLoanAmountDisplay(calculatorState.loanAmount);
    updateInterestRateDisplay(calculatorState.interestRate);
    updateLoanTenureDisplay(calculatorState.loanTenure);
    updateExtraPaymentDisplay(calculatorState.extraPayment);
    updateYearlyPaymentDisplay(calculatorState.yearlyPayment);

    // Set start date
    elements.startMonth.value = calculatorState.startMonth;
    elements.startYear.value = calculatorState.startYear;

    // Initial calculation
    calculateEMI();

    // Add initial animation to cards
    const cards = document.querySelectorAll('.card');
    cards.forEach((card, index) => {
        card.style.animationDelay = `${index * 0.1}s`;
    });
}

// Run initialization when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
} else {
    initialize();
}

// ===== ADDITIONAL INTERACTIVITY =====
// Add hover effect to slider tracks
const sliders = document.querySelectorAll('.slider');
sliders.forEach(slider => {
    slider.addEventListener('input', function () {
        const value = (this.value - this.min) / (this.max - this.min) * 100;
        this.style.background = `linear-gradient(to right, 
            hsl(var(--primary-hue), 85%, 60%) 0%, 
            hsl(var(--accent-hue), 75%, 60%) ${value}%, 
            var(--bg-input) ${value}%, 
            var(--bg-input) 100%)`;
    });

    // Trigger once to set initial state
    slider.dispatchEvent(new Event('input'));
});

// Add click-to-edit functionality for display values
[elements.loanAmountDisplay, elements.interestRateDisplay, elements.extraPaymentDisplay].forEach((display, index) => {
    display.style.cursor = 'pointer';
    display.title = 'Click to edit';

    display.addEventListener('click', () => {
        const inputs = [elements.loanAmountInput, elements.interestRateInput, elements.extraPaymentInput];
        const input = inputs[index];
        input.focus();
        input.select();
    });
});

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + Enter to calculate
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        calculateEMI();
        elements.calculateBtn.classList.add('pulse');
        setTimeout(() => elements.calculateBtn.classList.remove('pulse'), 500);
    }
});

// Add pulse animation class
const style = document.createElement('style');
style.textContent = `
    .pulse {
        animation: pulse 0.5s ease;
    }
    
    @keyframes pulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.05); }
    }
`;
document.head.appendChild(style);
