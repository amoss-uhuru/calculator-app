// script.js 
document.addEventListener('DOMContentLoaded', () => {
    // DOM elements
    const expressionEl = document.getElementById('expression');
    const resultEl = document.getElementById('result');
    const historyList = document.getElementById('historyList');
    const clearHistoryBtn = document.getElementById('clearHistoryBtn');
    const themeSwitch = document.getElementById('themeSwitch');

    // Calculator state
    let currentInput = '0';        // current number being built
    let previousInput = '';         // previous number before operator
    let currentOperator = null;     // pending operator
    let shouldResetInput = false;   // whether next number should replace current
    let history = [];

    // Format numbers (remove trailing zeros)
    function formatNumber(numStr) {
        let num = parseFloat(numStr);
        if (isNaN(num)) return '0';
        if (Number.isInteger(num)) return num.toString();
        return num.toFixed(8).replace(/\.?0+$/, '');
    }

    // Update the main display
    function updateDisplay() {
        if (currentOperator && previousInput !== '') {
            expressionEl.textContent = `${formatNumber(previousInput)} ${currentOperator} ${formatNumber(currentInput)}`;
        } else {
            expressionEl.textContent = formatNumber(currentInput);
        }
        resultEl.textContent = '';
    }

    // Add entry to history
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

    // Perform pending calculation
    function evaluate() {
        if (previousInput === '' || currentOperator === null) return;

        const prev = parseFloat(previousInput);
        const current = parseFloat(currentInput);
        if (isNaN(prev) || isNaN(current)) {
            resultEl.textContent = 'Invalid input';
            setTimeout(() => resultEl.textContent = '', 1000);
            return;
        }

        let result;
        switch (currentOperator) {
            case '+': result = prev + current; break;
            case '-': result = prev - current; break;
            case '*': result = prev * current; break;
            case '/':
                if (current === 0) {
                    resultEl.textContent = 'Cannot divide by zero';
                    setTimeout(() => resultEl.textContent = '', 1000);
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
        shouldResetInput = true;   // next number will start fresh
        updateDisplay();
    }

    // Handle number input
    function inputNumber(num) {
        // If we should reset input (after equals or operator), start fresh
        if (shouldResetInput) {
            currentInput = num;
            shouldResetInput = false;
        } else {
            // Prevent leading zeros: if currentInput is "0" and not decimal, replace
            if (currentInput === '0' && num !== '.') {
                currentInput = num;
            } else {
                currentInput += num;
            }
        }
        updateDisplay();
    }

    function inputDecimal() {
        if (shouldResetInput) {
            currentInput = '0.';
            shouldResetInput = false;
            updateDisplay();
            return;
        }
        if (!currentInput.includes('.')) {
            currentInput += '.';
        }
        updateDisplay();
    }

    function clearAll() {
        currentInput = '0';
        previousInput = '';
        currentOperator = null;
        shouldResetInput = false;
        updateDisplay();
        resultEl.textContent = '';
    }

    function backspace() {
        if (shouldResetInput) return;
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
        const inputValue = parseFloat(currentInput);
        if (isNaN(inputValue)) return;

        // If there's already an operator and we're not resetting input, evaluate first
        if (currentOperator !== null && !shouldResetInput) {
            evaluate();
        }
        previousInput = currentInput;
        currentOperator = op;
        shouldResetInput = true;   // next number will replace current input
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
            if (currentOperator !== null && !shouldResetInput) {
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

    // --- Event listeners ---
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
        if (currentOperator !== null && !shouldResetInput) {
            evaluate();
        }
    });
    document.querySelectorAll('.btn.operator').forEach(btn => {
        btn.addEventListener('click', () => handleOperator(btn.getAttribute('data-op')));
    });
    clearHistoryBtn.addEventListener('click', clearHistory);

    // Theme toggle
    themeSwitch.addEventListener('change', (e) => {
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
