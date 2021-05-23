const router = require('express').Router();
const request = require('request');


router.route('/webhook')
  .get((req, res) => {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    if (mode && token && mode === 'subscribe' &&
      token === process.env.VERIFY_TOKEN) {
      console.log('WEBHOOK VERIFIED');
      return res.status(200).send(challenge);
    }
    console.log('UNAUTHORIZED');
    return res.sendStatus(403);
  })

  .post((req, res) => {
    const body = req.body;
    if (body.object !== 'page') {
      return res.sendStatus(404);
    }

    const MESSAGE_ATTACHMENTS_URL = 'https://graph.facebook.com/v10.0/me/message_attachments';
    const MESSAGE_URL = "https://graph.facebook.com/v2.6/me/messages";

    const bodyResponse = {
      recipient: null,
      message: {
        text: ''
      },
      messaging_type: 'RESPONSE',
    };

    let webhookEvent = null;

    body.entry.forEach(element => {
      webhookEvent = element.messaging[0];
    });

    if (!webhookEvent) {
      return res.sendStatus(403);
    }

    // SET RECEIVER
    bodyResponse.recipient = webhookEvent.sender;

    console.log(webhookEvent)
    

    if (webhookEvent.postback) {
      // payload & title
      return res.status(200).send('EVENT_RECEIVED');
    }


    if (webhookEvent.message) {
      // SET TEXT
      // bodyResponse.message.text = "Salut toi !";
      // bodyResponse['sender_action'] = "typing_on";

      bodyResponse.message = {
        attachment: {
          type: "template",
          payload: {
            template_type: "generic",
            elements: [{
              title: "Do you want more ?",
              subtitle: "Tap a button to answer.",
              image_url: "https://images-eu.ssl-images-amazon.com/images/I/71kkMXAcLCL._AC_UL600_SR600,600_.png",
              buttons: [
                {
                  "type": "postback",
                  "title": "Yes!",
                  "payload": "yes",
                },
                {
                  "type": "postback",
                  "title": "No!",
                  "payload": "no",
                }
              ],
            }]
          }
        }
      };

      console.log(bodyResponse);

      request({
        uri: MESSAGE_URL,
        qs: { access_token: process.env.PAGE_ACCESS_TOKEN },
        method: 'POST',
        json: bodyResponse
      }, (err) => {
        if (!err) {
          console.log('message sent!');
        } else {
          console.error('Unable to send message:' + err);
        }
      });

      return res.status(200).send('EVENT_RECEIVED');
    }

    return res.status(200).send('EVENT_RECEIVED');
  });
module.exports = router;