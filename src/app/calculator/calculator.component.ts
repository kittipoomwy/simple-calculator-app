import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormGroup,
  FormControl,
  Validators,
} from '@angular/forms';

@Component({
  selector: 'app-calculator',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './calculator.component.html',
  styleUrl: './calculator.component.css',
})
export class CalculatorComponent implements OnInit {
  calculatorForm!: FormGroup;
  number: string = '0';
  operator: string = '';
  firstNumber: number | null = null;
  secondNumber: number | null = null;
  result: number | null = null;
  formula: string = '';
  waitingForNewNumber: boolean = false;

  ngOnInit(): void {
    this.calculatorForm = new FormGroup({
      firstNumber: new FormControl(null, [
        Validators.required,
        Validators.pattern('^[0-9]*$'),
      ]),
      secondNumber: new FormControl(null, [
        Validators.required,
        Validators.pattern('^[0-9]*$'),
      ]),
    });
  }
  clearCalculator(): void {
    this.number = '0';
    this.operator = '';
    this.firstNumber = null;
    this.secondNumber = null;
    this.result = null;
    this.formula = '';
    this.waitingForNewNumber = false;
    this.calculatorForm.reset();
  }

  addDigit(digit: string): void {
    if (this.number === '0') {
      if (digit === '.') {
        this.number = '0.';
      } else {
        this.number = digit;
      }
    } else {
      this.number = this.number + digit.toString();
    }
  }
  clickDigit(digit: string): void {
    // If waiting for a new number after an operation, start fresh
    if (this.waitingForNewNumber) {
      this.number = '0';
      this.waitingForNewNumber = false;
      // Clear formula when starting a completely new calculation
      if (this.operator === '') {
        this.formula = '';
      }
    }

    // Prevent multiple decimal points
    if (digit === '.' && this.number.includes('.')) {
      return;
    }

    // Limit number length to prevent overflow
    if (this.number.length < 12) {
      this.addDigit(digit);
    }
  }

  removeDigit(): void {
    if (this.number.length > 1) {
      this.number = this.number.slice(0, -1);
    } else if (this.number.length === 1) {
      this.number = '0';
    }
  }
  addFormula(number: string, operator: string): void {
    this.formula += number + ' ' + operator + ' ';
    // Keep formula manageable by truncating if too long
    this.formula = this.truncateFormula(this.formula);
  }
  setOperator(operator: string): void {
    // If we have a number being entered and no operator set
    if (this.operator === '') {
      this.firstNumber = parseFloat(this.number);
      this.operator = operator;
      this.addFormula(this.number, operator);
      this.waitingForNewNumber = true;
    }
    // If we already have an operator and a number is being entered
    else if (!this.waitingForNewNumber && this.number !== '0') {
      this.secondNumber = parseFloat(this.number);
      const calcResult = this.calculate();

      if (calcResult !== null) {
        this.result = calcResult;
        this.addFormula(this.number, '=');
        this.formula += calcResult.toString() + ' ' + operator + ' ';
        this.firstNumber = calcResult;
        this.number = calcResult.toString();
        this.operator = operator;
        this.waitingForNewNumber = true;
      }
    }
    // If just changing the operator
    else {
      this.operator = operator;
      // Update the formula by replacing the last operator
      const lastSpaceIndex = this.formula.lastIndexOf(' ');
      if (lastSpaceIndex > 0) {
        this.formula =
          this.formula.substring(0, lastSpaceIndex - 1) + operator + ' ';
      }
    }
  }
  squareRoot(): void {
    if (this.number !== '' && this.number !== '0') {
      const num = parseFloat(this.number);
      if (num < 0) {
        alert('Cannot calculate square root of a negative number');
      } else {
        this.result = Math.sqrt(num);
        this.formula = '√' + num + ' = ' + this.result;
        this.number = this.result.toString();
        this.operator = '';
        this.firstNumber = null;
        this.secondNumber = null;
        this.waitingForNewNumber = true;
      }
    }
  }

  percentage(): void {
    if (this.number !== '' && this.number !== '0') {
      const num = parseFloat(this.number);
      this.result = num / 100;
      this.formula = num + '% = ' + this.result;
      this.number = this.result.toString();
      this.waitingForNewNumber = true;
    }
  }
  performEquals(): void {
    if (
      this.operator !== '' &&
      this.firstNumber !== null &&
      !this.waitingForNewNumber
    ) {
      this.secondNumber = parseFloat(this.number);
      this.result = this.calculate();

      if (this.result !== null) {
        this.addFormula(this.number, '=');
        this.formula += this.result.toString();
        this.number = this.result.toString();
        this.operator = '';
        this.firstNumber = null;
        this.secondNumber = null;
        this.waitingForNewNumber = true;
      }
    }
  }

  // Method to truncate formula if it gets too long
  private truncateFormula(formula: string): string {
    const maxLength = 40;
    if (formula.length > maxLength) {
      return '...' + formula.substring(formula.length - maxLength + 3);
    }
    return formula;
  }
  calculate(): number | null {
    if (this.firstNumber === null || this.secondNumber === null) {
      return null;
    }

    let result: number;

    switch (this.operator) {
      case '+':
        result = this.firstNumber + this.secondNumber;
        break;
      case '-':
      case '−':
        result = this.firstNumber - this.secondNumber;
        break;
      case 'x':
      case '×':
        result = this.firstNumber * this.secondNumber;
        break;
      case '÷':
        if (this.secondNumber === 0) {
          alert('Cannot divide by zero');
          return this.firstNumber;
        }
        result = this.firstNumber / this.secondNumber;
        break;
      default:
        return null;
    }

    // Round to avoid floating point precision issues
    return Math.round(result * 1000000000) / 1000000000;
  }
}
