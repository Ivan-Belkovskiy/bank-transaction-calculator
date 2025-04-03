type TBankNames = 'statusbank' | 'bankdabrabyt' | 'mtbank';

interface ISelectOption {
    value: string,
    className?: string,
    disabled?: boolean,
    text: string,
    selected?: boolean,
}

type TSelectOptionAllowedProperties = {
    [K in keyof HTMLOptionElement]:
    K extends keyof ISelectOption ? HTMLOptionElement[K] extends string ?
    K extends number ? keyof HTMLOptionElement : K : never : never
}[keyof ISelectOption];

type TSelectOptionProperties = {
    [key in TSelectOptionAllowedProperties]?: any
}

// type TSelectOptionAllowedProperty = keyof HTMLOptionElement extends keyof ISelectOption ? keyof HTMLOptionElement : keyof ISelectOption;

type IBankTransaction<T> = T extends 'statusbank' ? {
    date: string,
    moneyAdd: number,
    moneyMinus: number,
    authorisationCode: string,
    rrn: string,
} : T extends 'bankdabrabyt' ? {
    moneyAdd: number,
    moneyMinus: number,
    date: string,
    type: string,
    location?: string,
    MCC?: string,
} : {
    moneyAdd: number,
    moneyMinus: number,
    date: string,
    type: string,
    location?: string,
    MCC?: string,
}

let submitButton: HTMLButtonElement | null = document.querySelector('.submit-btn');
let inputField: HTMLTextAreaElement | null = document.querySelector('.input-field');
let outputBlock: HTMLDivElement | null = document.querySelector('.output');

submitButton?.addEventListener('click', () => calculateTransactionsFull(inputField, currentBank));

