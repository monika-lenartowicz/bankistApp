"use strict";

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

///NOTE Data /
/*
const account1 = {
	owner: "Jonas Schmedtmann",
	movements: [200, 450, -400, 3000, -650, -130, 70, 1300],
	interestRate: 1.2, // %
	pin: 1111,
};

const account2 = {
	owner: "Jessica Davis",
	movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
	interestRate: 1.5,
	pin: 2222,
};

const account3 = {
	owner: "Steven Thomas Williams",
	movements: [200, -200, 340, -300, -20, 50, 400, -460],
	interestRate: 0.7,
	pin: 3333,
};

const account4 = {
	owner: "Sarah Smith",
	movements: [430, 1000, 700, 50, 90],
	interestRate: 1,
	pin: 4444,
};

const accounts = [account1, account2, account3, account4];


//NOTE DIFFERENT DATA! Contains movement dates, currency and locale
*/

const account1 = {
	owner: "Jonas Schmedtmann",
	movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
	interestRate: 1.2, // %
	pin: 1111,

	movementsDates: [
		"2019-11-18T21:31:17.178Z",
		"2019-12-23T07:42:02.383Z",
		"2020-01-28T09:15:04.904Z",
		"2020-04-01T10:17:24.185Z",
		"2020-05-08T14:11:59.604Z",
		"2020-05-27T17:01:17.194Z",
		"2020-07-11T23:36:17.929Z",
		"2020-07-12T10:51:36.790Z",
	],
	currency: "EUR",
	locale: "pt-PT", // de-DE
};

const account2 = {
	owner: "Jessica Davis",
	movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
	interestRate: 1.5,
	pin: 2222,

	movementsDates: [
		"2019-11-01T13:15:33.035Z",
		"2019-11-30T09:48:16.867Z",
		"2019-12-25T06:04:23.907Z",
		"2020-01-25T14:18:46.235Z",
		"2020-02-05T16:33:06.386Z",
		"2020-01-19T14:43:26.374Z",
		"2023-01-25T18:49:59.371Z",
		"2023-01-27T12:01:20.894Z",
	],
	currency: "USD",
	locale: "en-US",
};

const accounts = [account1, account2];

// Elements
const labelWelcome = document.querySelector(".welcome");
const labelDate = document.querySelector(".date");
const labelBalance = document.querySelector(".balance__value");
const labelSumIn = document.querySelector(".summary__value--in");
const labelSumOut = document.querySelector(".summary__value--out");
const labelSumInterest = document.querySelector(".summary__value--interest");
const labelTimer = document.querySelector(".timer");

const containerApp = document.querySelector(".app");
const containerMovements = document.querySelector(".movements");

const btnLogin = document.querySelector(".login__btn");
const btnTransfer = document.querySelector(".form__btn--transfer");
const btnLoan = document.querySelector(".form__btn--loan");
const btnClose = document.querySelector(".form__btn--close");
const btnSort = document.querySelector(".btn--sort");

const inputLoginUsername = document.querySelector(".login__input--user");
const inputLoginPin = document.querySelector(".login__input--pin");
const inputTransferTo = document.querySelector(".form__input--to");
const inputTransferAmount = document.querySelector(".form__input--amount");
const inputLoanAmount = document.querySelector(".form__input--loan-amount");
const inputCloseUsername = document.querySelector(".form__input--user");
const inputClosePin = document.querySelector(".form__input--pin");

const currencies = new Map([
	["USD", "United States dollar"],
	["EUR", "Euro"],
	["GBP", "Pound sterling"],
]);

/////////////////////////////////////////////////

// const movements = [200, 450, -400, 3000, -650, -130, 70, 1300];
// containerMovements.innerHTML = "";

const formatMovementDate = function (date, locale) {
	const calcDayPassed = (date1, date2) => Math.round(Math.abs(date2 - date1) / (1000 * 60 * 60 * 24));

	const daysPassed = calcDayPassed(new Date(), date);
	console.log(daysPassed);
	if (daysPassed === 0) return "Today";
	if (daysPassed === 1) return "Yesterday";
	if (daysPassed <= 7) return `${daysPassed} days ago`;

	// const numDay = `${date.getDate()}`.padStart(2, 0);
	// const month = `${date.getMonth() + 1}`.padStart(2, 0);
	// const year = date.getFullYear();

	// return `${numDay}/${month}/${year}`;
	return new Intl.DateTimeFormat(locale).format(date);
};

const formatCurrency = (value, locale, currency) => {
	return new Intl.NumberFormat(locale, {
		style: "currency",
		currency: currency,
	}).format(value);
};

const displayMovements = function (account, sort = false) {
	const movs = sort ? account.movements.slice().sort((a, b) => a - b) : account.movements;

	movs.forEach(function (movement, index) {
		const type = movement > 0 ? "deposit" : "withdrawal";
		const date = new Date(account.movementsDates[index]);
		const displayDate = formatMovementDate(date, account.locale);
		const formattedMovement = formatCurrency(movement, account.locale, account.currency);

		const html = ` 
			<div class='movements__row'>
				<div class='movements__type movements__type--${type}'>${index + 1} ${type}</div>
				 <div class="movements__date">${displayDate}</div>
				<div class='movements__value'>${formattedMovement}</div>
			</div>`;
		containerMovements.insertAdjacentHTML("afterbegin", html);
	});
};

