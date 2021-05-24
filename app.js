const request = require('request');
const notifier = require('node-notifier');
const open = require('open');

setInterval(() => {
	var now = new Date();
	console.log('\nLog time: ' + now.toUTCString());

	const today = new Date();
	for (i = 1; i <= 3; i++) {
		const tomorrow = new Date(today);
		tomorrow.setDate(tomorrow.getDate() + i);
		const date = formatDate(tomorrow);
		checkCowinSlot(date);
	}
}, 5000);

async function checkCowinSlot(date) {
	let source =
		'https://cdn-api.co-vin.in/api/v2/appointment/sessions/public/findByPin?pincode=396445&date=';

	await request(`${source}${date}`, function (error, response, body) {
		if (isJson(response.body)) {
			let json_response = JSON.parse(response.body);
			if (json_response.sessions.length > 0) {
				let notification_text = '';
				json_response.sessions.forEach((session) => {
					if (session.available_capacity_dose1 > 0) {
						notification_text = `Place: ${session.name}
	Min. Age: ${session.min_age_limit}
	Vaccine: ${session.vaccine}
	Avail. Dose 1: ${session.available_capacity_dose1}
	Avail. Dose 2: ${session.available_capacity_dose2}
	Fee: ${session.fee_type}
	Slots: ${session.slots}
	`;
						notifier.notify({
							title: 'Cowin Alert',
							message: notification_text,
						});
						console.log(notification_text);
					}
				});

				notifier.on('click', function (notifierObject, options, event) {
					open('https://selfregistration.cowin.gov.in/');
				});
			} else {
				console.log(`No slots found for ${date}`);
			}
		} else {
			console.log(`Request timeout`);
		}
	});
}

// Format date
function formatDate(date) {
	var d = new Date(date),
		month = '' + (d.getMonth() + 1),
		day = '' + d.getDate(),
		year = d.getFullYear();

	if (month.length < 2) month = '0' + month;
	if (day.length < 2) day = '0' + day;

	return [day, month, year].join('-');
}

// Check if response is json
function isJson(str) {
	try {
		JSON.parse(str);
	} catch (e) {
		return false;
	}
	return true;
}

/* 
center_id: 599345,
name: 'Ba Cancer Hospital',
address: '',
state_name: 'Gujarat',
district_name: 'Navsari',
block_name: 'Navsari',
pincode: 396445,
from: '09:00:00',
to: '18:00:00',
lat: 20.945095,
long: 72.979164,
fee_type: 'Paid',
session_id: '59db7f1d-e173-4e99-9ae4-dd4fb06a6fec',
date: '31-03-2021',
available_capacity_dose1: 0,
available_capacity_dose2: 0,
available_capacity: 99,
fee: '0',
min_age_limit: 45,
vaccine: 'COVISHIELD',
slots: [Array] 
*/
