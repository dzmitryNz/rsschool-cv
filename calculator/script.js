class Calculator {
    constructor(previousOperandTextElement, currentOperandTextElement, displayCur, displayPrev) {
        this.previousOperandTextElement = previousOperandTextElement
        this.currentOperandTextElement = currentOperandTextElement
        this.displayCur = displayCur
        this.displayPrev = displayPrev
        this.clear()
    }

    clear() {
        this.currentOperand = '0'
        this.previousOperand = '0'
        this.displayCur = '0'
        this.displayPrev = '0'
        this.operation = undefined
    }

    appendNumber(number) {
        if (number === '.' && this.currentOperand.includes('.')) return;
        this.currentOperand = this.currentOperand.toString() + number.toString();
    }

    chooseOperation(operation) {
        if (operation == '√') {
            this.computeSqrt()
            return
        }
        if (this.currentOperand === '') return
        if (this.previousOperand !== '') {
            this.compute()
        }
        this.operation = operation
        this.previousOperand = this.currentOperand
        this.currentOperand = ''
    }

    plsMns() {
        this.currentOperand = -this.currentOperand.toString()
    }

    compute() {
        let computation
        const prev = parseFloat(this.previousOperand)
        const current = parseFloat(this.currentOperand)
        if (isNaN(prev) || isNaN(current)) return
        switch (this.operation) {
            case '+':
                computation = (prev * 10000) + (current * 10000)
                computation = computation / 10000
                break
            case '-':
                computation = (prev * 10000) - (current * 10000)
                computation = computation / 10000
                break
            case 'X':
                computation = Math.round((prev * current) * 10000) / 10000;
                break
            case '÷':
                computation = Math.round((prev / current) * 10000) / 10000;
                break
            case 'Xy':
                computation = Math.pow(prev, current)
                console.log(computation)
                break
            default:
                return
        }
        this.result = true;
        this.currentOperand = computation
        this.operation = undefined
        this.previousOperand = ''
    }

    computeSqrt() {
        let computation
        const prev = parseFloat(this.previousOperand)
        const current = parseFloat(this.currentOperand)
        if (Math.sign(current) == -1) {
            alert('Error')
            this.result = true;
            this.operation = undefined
            this.previousOperand = ''
        }
        if (isNaN(current)) return
        computation = Math.sqrt(current)
        this.result = true;
        this.currentOperand = computation
        this.operation = undefined
        this.previousOperand = ''
    }

    getDisplayNumber(number) {
        const stringNumber = number.toString()
        const integerDigits = parseFloat(stringNumber.split('.')[0])
        const decimalDigits = stringNumber.split('.')[1]
        let integerDisplay
        if (isNaN(integerDigits)) {
            integerDisplay = ''
        } else {
            integerDisplay = integerDigits.toLocaleString('ru', { maximumFractionDigits: 0 })
        }
        if (decimalDigits != null) {
            return `${integerDisplay}.${decimalDigits}`
        } else {
            return integerDisplay
        }
    }

    updateDisplay() {
        this.currentOperandTextElement.innerText =
            this.getDisplayNumber(this.currentOperand)
        if (this.operation != null) {
            this.previousOperandTextElement.innerText =
                `${this.getDisplayNumber(this.previousOperand)} ${this.operation}`
        } else {
            this.previousOperandTextElement.innerText = ''
        }
    }
}


const numberButtons = document.querySelectorAll('.number')
const operationButtons = document.querySelectorAll('.operation')
const equalsButton = document.querySelector('.result')
const allClearButton = document.querySelector('.clear')
const plsmnsButton = document.querySelector('.plsmns')
const previousOperandTextElement = document.querySelector('.previous-operand')
const currentOperandTextElement = document.querySelector('.current-operand')

const calculator = new Calculator(previousOperandTextElement, currentOperandTextElement)

numberButtons.forEach(button => {
    button.addEventListener("click", () => {
        if (calculator.previousOperand === "" &&
            calculator.currentOperand !== "" &&
            calculator.result) {
            calculator.currentOperand = "";
            calculator.result = false;
        }
        calculator.appendNumber(button.innerText)
        calculator.updateDisplay();
    })
})

operationButtons.forEach(button => {
    button.addEventListener('click', () => {
        calculator.chooseOperation(button.innerText)
        calculator.updateDisplay()
    })
})

equalsButton.addEventListener('click', button => {
    calculator.compute()
    calculator.updateDisplay()
})

allClearButton.addEventListener('click', button => {
    calculator.clear()
    calculator.updateDisplay()
})

plsmnsButton.addEventListener('click', button => {
    calculator.plsMns()
    calculator.updateDisplay()
})
