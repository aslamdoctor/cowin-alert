const axios = require('axios').default;

const notifier = require('node-notifier');
const open = require('open');

const pincode = '396445';
// const today = new Date();
// checkCowinSlot(formatDate(today), pincode);
var onHold = false;

setInterval(() => {
	if (onHold == true) {
		onHold = false;
	}
}, 60000 * 5); // 5 minutes hold

setInterval(() => {
	if (!onHold) {
		var now = new Date();
		console.log('\nLog time: ' + now.toUTCString());

		const today = new Date();
		for (i = 1; i <= 3; i++) {
			const tomorrow = new Date(today);
			tomorrow.setDate(tomorrow.getDate() + i);
			const date = formatDate(tomorrow);
			checkCowinSlot(date, pincode);
		}
	} else {
		console.log('On hold...');
	}
}, 5000);

async function checkCowinSlot(date, pincode) {
	let source = `https://cdn-api.co-vin.in/api/v2/appointment/sessions/public/findByPin?pincode=${pincode}&date=${date}`;
	//console.log('source:', source);

	await axios
		.get(source, {
			headers: {
				'user-agent':
					'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.93 Safari/537.36',
			},
		})
		.then((response) => {
			// handle success
			if (isJson(response.data)) {
				if (response.data.sessions.length > 0) {
					let notification_text = '';
					response.data.sessions.forEach((session) => {
						if (session.available_capacity_dose1 > 0) {
							notification_text = `
Place: ${session.name}
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
				console.log(`No slots found for ${date}`);
			}
		})
		.catch((error) => {
			// handle error
			//console.log(error);
			console.log(`Request locked`);
			onHold = true;
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