// displayMovements(account1.movements);

const calcDisplayBalance = account => {
	const balance = account.movements.reduce((acc, curr) => acc + curr, 0);
	account.balance = balance;
	labelBalance.textContent = formatCurrency(account.balance, account.locale, account.currency);
};

// calcDisplayBalance(account1.movements);

const calcDisplaySummary = account => {
	const incomes = account.movements.filter(mov => mov > 0).reduce((acc, mov) => acc + mov, 0);
	labelSumIn.textContent = formatCurrency(incomes, account.locale, account.currency);

	const outcomes = account.movements.filter(mov => mov < 0).reduce((acc, mov) => acc + mov, 0);
	labelSumOut.textContent = formatCurrency(Math.abs(outcomes), account.locale, account.currency);

	const interest = account.movements
		.filter(mov => mov > 0)
		.map(deposit => (deposit * account.interestRate) / 100)
		.filter((interest, index, arr) => {
			return interest >= 1;
		})
		.reduce((acc, interest) => acc + interest, 0);

	labelSumInterest.textContent = formatCurrency(interest, account.locale, account.currency);
};

// calcDisplaySummary(account1.movements);

const createUsernames = accs => {
	accs.forEach(acc => {
		acc.username = acc.owner
			.toLowerCase()
			.split(" ")
			.map(word => word[0])
			.join("");
	});

	// const username = user
	// 	.toLowerCase()
	// 	.split(" ")
	// 	.map(word => word[0])
	// 	.join("");
	// return username;
};

createUsernames(accounts);

// const deposits = movements.filter(mov => mov > 0);
// const withdrawals = movements.filter(mov => mov < 0);

// Event handler
const updateUi = currentAccount => {
	//display movements
	displayMovements(currentAccount);
	//display balance
	calcDisplayBalance(currentAccount);
	//display summary
	calcDisplaySummary(currentAccount);
};

let currentAccount;

//fake always logged in
currentAccount = account1;
updateUi(currentAccount);
containerApp.style.opacity = 100;

//experimented api

btnLogin.addEventListener("click", function (e) {
	e.preventDefault();

	currentAccount = accounts.find(acc => acc.username === inputLoginUsername.value);
	console.log(currentAccount);
	if (currentAccount?.pin === Number(inputLoginPin.value)) {
		// display UI and message
		labelWelcome.textContent = `Welcome back, ${currentAccount.owner.split(" ")[0]}`;
		containerApp.style.opacity = 100;

		const now = new Date();
		const option = {
			hour: "numeric",
			minute: "numeric",
			day: "numeric",
			month: "numeric",
			year: "numeric",
			// weekday: "long",
		};
		labelDate.textContent = new Intl.DateTimeFormat(currentAccount.locale, option).format(now);

		// labelDate.textContent = `${day}/${month}/${year}, ${hours}:${min}`;

		//clear inputs fields
		inputLoginUsername.value = "";
		inputLoginPin.value = "";
		inputClosePin.blur();

		updateUi(currentAccount);
	} else {
		labelWelcome.textContent = "Not correct: username or PIN";
		labelWelcome.style.color = "red";
		inputLoginUsername.value = "";
		inputLoginPin.value = "";
		updateUi(currentAccount);
	}
});

btnTransfer.addEventListener("click", function (e) {
	e.preventDefault();

	const amount = Number(inputTransferAmount.value);
	const receiverAccount = accounts.find(account => account.username === inputTransferTo.value);
	inputTransferAmount.value = inputTransferTo.value = "";

	if (
		amount > 0 &&
		receiverAccount &&
		currentAccount.balance >= amount &&
		receiverAccount?.username !== currentAccount.username
	) {
		currentAccount.movements.push(-amount);
		receiverAccount.movements.push(amount);

		//add transfer date
		currentAccount.movementsDates.push(new Date().toISOString());
		receiverAccount.movementsDates.push(new Date().toISOString());
		updateUi(currentAccount);
	}
});

btnLoan.addEventListener("click", function (e) {
	e.preventDefault();
	const amount = Math.floor(inputLoanAmount.value);
	if (amount > 0 && currentAccount.movements.some(mov => mov >= mov * 0.1)) {
		// add movement
		currentAccount.movements.push(amount);
		currentAccount.movementsDates.push(new Date().toISOString());
		// updateUi
		updateUi(currentAccount);
	}
	inputLoanAmount.value = "";
});

btnClose.addEventListener("click", function (e) {
	e.preventDefault();
	// clear inputs value

	if (inputCloseUsername.value === currentAccount.username && Number(inputClosePin.value) === currentAccount.pin) {
		const index = accounts.findIndex(account => account.username === currentAccount.username);
		//delete account
		accounts.splice(index, 1);
		//hide UI
		containerApp.style.opacity = 0;
	}

	inputCloseUsername.value = inputClosePin.value = "";
	labelWelcome.textContent = "Log in to get started";
});

