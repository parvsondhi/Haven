var express = require('express');
var bodyParser = require('body-parser');
var request = require('request');
var app = express();
var apiai = require('apiai');
var appai = apiai("c0f2b205eeaa485c8ec3b2172f750b2f");



var company;
job = "data science";
location = "san francisco";

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.listen((process.env.PORT || 3000));

// Server frontpage
app.get('/', function (req, res) {
    res.send('This is TestBot Server');
});

// Facebook Webhook
app.get('/webhook', function (req, res) {
    if (req.query['hub.verify_token'] === 'testbot_verify_token') {
        res.send(req.query['hub.challenge']);
    } else {
        res.send('Invalid verify token');
    }
});

// handler receiving messages
app.post('/webhook', function (req, res) {
    var events = req.body.entry[0].messaging;
    console.log("the entire list of events")
    console.log(events)
    console.log("iterating the loop")
    for (i = 0; i < events.length; i++) {
        var event = events[i];
        console.log("individual event " + event)
        if (event.message && event.message.text) {
          if (!kittenMessage(event.sender.id, event.message.text))
          {
            console.log("hello " + event.message.text)
            var requestai = appai.textRequest(event.message.text);

            requestai.on('response', function(response) {
              console.log("**********************************************************")
              console.log(response)
              console.log(response.result.parameters.geocity)
              console.log(response.result.parameters.role)
              replytext = response.result.fulfillment.speech
              if(response.result.parameters.geocity && response.result.parameters.role) {
                request({
                    url: 'http://api.indeed.com/ads/apisearch?publisher=7366968708885971&format=json&limit=3&v=2',
                    // url: 'http://api.indeed.com/ads/apisearch?publisher=7366968708885971&q=data%20science&l=san%20francisco&format=json&limit=3&v=2',
                    method: 'GET',
                    replytext: replytext,
                    qs: {q: response.result.parameters.role, l:response.result.parameters.geocity},
                }, function(error, response, body) {
                    var data = JSON.parse(body);
                    console.log("data hopefully displayed:");
                    console.log(event.message.text)
                    console.log(data.results[1].company);
                    console.log("is this is the issue")
                    console.log(replytext);
                    sendMessage(event.sender.id,{text: replytext})
                    kittenMessage2(event.sender.id, data.results[0].company, data.results[1].company, data.results[2].company, data.results[0].jobtitle, data.results[1].jobtitle, data.results[2].jobtitle, data.results[0].url,data.results[1].url,data.results[2].url )
                    //sendMessage(event.sender.id, {text: "Echo: " + event.message.text + data.results[1].company});;
                });

              }
              else{
              //console.log(typeof response.result.fulfillment.speech);
              sendMessage(event.sender.id,{text: replytext})
            }
            });

            requestai.on('error', function(error) {
             console.log(error);
            });

            requestai.end();

            //kittenMessage2(event.sender.id, "carlo", "parv")

            // request({
            //     url: 'http://api.indeed.com/ads/apisearch?publisher=7366968708885971&format=json&limit=3&v=2',
            //     // url: 'http://api.indeed.com/ads/apisearch?publisher=7366968708885971&q=data%20science&l=san%20francisco&format=json&limit=3&v=2',
            //     method: 'GET',
            //     qs: {q: job, l:event.message.text},
            // }, function(error, response, body) {
            //     var data = JSON.parse(body);
            //     console.log("data hopefully displayed:");
            //     console.log(event.message.text)
            //     console.log(data.results[1].company);
            //     kittenMessage2(event.sender.id, data.results[1].company, data.results[2].company)
            //     //sendMessage(event.sender.id, {text: "Echo: " + event.message.text + data.results[1].company});;
            // });
            //sendMessage(event.sender.id, {text: "Echo: " + event.message.text + company});
          }
        }

        else if(event.postback) {

          console.log(event.postback.payload)
        }

    }
    res.sendStatus(200);
});




// generic function sending messages
function sendMessage(recipientId, message) {
  console.log("the message " + message)
    request({
        url: 'https://graph.facebook.com/v2.6/me/messages',
        qs: {access_token: process.env.PAGE_ACCESS_TOKEN},
        method: 'POST',
        json: {
            recipient: {id: recipientId},
            message: message,
        }
    }, function(error, response, body) {
        if (error) {
            console.log('Error sending message: ', error);
        } else if (response.body.error) {
            console.log('Error: ', response.body.error);
        }
    });
};


