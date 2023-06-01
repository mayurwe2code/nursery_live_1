
// const VONAGE_API_KEY = "da317084"
// const VONAGE_API_SECRET = "Bh63J9S1TXVAZsEy"
// const TO_NUMBER = "9827803080"
// const VONAGE_BRAND_NAME = "grifskirt"

// const { MOVED_PERMANENTLY } = require('http-status-codes');

// import { Vonage } from '@vonage/server-sdk'

// const vonage = new Vonage({
//     apiKey: VONAGE_API_KEY,
//     apiSecret: VONAGE_API_SECRET
// })

// const from = VONAGE_BRAND_NAME
// const to = TO_NUMBER
// const text = 'A text message sent using the Vonage SMS API'

// async function sendSMS() {
//     await vonage.sms.send({ to, from, text })
//         .then(resp => { console.log('Message sent successfully'); console.log(resp); })
//         .catch(err => { console.log('There was an error sending the messages.'); console.error(err); });
// }

// sendSMS();

//----------------------------------try-2-------------------
// const { Vonage } = require('@vonage/server-sdk')

// const vonage = new Vonage({
//     apiKey: "da317084",
//     apiSecret: "Bh63J9S1TXVAZsEy"
// })


// const from = "919754869920"
// const to = "919827803082"
// const text = 'A text message sent using the Vonage SMS API'

// async function sendSMS() {
//     await vonage.sms.send({ to, from, text })
//         .then(resp => { console.log('Message sent successfully'); console.log(resp); })
//         .catch(err => { console.log('There was an error sending the messages.'); console.error(err); });
// }

// sendSMS();
//------------------------try3------------
// const twilio require("twilio")
// const accountSid = 'AC5816f8522da4a7a572809fc11dcd4fec';
// const authToken = '[5f62454f377a7adb3ae891ba0107812a]';
// const client = require('twilio')(accountSid, authToken);

// client.messages
//     .create({
//         body: 'abcderfg',
//         from: '+12542724679',
//         to: '+919827803082'
//     })
//     .then(message => console.log(message.sid))
//     .done();


//----------------------try4--------------

// API Key = 81394cc7002648d8dd67670c76aa1f10-11ecda0b-1099-4e24-9cac-f337f3901e06
//api bade url = yrq32d.api.infobip.com
// 447860099299 

// const id = 'AC5816f8522da4a7a572809fc11dcd4fec';
// const token = '5f62454f377a7adb3ae891ba0107812a';

// // Importing the Twilio module
// const twilio = require('twilio');

// // Creating a client
// const client = twilio(id, token);

// // Sending messages to the client
// client.messages
//     .create({

//         // Message to be sent
//         body: 'Hello from we2',

//         // Senders Number (Twilio Sandbox No.)
//         from: 'whatsapp:+14155238886',

//         // Number receiving the message
//         to: 'whatsapp:+919827803082'
//     })
//     .then(message => console.log("Message sent successfully")).catch((err) => { console.log(err) })


//-----------auth-1--------------------------------
// var sid = "AC5816f8522da4a7a572809fc11dcd4fec";
// var auth_token = "5f62454f377a7adb3ae891ba0107812a";

// //-----------auth-2--------------------------------
// var sid = "ACe194c0f944b727b231633a2e7aa48c50";
// var auth_token = "a56280988ddf4fa052aab0e46841359a";

// var twilio = require("twilio")(sid, auth_token);

// twilio.messages
//     .create({
//         from: "+12542725711",
//         to: "+919754869920",
//         body: "this is a testing message",
//     })
//     .then(function (res) { console.log("message has sent!") })
//     .catch(function (err) {
//         console.log(err);
//     });

// const accountSid = 'ACe194c0f944b727b231633a2e7aa48c50';
// const authToken = '[a56280988ddf4fa052aab0e46841359a]';
// const client = require('twilio')(accountSid, authToken);

// client.messages
//     .create({
//         body: 'xsbhoclikkkkkii',
//         from: '+12542725711',
//         to: '+919827803082'
//     })
//     .then(message => console.log(message.sid))
// +14155238886
// maybe-pink

// const accountSid = "ACe194c0f944b727b231633a2e7aa48c50";
// const authToken = 'a56280988ddf4fa052aab0e46841359a';
// const client = require('twilio')(accountSid, authToken);

// client.messages
//     .create({
//         from: 'whatsapp:+14155238886',
//         body: 'Hello there!',
//         to: 'whatsapp:+918770266990'
//     })
//     .then(message => console.log(message));

//---------------------------------------------------------------------

// const fetch = require('node-fetch');

// const sendMessage = async (phone, message) => {
//   const url = `https://api.chat-api.com/instanceYOUR_INSTANCE_ID/sendMessage?token=YOUR_TOKEN`;

//   const options = {
//     method: 'POST',
//     headers: {
//       'Content-Type': 'application/json'
//     },
//     body: JSON.stringify({
//       phone: `${phone}@c.us`,
//       body: message
//     })
//   };

//   const response = await fetch(url, options);
//   const result = await response.json();

//   return result;
// };

// // Usage example:
// sendMessage('1234567890', 'Hello from Node.js!')
//   .then(result => console.log(result))
//   .catch(error => console.error(error));



//---------------------------------------try--with---facebookk-----------------
// app_secret=    971908880cf1bef61d7103387394cd20
// app_id=   781018623415788
// fetch('https://graph.facebook.com/v16.0/781018623415788/messages', {
//     method: 'POST',
//     headers: {
//         'Authorization': 'Bearer EAAFl...',
//         'Content-Type': 'application/json'
//     },
//     body: JSON.stringify({
//         messaging_product: 'whatsapp',
//         to: '15555555555',
//         type: 'template',
//         template: {
//             name: 'hello_world',
//             language: {
//                 code: 'en_US'
//             }
//         }
//     })
// })
//     .then(response => {
//         console.log('Response:', response);
//     })
//     .catch(error => {
//         console.error('Error:', error);
//     });
