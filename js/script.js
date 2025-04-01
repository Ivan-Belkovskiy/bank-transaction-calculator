"use strict";
let submitButton = document.querySelector('.submit-btn');
let inputField = document.querySelector('.input-field');
let outputBlock = document.querySelector('.output');
submitButton?.addEventListener('click', () => calculateTransactionsFull(inputField));
const bankSelect = document.querySelector('select');
const bankSelectOptions = [
    {
        className: 'main-select__option',
        value: 'statusbank',
        text: 'СтатусБанк',
        selected: true,
    },
    {
        className: 'main-select__option',
        disabled: true,
        value: 'bankdabrabyt',
        text: 'Банк Дабрабыт',
    },
    {
        className: 'main-select__option',
        disabled: true,
        value: 'mtbank',
        text: 'МТБанк',
    },
];
setupSelectOptions(bankSelect, bankSelectOptions);
function setupSelectOptions(selectElement, options) {
    if (!selectElement || !options)
        return;
    options.forEach((option) => {
        const optElement = document.createElement('option');
        // let key: TSelectOptionAllowedProperty;
        for (const key in option) {
            if (key in option) {
                optElement[key] = option[key];
                console.log(key);
            }
        }
        selectElement.appendChild(optElement);
    });
}
function calculateTransactionsFull(inputField) {
    if (!inputField || !inputField.value)
        return;
    inputField.disabled = true;
    if (submitButton) {
        submitButton.disabled = true;
    }
    let transactions = calculateTransactions(inputField);
    const startDate = transactions[transactions.length - 1].date;
    const endDate = transactions[0].date;
    let incomingMoney = 0;
    transactions.forEach((transaction) => {
        if (transaction.moneyAdd > 0) {
            incomingMoney += transaction.moneyAdd;
        }
    });
    let paymentMoney = 0;
    transactions.forEach((transaction) => {
        if (transaction.moneyMinus > 0) {
            paymentMoney += transaction.moneyMinus;
        }
    });
    if (outputBlock instanceof HTMLDivElement) {
        outputBlock.innerHTML = `
            <h2>За период с ${startDate} по ${endDate}:</h2>
            <p style="color: green; font-weight: bold;">Доходы: <span style="font-style: italic;">${incomingMoney} BYN</span></p>
            <p style="color: red; font-weight: bold;">Расходы: <span style="font-style: italic;">${paymentMoney} BYN</span></p>
        `;
    }
    // console.info(`За период с ${startDate} по ${endDate}:`);
    // console.info(`Доходы: ${incomingMoney} BYN`);
    // console.info(`Расходы: ${paymentMoney} BYN`);
    // console.log(transactions); 
}
function calculateTransactions(inputField) {
    if (!inputField || !inputField.value)
        return [];
    let result = [];
    let dotsCounter = 0;
    let parseType = 'date';
    let quotCounter = 0;
    let tmp = [];
    let obj = {
        date: '',
        moneyAdd: 0,
        moneyMinus: 0,
        authorisationCode: '',
        rrn: '',
    };
    for (let i = 0; i < inputField.value.length; i++) {
        // alert(i + "  parseType: " + parseType + " tmp: " + tmp.join(''));
        if (parseType == 'date') {
            if (i > 700) {
                // alert(inputField.value[i]);
            }
            if (inputField.value[i] == '.') {
                dotsCounter++;
            }
            if (inputField.value[i] == ' ' && dotsCounter > 1) {
                obj.date = tmp.join(''); // Записываем дату в объект
                tmp = []; // Очщаем массив
                parseType = 'money'; // Переходим к проверке типа транзакции (оплата, зачисление, и.т.д)
            }
            else if (inputField.value[i].match(/[0-9|.,]/gm)) {
                tmp.push(inputField.value[i]);
            }
        }
        else if (parseType == 'money') {
            if (tmp.join('') == 'ZACHISLENIENASCHET') {
                tmp = []; // Очищаем массив
                parseType = 'incomingMoney'; // Переходим к разбору суммы дохода
            }
            else if (tmp.join('') == 'Оплата') {
                tmp = []; // Очищаем массив
                parseType = 'paymentMoney'; // Переходим к разбору суммы
            }
            else if (inputField.value[i].toLowerCase().match(/[а-я\a-z]/gm)) {
                tmp.push(inputField.value[i]);
            }
        }
        else if (parseType == 'paymentMoney') {
            if (inputField.value[i].toLowerCase().match(/[a-z]/gm)) {
                obj.moneyMinus += Number(tmp.join('')); // Добавляем сумму оплаты к расходам
                // alert(obj.moneyMinus);
                tmp = []; // Очищаем массив
                parseType = 'authorizationCode'; // Переходим к коду авторизации
            }
            else if (inputField.value[i] != ' ' && inputField.value[i] != '-') {
                if (inputField.value[i] == ',') {
                    tmp.push('.');
                }
                else {
                    tmp.push(inputField.value[i]);
                }
            }
        }
        else if (parseType == 'incomingMoney') {
            if (inputField.value[i].toLowerCase().match(/[a-z]/gm)) {
                obj.moneyAdd += Number(tmp.join('')); // Добавляем сумму оплаты к доходам
                tmp = []; // Очищаем массив
                parseType = 'authorizationCode'; // Переходим к коду авторизации
            }
            else if (inputField.value[i] != ' ' && inputField.value[i] != '-') {
                if (inputField.value[i] == ',') {
                    tmp.push('.');
                }
                else {
                    tmp.push(inputField.value[i]);
                }
            }
        }
        else if (parseType == 'authorizationCode') {
            if (inputField.value[i] == '	' && tmp.length == 6) {
                // alert(tmp.join(''));
                obj.authorisationCode = tmp.join(''); // Записываем код авторизации в объект
                tmp = []; // Очищаем массив
                parseType = 'RRN';
            }
            else if (inputField.value[i].match(/[0-9]/gm)) {
                tmp.push(inputField.value[i]);
            }
        }
        else if (parseType == 'RRN') {
            if (inputField.value[i] == '	' && tmp.length == 12) {
                // alert(tmp.join(''));
                obj.rrn = tmp.join(''); // Записываем RRN в объект
                tmp = []; // Очищаем массив tmp
                parseType = 'operationLocation'; // Переходим к месту совершения операции
                dotsCounter = 0;
            }
            else if (inputField.value[i].toLowerCase().match(/[0-9,a-z]/gm)) {
                tmp.push(inputField.value[i]);
            }
        }
        else if (parseType == 'operationLocation') {
            if (inputField.value[i] == ',') {
                dotsCounter++;
            }
            // В дальнейшем добавить сортировку транзакций по месту совершения
            if (inputField.value[i] == `"`) {
                quotCounter++;
            }
            if (inputField.value[i] == '\n' || inputField.value[i + 1] == undefined) {
                // alert('END!');
                dotsCounter = 0;
                quotCounter = 0;
                // alert(inputField.value[i-1]);
                tmp = [];
                result.push(obj);
                obj = {
                    date: '',
                    moneyAdd: 0,
                    moneyMinus: 0,
                    authorisationCode: '',
                    rrn: '',
                };
                parseType = 'date';
                i -= 1;
                // alert(inputField.value[i+2]);
                // return;
            }
        }
        // console.log(dotsCounter + " " + inputField.value[i]);
        // outputBlock.innerHTML += inputField.value[i] + '<br>';
    }
    // console.info(result);
    return result;
}
