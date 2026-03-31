// script.js
document.addEventListener('DOMContentLoaded', () => {
    // DOM elements
    const expressionEl = document.getElementById('expression');
    const resultEl = document.getElementById('result');
    const historyList = document.getElementById('historyList');
    const clearHistoryBtn = document.getElementById('clearHistoryBtn');
    const themeSwitch = document.getElementById('themeSwitch');

    let currentInput = '0';
    let previousInput = '';
    let operator = null;
    let waitingForOperand = false;
    let history = [];

    // Helper: update display
    function updateDisplay() {
        expressionEl.textContent = currentInput;
        if (previousInput && operator) {
            expressionEl.textContent = `${previousInput} ${operator} ${currentInput}`;
        }
    }

    // Helper: evaluate expression
    function evaluate() {
        let result;
        try {
            const expression = `${previousInput}${operator}${currentInput}`;
            // Use Function to evaluate safely (allows basic math)
            const evalExpr = new Function('return (' + expression + ')');
            result = evalExpr();
            if (isNaN(result) || !isFinite(result)) throw new Error('Invalid calculation');
            // Add to history
            addToHistory(`${expression} = ${result}`);
            // Update current input with result
            currentInput = String(result);
            previousInput = '';
            operator = null;
            waitingForOperand = true;
        } catch (error) {
            resultEl.textContent = 'Error';
            setTimeout(() => { resultEl.textContent = ''; }, 1500);
            currentInput = '0';
            previousInput = '';
            operator = null;
            waitingForOperand = false;
        }
        updateDisplay();
        resultEl.textContent = '';
    }

    // Add to history
    function addToHistory(entry) {
        history.unshift(entry);
        if (history.length > 20) history.pop();
        renderHistory();
    }

    function renderHistory() {
        if (history.length === 0) {
            historyList.innerHTML = '<li class="empty-history">No calculations yet</li>';
            return;
        }
        historyList.innerHTML = history.map(item => `<li>${item}</li>`).join('');
    }

    function clearHistory() {
        history = [];
        renderHistory();
    }

    // Handle number input
    function inputNumber(num) {
        if (waitingForOperand) {
            currentInput = num;
            waitingForOperand = false;
        } else {
            currentInput = currentInput === '0' ? num : currentInput + num;
        }
        updateDisplay();
    }

    function inputDecimal() {
        if (waitingForOperand) {
            currentInput = '0.';
            waitingForOperand = false;
        } else if (!currentInput.includes('.')) {
            currentInput += '.';
        }
        updateDisplay();
    }

    function clearAll() {
        currentInput = '0';
        previousInput = '';
        operator = null;
        waitingForOperand = false;
        updateDisplay();
        resultEl.textContent = '';
    }

    function backspace() {
        if (waitingForOperand) return;
        currentInput = currentInput.slice(0, -1);
        if (currentInput === '' || currentInput === '-') currentInput = '0';
        updateDisplay();
    }

    function negate() {
        currentInput = String(parseFloat(currentInput) * -1);
        updateDisplay();
    }

    function percent() {
        currentInput = String(parseFloat(currentInput) / 100);
        updateDisplay();
    }

    function sqrt() {
        const val = parseFloat(currentInput);
        if (val < 0) {
            resultEl.textContent = 'Invalid input';
            setTimeout(() => { resultEl.textContent = ''; }, 1000);
            return;
        }
        currentInput = String(Math.sqrt(val));
        updateDisplay();
        addToHistory(`√(${val}) = ${currentInput}`);
        waitingForOperand = true;
    }

    function square() {
        const val = parseFloat(currentInput);
        currentInput = String(val * val);
        updateDisplay();
        addToHistory(`${val}² = ${currentInput}`);
        waitingForOperand = true;
    }

    function reciprocal() {
        const val = parseFloat(currentInput);
        if (val === 0) {
            resultEl.textContent = 'Cannot divide by zero';
            setTimeout(() => { resultEl.textContent = ''; }, 1000);
            return;
        }
        currentInput = String(1 / val);
        updateDisplay();
        addToHistory(`1/(${val}) = ${currentInput}`);
        waitingForOperand = true;
    }

    function handleOperator(nextOp) {
        const inputVal = parseFloat(currentInput);
        if (isNaN(inputVal)) return;

        if (previousInput !== '' && operator && !waitingForOperand) {
            evaluate();
        }
        previousInput = currentInput;
        operator = nextOp;
        waitingForOperand = true;
        updateDisplay();
    }

    // Keyboard support
    function handleKeyboard(e) {
        const key = e.key;
        if (/[0-9]/.test(key)) {
            e.preventDefault();
            inputNumber(key);
        } else if (key === '.') {
            e.preventDefault();
            inputDecimal();
        } else if (key === '+' || key === '-' || key === '*' || key === '/') {
            e.preventDefault();
            let op = key;
            if (key === '*') op = '*';
            if (key === '/') op = '/';
            handleOperator(op);
        } else if (key === 'Enter' || key === '=') {
            e.preventDefault();
            if (previousInput && operator && !waitingForOperand) evaluate();
        } else if (key === 'Escape') {
            e.preventDefault();
            clearAll();
        } else if (key === 'Backspace') {
            e.preventDefault();
            backspace();
        } else if (key === '%') {
            e.preventDefault();
            percent();
        } else if (key === 's') { // square root
            e.preventDefault();
            sqrt();
        } else if (key === '^') { // square
            e.preventDefault();
            square();
        }
    }

    // Event listeners for buttons
    document.querySelectorAll('.btn.number').forEach(btn => {
        btn.addEventListener('click', () => inputNumber(btn.getAttribute('data-value')));
    });
    document.querySelectorAll('.btn[data-value="."]').forEach(btn => {
        btn.addEventListener('click', inputDecimal);
    });
    document.querySelector('[data-action="clear"]').addEventListener('click', clearAll);
    document.querySelector('[data-action="backspace"]').addEventListener('click', backspace);
    document.querySelector('[data-action="negate"]').addEventListener('click', negate);
    document.querySelector('[data-action="percent"]').addEventListener('click', percent);
    document.querySelector('[data-action="equals"]').addEventListener('click', () => {
        if (previousInput && operator && !waitingForOperand) evaluate();
    });
    document.querySelectorAll('.btn.operator').forEach(btn => {
        btn.addEventListener('click', () => handleOperator(btn.getAttribute('data-op')));
    });
    document.querySelector('[data-action="sqrt"]').addEventListener('click', sqrt);
    document.querySelector('[data-action="square"]').addEventListener('click', square);
    document.querySelector('[data-action="reciprocal"]').addEventListener('click', reciprocal);
    document.querySelector('[data-action="clear-history"]').addEventListener('click', clearHistory);
    clearHistoryBtn.addEventListener('click', clearHistory);

    // Theme toggle
    themeSwitch.addEventListener('change', (e) => {
        if (e.target.checked) {
            document.body.classList.add('light');
        } else {
            document.body.classList.remove('light');
        }
    });

    // Keyboard events
    window.addEventListener('keydown', handleKeyboard);

    // Initial display
    updateDisplay();
});