const bankSelect: HTMLSelectElement | null = document.querySelector('select');
const bankSelectOptions: ISelectOption[] = [
    {
        className: 'main-select__option',
        value: 'statusbank',
        text: 'СтатусБанк',
        selected: true,
    },
    {
        className: 'main-select__option',
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

let currentBank: TBankNames = 'statusbank';

setupSelectOptions(bankSelect, bankSelectOptions, (select) => {
    currentBank = select.value as TBankNames;
});

function setupSelectOptions(selectElement: HTMLSelectElement | null, options: ISelectOption[], onChangeCallback?: (selectElement: HTMLSelectElement) => void): void {
    if (!selectElement || !options) return;
    options.forEach((option: ISelectOption) => {
        const optElement: HTMLOptionElement = document.createElement('option');
        // let key: TSelectOptionAllowedProperty;
        for (const key in option) {
            if (key in option) {
                optElement[key as keyof TSelectOptionProperties] = option[key as keyof ISelectOption] as never;
                console.log(key);
            }
        }
        selectElement.appendChild(optElement);
    });
    if (onChangeCallback) {
        selectElement.addEventListener('change', () => onChangeCallback(selectElement));
    }
}

function calculateTransactionsFull(inputField: HTMLTextAreaElement | HTMLInputElement | null, bankName?: TBankNames): void {
    if (!bankName) bankName = 'statusbank';
    if (!inputField || !inputField.value) return;
    inputField.disabled = true;
    if (submitButton) {
        submitButton.disabled = true;
    }
    let transactions = calculateTransactions(bankName, inputField);

    transactions.sort((a, b) => +(b.date).split('.').reverse().join('') - +(a.date).split('.').reverse().join(''));
    console.log(transactions);
    // alert(bankName === 'bankdabrabyt');
    // if (bankName == 'bankdabrabyt') {
    //     // alert('end function!');
    //     return;
    // };
    const startDate = transactions[transactions.length - 1].date;
    const endDate = transactions[0].date;
    let incomingMoney = 0;
    let paymentMoney = 0;
    transactions.forEach((transaction: IBankTransaction<typeof bankName>) => {
        if (transaction.moneyAdd > 0) {
            incomingMoney += transaction.moneyAdd;
        }
        if (transaction.moneyMinus > 0) {
            paymentMoney += transaction.moneyMinus;
        }
    });
    // transactions.forEach((transaction) => {
    //     if (transaction.moneyMinus > 0) {
    //         paymentMoney += transaction.moneyMinus;
    //     }
    // });
    

    if (outputBlock instanceof HTMLDivElement) {
        outputBlock.innerHTML = `
            <h2>${(startDate === endDate) ? `За ${startDate}:` : `За период с ${startDate} по ${endDate}:`}</h2>
            <p style="color: green; font-weight: bold;">Доходы: <span style="font-style: italic;">${Math.round(incomingMoney * 100) / 100} BYN</span></p>
            <p style="color: red; font-weight: bold;">Расходы: <span style="font-style: italic;">${Math.round(paymentMoney * 100) / 100} BYN</span></p>
        `;
    }
    // console.info(`За период с ${startDate} по ${endDate}:`);
    // console.info(`Доходы: ${incomingMoney} BYN`);
    // console.info(`Расходы: ${paymentMoney} BYN`);
    // console.log(transactions); 
}

function calculateTransactions(bankName: TBankNames, inputField: HTMLTextAreaElement | HTMLInputElement | null): IBankTransaction<typeof bankName>[] {
    if ((!inputField || !inputField.value) || !bankName) return [];
    let result: IBankTransaction<typeof bankName>[] = [];
    let dotsCounter: number = 0;
    let parseType: string = (bankName == 'statusbank') ? 'date' : 'money';
    let quotCounter: number = 0;
    let tmp: any[] = [];
    // let obj: IBankTransaction<typeof bankName> = {
    //     date: '',
    //     type: '',
    //     location: '',
    //     moneyAdd: 0,
    //     moneyMinus: 0,
    //     authorisationCode: '',
    //     rrn: '',
    //     MCC: '',
    // };
    let obj: IBankTransaction<typeof bankName> = (bankName == 'statusbank') ? {
        date: '',
        moneyAdd: 0,
        moneyMinus: 0,
        authorisationCode: '',
        rrn: '',
    } : {
        moneyAdd: 0,
        moneyMinus: 0,
        date: '',
        type: '',
        location: '',
        MCC: '',
    };
    let parseSubData: boolean = false;
    for (let i = 0; i < inputField.value.length; i++) {
        // alert(i + "  parseType: " + parseType + " tmp: " + tmp.join(''));
        if (bankName == 'statusbank') {
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
                } else if (inputField.value[i].match(/[0-9|.,]/gm)) {
                    tmp.push(inputField.value[i]);
                }
            } else if (parseType == 'money') {
                if (tmp.join('') == 'ZACHISLENIENASCHET') {
                    tmp = []; // Очищаем массив
                    parseType = 'incomingMoney'; // Переходим к разбору суммы дохода
                } else if (tmp.join('') == 'Оплата') {
                    tmp = []; // Очищаем массив
                    parseType = 'paymentMoney'; // Переходим к разбору суммы
                } else if (inputField.value[i].toLowerCase().match(/[а-я\a-z]/gm)) {
                    tmp.push(inputField.value[i]);
                }
            } else if (parseType == 'paymentMoney') {
                if (inputField.value[i].toLowerCase().match(/[a-z]/gm)) {
                    obj.moneyMinus += Number(tmp.join('')); // Добавляем сумму оплаты к расходам
                    // alert(obj.moneyMinus);
                    tmp = []; // Очищаем массив
                    parseType = 'authorizationCode'; // Переходим к коду авторизации
                } else if (inputField.value[i] != ' ' && inputField.value[i] != '-') {
                    if (inputField.value[i] == ',') {
                        tmp.push('.');
                    } else {
                        tmp.push(inputField.value[i]);
                    }
                }
            } else if (parseType == 'incomingMoney') {
                if (inputField.value[i].toLowerCase().match(/[a-z]/gm)) {
                    obj.moneyAdd += Number(tmp.join('')); // Добавляем сумму оплаты к доходам
                    tmp = []; // Очищаем массив
                    parseType = 'authorizationCode'; // Переходим к коду авторизации
                } else if (inputField.value[i] != ' ' && inputField.value[i] != '-') {
                    if (inputField.value[i] == ',') {
                        tmp.push('.');
                    } else {
                        tmp.push(inputField.value[i]);
                    }
                }
            } else if (parseType == 'authorizationCode') {
                if (inputField.value[i] == '	' && tmp.length == 6) {
                    // alert(tmp.join(''));
                    (obj as IBankTransaction<'statusbank'>).authorisationCode = tmp.join(''); // Записываем код авторизации в объект
                    tmp = []; // Очищаем массив
                    parseType = 'RRN';
                } else if (inputField.value[i].match(/[0-9]/gm)) {
                    tmp.push(inputField.value[i]);
                }
            } else if (parseType == 'RRN') {
                if (inputField.value[i] == '	' && tmp.length == 12) {
                    // alert(tmp.join(''));
                    (obj as IBankTransaction<'statusbank'>).rrn = tmp.join(''); // Записываем RRN в объект
                    tmp = []; // Очищаем массив tmp
                    parseType = 'operationLocation'; // Переходим к месту совершения операции
                    dotsCounter = 0;
                } else if (inputField.value[i].toLowerCase().match(/[0-9,a-z]/gm)) {
                    tmp.push(inputField.value[i]);
                }
            } else if (parseType == 'operationLocation') {
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
        } else if (bankName == 'bankdabrabyt') {
            console.log(`#${i}  ::   Current Symbol: "${inputField.value[i]}";\nparseType="${parseType}";\nparseSubData="${parseSubData}";`);
            console.log(`Value[i + 1]: "${inputField.value[i + 1]}";`);
            if (parseType == 'money') {
                if (inputField.value[i] == '+') {
                    parseType = 'incomingMoney';
                } else if (inputField.value[i] == '-') {
                    parseType = 'paymentMoney';
                }
                // parseType = (inputField.value[i] == '+') ? 'incomingMoney' : 'paymentMoney';
                tmp = [];
            } else if (parseType == 'incomingMoney') {
                if (inputField.value[i] == '\n') {
                    parseType = 'date';
                    tmp = [];
                } else if (inputField.value[i] == ' ') {
                    obj.moneyAdd += Number(tmp.join(''));
                    // console.log(`money Add: ${obj.moneyAdd}`);
                } else {
                    tmp.push(inputField.value[i]);
                }
            } else if (parseType == 'paymentMoney') {
                if (inputField.value[i] == '\n') {
                    parseType = 'date';
                    tmp = [];
                } else if (inputField.value[i] == ' ') {
                    obj.moneyMinus += Number(tmp.join(''));
                    console.log(`Payment Money: ${obj.moneyMinus}`);
                } else {
                    tmp.push(inputField.value[i]);
                }
            } else if (parseType == 'date') {
                if (inputField.value[i] == ' ') {
                    // console.log('DATE: ' + tmp.join(''));
                    obj.date = tmp.join('');
                    parseType = 'time';
                } else {
                    tmp.push(inputField.value[i]);
                }
            } else if (parseType == 'time') {
                if (inputField.value[i] == '\n') {
                    parseType = 'transactionType';
                    tmp = [];
                }
            } else if (parseType == 'transactionType') {
                // console.log(`value[i+1]: ${inputField.value[i + 1]}`);
                if (inputField.value[i] == '\n') {
                    (obj as IBankTransaction<'bankdabrabyt'>).type = tmp.join('');
                    // console.log('Transaction TYPE: ' + tmp.join(''));
                    // console.log(`value[i+1]: ${inputField.value[i + 1]}`);
                    console.log(inputField.value[i + 1].toLowerCase());
                    if (inputField.value[i + 1].toLowerCase().match(/[а-я]/g)) {
                        // Разобраться, почему не работает этот код!!! 
                        parseType = 'transactionLocation';
                        parseSubData = false;
                        // console.log(`Current Symbol: ${inputField.value[i+1]};\nparseType=${parseType};\nparseSubData=${parseSubData}`);
                    } else {
                        // Переходим к разбору следующей транзакции
                        dotsCounter = 0;
                        quotCounter = 0;
                        // alert(inputField.value[i-1]);
                        tmp = [];
                        result.push(obj);
                        obj = {
                            moneyAdd: 0,
                            moneyMinus: 0,
                            date: '',
                            type: '',
                            location: '',
                            MCC: '',
                        }
                        parseType = 'money';
                        // i -= 1;
                    }
                } else {
                    tmp.push(inputField.value[i]);
                }
            } else if (parseType == 'transactionLocation') {

                // console.log('Parsing Transaction Location! :: ' + parseSubData);
                if (parseSubData) {
                    if (inputField.value[i] == '\n') {
                        (obj as IBankTransaction<'bankdabrabyt'>).location = tmp.join('');
                        if (inputField.value[i + 1].toLowerCase().match(/[a-z]/g)) {
                            parseType = 'MCC';
                            parseSubData = false;
                            tmp = [];
                        } else {
                            // Переходим к разбору следующей транзакции
                            dotsCounter = 0;
                            quotCounter = 0;
                            // alert(inputField.value[i-1]);
                            tmp = [];
                            result.push(obj);
                            obj = {
                                moneyAdd: 0,
                                moneyMinus: 0,
                                date: '',
                                type: '',
                                location: '',
                                MCC: '',
                            }
                            parseType = 'money';
                            // i -= 1;
                        }
                    } else {
                        // console.log('Parse Location!');
                        tmp.push(inputField.value[i]);
                    }
                } else {
                    if (inputField.value[i] == ':') {
                        tmp = [];
                        parseSubData = true;
                    }
                }
            } else if (parseType == 'MCC') {
                // let parseMCC: boolean = false;
                if (parseSubData) {
                    if (inputField.value[i] == '\n' || inputField.value[i+1] == undefined) {
                        (obj as IBankTransaction<'bankdabrabyt'>).MCC = tmp.join('');
                        // Переходим к разбору следующей транзакции
                        dotsCounter = 0;
                        quotCounter = 0;
                        // alert(inputField.value[i-1]);
                        tmp = [];
                        result.push(obj);
                        obj = {
                            moneyAdd: 0,
                            moneyMinus: 0,
                            date: '',
                            type: '',
                            location: '',
                            MCC: '',
                        }
                        parseType = 'money';
                        // i -= 1;

                    } else {
                        if (inputField.value[i].match(/[0-9]/g)) {
                            tmp.push(inputField.value[i]);
                        }
                    }
                } else {
                    if (inputField.value[i] == ':') {
                        tmp = [];
                        parseSubData = true;
                    }
                }
            }
        }
        // console.log(dotsCounter + " " + inputField.value[i]);
        // outputBlock.innerHTML += inputField.value[i] + '<br>';
    }

    console.info(result);
    return result;
}