// send rich message with kitten
function kittenMessage(recipientId, text) {

    text = text || "";
    var values = text.split(' ');

    if (values.length === 3 && values[0] === 'kitten') {
        if (Number(values[1]) > 0 && Number(values[2]) > 0) {

            var imageUrl = "https://placekitten.com/" + Number(values[1]) + "/" + Number(values[2]);

            message = {
                "attachment": {
                    "type": "template",
                    "payload": {
                        "template_type": "generic",
                        "elements": [{
                            "title": "Kitten",
                            "subtitle": "Cute kitten picture",
                            "image_url": imageUrl ,
                            "buttons": [{
                                "type": "web_url",
                                "url": imageUrl,
                                "title": "Show kitten"
                                }, {
                                "type": "postback",
                                "title": "I like this",
                                "payload": "User " + recipientId + " likes kitten " + imageUrl,
                            }],
                          },
                          {
                            "title": "Kitten",
                            "subtitle": "Cute kitten picture",
                            "image_url": imageUrl ,
                            "buttons": [{
                                "type": "web_url",
                                "url": imageUrl,
                                "title": "Show kitten"
                                }, {
                                "type": "postback",
                                "title": "I like this",
                                "payload": "User " + recipientId + " likes kitten " + imageUrl,
                    }],
                  }


                  ]
                    }
                }


            };

            sendMessage(recipientId, message);

            return true;
        }
    }

    return false;

};

function returnimage(companyname){
  var imageurl = '';
  request({
  url: 'https://api.cognitive.microsoft.com/bing/v5.0/images/search?mkt=en-us',
  method: 'GET',
  dataType: "json",
  headers: {'Ocp-Apim-Subscription-Key': '8f762e2427bb44eb8f4473d707575889'},
  qs: {q: companyname}
},function(error, response, body) {
  var data = JSON.parse(body);
  //console.log("data hopefully displayed:");
  //console.log(data.value[0].thumbnailUrl)
  imageurl = data.value[0].thumbnailUrl;
});

    return imageurl;

}

// send rich message with kitten
function kittenMessage2(recipientId, company1, company2, company3, jobtitle1, jobtitle2, jobtitle3, url1, url2, url3) {

    // text = text || "";
    // var values = text.split(' ');
    //
    // if (values.length === 3 && values[0] === 'kitten') {
    //     if (Number(values[1]) > 0 && Number(values[2]) > 0) {
    //
company1_url = returnimage(company1);
company2_url = returnimage(company2);
company3_url = returnimage(company3);
console.log("url")
console.log(company1_url)
             var imageUrl = "https://placekitten.com/" + Number(200) + "/" + Number(300);

            message = {
                "attachment": {
                    "type": "template",
                    "payload": {
                        "template_type": "generic",
                        "elements": [{
                            "title": company1,
                            "subtitle": jobtitle1,
                            "image_url": "icon.jpeg" ,
                            "buttons": [{
                                "type": "web_url",
                                "url": url1,
                                "title": "Apply Now"
                                }, {
                                "type": "postback",
                                "title": "I like this",
                                "payload": "User " + recipientId + " likes kitten " + imageUrl,
                            }],
                          },
                          {
                            "title": company2,
                            "subtitle": jobtitle2,
                            "image_url": company2_url ,
                            "buttons": [{
                                "type": "web_url",
                                "url": url2,
                                "title": "Apply Now"
                                }, {
                                "type": "postback",
                                "title": "I like this",
                                "payload": "User " + recipientId + " likes kitten " + imageUrl,
                    }],
                  },
                  {
                    "title": company3,
                    "subtitle": jobtitle3,
                    "image_url": company3_url ,
                    "buttons": [{
                        "type": "web_url",
                        "url": url3,
                        "title": "Apply Now"
                        }, {
                        "type": "postback",
                        "title": "I like this",
                        "payload": "User " + recipientId + " likes kitten " + imageUrl,
            }],
          }


                  ]
                    }
                }


            };

            sendMessage(recipientId, message);

            return true;
    //     }
    // }
    //
    // return false;

};
