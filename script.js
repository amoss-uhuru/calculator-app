// script.js
document.addEventListener('DOMContentLoaded', () => {
    // DOM references
    const expressionEl = document.getElementById('expression');
    const subtextEl = document.getElementById('subtext');
    const historyList = document.getElementById('historyList');
    const clearHistoryBtn = document.getElementById('clearHistoryBtn');
    const themeToggle = document.getElementById('themeToggle');

    // Calculator state
    let currentInput = '0';
    let previousInput = '';
    let currentOperator = null;
    let shouldResetScreen = false;
    let history = [];

    // Helper: format numbers (avoid excessive decimals)
    function formatNumber(numStr) {
        let num = parseFloat(numStr);
        if (isNaN(num)) return '0';
        if (Number.isInteger(num)) return num.toString();
        return num.toFixed(8).replace(/\.?0+$/, '');
    }

    // Update main display
    function updateDisplay() {
        if (currentOperator && previousInput !== '') {
            expressionEl.textContent = `${formatNumber(previousInput)} ${currentOperator} ${formatNumber(currentInput)}`;
        } else {
            expressionEl.textContent = formatNumber(currentInput);
        }
        subtextEl.textContent = '';
    }

    // Add to history panel
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

    // Core evaluation
    function evaluate() {
        if (previousInput === '' || currentOperator === null) return;

        const prev = parseFloat(previousInput);
        const current = parseFloat(currentInput);
        if (isNaN(prev) || isNaN(current)) {
            subtextEl.textContent = 'Invalid input';
            setTimeout(() => subtextEl.textContent = '', 1000);
            return;
        }

        let result;
        switch (currentOperator) {
            case '+': result = prev + current; break;
            case '-': result = prev - current; break;
            case '×': result = prev * current; break;
            case '÷':
                if (current === 0) {
                    subtextEl.textContent = 'Cannot divide by zero';
                    setTimeout(() => subtextEl.textContent = '', 1000);
                    return;
                }
                result = prev / current;
                break;
            default: return;
        }

        const formattedResult = formatNumber(result.toString());
        const historyEntry = `${formatNumber(previousInput)} ${currentOperator} ${formatNumber(currentInput)} = ${formattedResult}`;
        addToHistory(historyEntry);

        currentInput = formattedResult;
        previousInput = '';
        currentOperator = null;
        shouldResetScreen = true;
        updateDisplay();
    }

    // Number input
    function inputNumber(num) {
        if (shouldResetScreen) {
            currentInput = num;
            shouldResetScreen = false;
        } else {
            currentInput = currentInput === '0' ? num : currentInput + num;
        }
        updateDisplay();
    }

    function inputDecimal() {
        if (shouldResetScreen) {
            currentInput = '0.';
            shouldResetScreen = false;
        } else if (!currentInput.includes('.')) {
            currentInput += '.';
        }
        updateDisplay();
    }

    function clearAll() {
        currentInput = '0';
        previousInput = '';
        currentOperator = null;
        shouldResetScreen = false;
        updateDisplay();
        subtextEl.textContent = '';
    }

    function backspace() {
        if (shouldResetScreen) return;
        if (currentInput.length === 1 || (currentInput === '-0')) {
            currentInput = '0';
        } else {
            currentInput = currentInput.slice(0, -1);
            if (currentInput === '') currentInput = '0';
        }
        updateDisplay();
    }

    function negate() {
        currentInput = (parseFloat(currentInput) * -1).toString();
        updateDisplay();
    }

    function percent() {
        currentInput = (parseFloat(currentInput) / 100).toString();
        updateDisplay();
    }

    function handleOperator(op) {
        if (currentOperator !== null && !shouldResetScreen) {
            evaluate();
        }
        previousInput = currentInput;
        currentOperator = op;
        shouldResetScreen = true;
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
            if (key === '*') op = '×';
            if (key === '/') op = '÷';
            handleOperator(op);
        } else if (key === 'Enter' || key === '=') {
            e.preventDefault();
            if (currentOperator !== null && !shouldResetScreen) {
                evaluate();
            }
        } else if (key === 'Escape') {
            e.preventDefault();
            clearAll();
        } else if (key === 'Backspace') {
            e.preventDefault();
            backspace();
        } else if (key === '%') {
            e.preventDefault();
            percent();
        }
    }

    // Attach event listeners
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
        if (currentOperator !== null && !shouldResetScreen) {
            evaluate();
        }
    });
    document.querySelectorAll('.btn.operator').forEach(btn => {
        btn.addEventListener('click', () => handleOperator(btn.getAttribute('data-op')));
    });
    clearHistoryBtn.addEventListener('click', clearHistory);

    // Theme toggle
    themeToggle.addEventListener('change', (e) => {
        if (e.target.checked) {
            document.body.classList.add('light');
        } else {
            document.body.classList.remove('light');
        }
    });

    // Keyboard listener
    window.addEventListener('keydown', handleKeyboard);

    // Initial display
    updateDisplay();
});