let sorted = false;

btnSort.addEventListener("click", function (e) {
	e.preventDefault();
	displayMovements(currentAccount, !sorted);
	sorted = !sorted;
});

//////////////////////////////////////////////
///// NOTE -----EXERCISE ARRAY---- NOTE //////
//////////////////////////////////////////////

//reduce = accumulator → SNOWBALL

//maximum balance__value
// const max = movements.reduce(
// 	(acc, mov) => (acc > mov ? acc : mov),
// 	movements[0]
// 	if (acc > mov) {
// 		return acc;
// 	} else return mov;
// );

const account = accounts.find(account => account.owner === "Jessica Davis");

//flat - could be used 2 or more levels deep
const overallBalance = accounts
	.map(account => account.movements)
	.flat()
	.reduce((acc, mov) => acc + mov, 0);

console.log(overallBalance);

//flatMap 1level deep
const overallBalance2 = accounts
	.map(account => account.movements)
	.flat()
	.reduce((acc, mov) => acc + mov, 0);

console.log(overallBalance2);

// const accountsMovements = accounts.map(account => account.movements);
// console.log(accountsMovements);
// const allMovements = accountsMovements.flat();
// console.log(allMovements);
// const overallBalance = allMovements.reduce((acc, mov) => acc + mov, 0);
// console.log(overallBalance);

// EXERCISE ARRAY
// 1.
const bankDepositSum = accounts
	.map(account => account.movements)
	.flat()
	.filter(el => el > 0)
	.reduce((acc, dep) => acc + dep, 0);
console.log(bankDepositSum);

// 2.
const numDeposit1000 = accounts
	.map(account => account.movements)
	.flat()
	.filter(el => el >= 1000).length;
console.log(numDeposit1000);

const numDeposit1000a = accounts
	.flatMap(account => account.movements)
	.reduce((acc, cur) => (cur >= 1000 ? ++acc : acc), 0);

console.log(numDeposit1000a);

// 3.
const sums = accounts
	.flatMap(account => account.movements)
	.reduce(
		(sums, cur) => {
			cur > 0 ? (sums.deposits += cur) : (sums.withdrawals += cur);
			//sums = {deposits: 0, withdrawals:0}
			return sums; //jeśli jest ciało funkcji strzałkowej to musi być return acc = tu akurat sums
		},
		{ deposits: 0, withdrawals: 0 }
	);

console.log(sums);

// 4.
//this is the nice title → This Is A Nice title
const convertTitleCase = function (title) {
	const capitalize = string => string[0].toUpperCase() + string.slice(1);
	const exceptions = ["a", "an", "the", "but", "or", "on", "with", "in", "and"];
	const titleCase = title
		.toLowerCase()
		.split(" ")
		.map(word => (exceptions.includes(word) ? word : capitalize(word)))
		.join(" ");
	return capitalize(title);
};

console.log(convertTitleCase("this is the nice title"));
console.log(convertTitleCase("this is the nice title, but not to long"));
console.log(convertTitleCase("and here is another title with an EXAMPLE"));

//CHALLENGE
// 1.
const dogs = [
	{ weight: 22, curFood: 250, owners: ["Alice", "Bob"] },
	{ weight: 8, curFood: 200, owners: ["Matilda"] },
	{ weight: 13, curFood: 275, owners: ["Sarah", "John"] },
	{ weight: 32, curFood: 340, owners: ["Michael"] },
];

dogs.forEach(dog => (dog.recommendedFood = Math.trunc(dog.weight ** 0.75 * 28)));
console.log(dogs);

// 2. find the owner
const dogSarah = dogs.find(dog => dog.owners.includes("Sarah"));
console.log(
	`${dogSarah.owners[0]}'s dog is eating too ${dogSarah.curFood > dogSarah.recommendedFood ? "much" : "little"}`
);

// 3.
const ownersEatTooMuch = dogs
	.filter(dog => dog.curFood > dog.recommendedFood)
	.map(dog => dog.owners)
	.flat();
console.log(ownersEatTooMuch);

const ownersEatLittle = dogs.filter(dog => dog.curFood < dog.recommendedFood).flatMap(dog => dog.owners);

console.log(ownersEatLittle);

// 4.
console.log(`${ownersEatTooMuch.join(", ")}'s dogs eat too much!`);
console.log(`${ownersEatLittle.join(", ")}'s dogs eat too little!`);

// 5.
console.log(dogs.some(dog => dog.curFood === dog.recommendedFood));

// 6.
const checkEatingOk = dog => dog.curFood > dog.recommendedFood * 0.9 && dog.curFood < dog.recommendedFood * 1.1;
console.log(dogs.some(checkEatingOk));

// 7.
console.log(dogs.filter(checkEatingOk));

// 8.
const dogsSorted = dogs.slice().sort((a, b) => a.recommendedFood - b.recommendedFood);
console.log(dogsSorted);
