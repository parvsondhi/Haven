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
          //if (!kittenMessage(event.sender.id, event.message.text))
          //{
            console.log("hello " + event.message.text)
            var requestai = appai.textRequest(event.message.text);

            requestai.on('response', function(response) {
              console.log("**********************************************************")
              console.log(response)
              console.log(response.result.parameters.geocity)
              console.log(response.result.parameters.role)
              replytext = response.result.fulfillment.speech
              rolesend = response.result.parameters.role
              locsend = response.result.parameters.geocity
              if(response.result.parameters.geocity && response.result.parameters.role) {
                request({
                    url: 'http://api.indeed.com/ads/apisearch?publisher=7366968708885971&format=json&limit=3&v=2',
                    // url: 'http://api.indeed.com/ads/apisearch?publisher=7366968708885971&q=data%20science&l=san%20francisco&format=json&limit=3&v=2',
                    method: 'GET',
                    replytext: replytext,
                    rolesend: rolesend,
                    locsend: locsend,
                    qs: {q: response.result.parameters.role, l:response.result.parameters.geocity},
                }, function(error, response, body) {
                    var data = JSON.parse(body);
                    console.log("data hopefully displayed:");
                    console.log(event.message.text)
                    console.log(data.results[1].company);
                    console.log("is this is the issue")
                    console.log(replytext);
                    sendMessage(event.sender.id,{text: replytext})
                    kittenMessage2(event.sender.id, data.results[0].company, data.results[1].company, data.results[2].company, data.results[0].jobtitle, data.results[1].jobtitle, data.results[2].jobtitle, data.results[0].url, data.results[1].url, data.results[2].url, data.results[0].snippet, data.results[1].snippet, data.results[2].snippet,rolesend, locsend)
                    //sendMessage(event.sender.id, {text: "Echo: " + event.message.text + data.results[1].company});;
                });

              }

              else if(response.result.parameters.No){
                sendButtonMessage(event.sender.id, replytext)


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
          //}
        }

        else if(event.postback) {
          //var requestai = appai.textRequest(event.postback.payload);
          var newstring = event.postback.payload.split("s_t")
          console.log(newstring[0])
          console.log(newstring[1])
          console.log(newstring[2])
          console.log(newstring[3])
          console.log(newstring[4])
          if(!(newstring[1].localeCompare("jobsummary"))){
          var regex = /(<([^>]+)>)|(\s&amp)/ig;
          result = newstring[0].replace(regex, "");
          // if(event.postback.title == "Show Job Summary")
          console.log("##@@!!!!!!!!!!!!!!")
          console.log(newstring[0])
          console.log(newstring[1])
          console.log(newstring[2])
          console.log(newstring[3])
          console.log(newstring[4])

          //sendMessage(event.sender.id,{text: result})
          sendButtonMessage2(event.sender.id,result,newstring[2],newstring[3],newstring[4])

        }
        else if (!(newstring[1].localeCompare("findmore"))) {
          var roletobesearched = newstring[2];
          var locationtobesearched = newstring[3];
          console.log(roletobesearched)
          console.log(locationtobesearched)
          replytext = event.sender.id
          request({
              url: 'http://api.indeed.com/ads/apisearch?publisher=7366968708885971&format=json&limit=3&v=2',
              // url: 'http://api.indeed.com/ads/apisearch?publisher=7366968708885971&q=data%20science&l=san%20francisco&format=json&limit=3&v=2',
              method: 'GET',
              replytext: replytext,
              rolesend: roletobesearched,
              locsend: locationtobesearched,
              qs: {q: roletobesearched, l:locationtobesearched},
          }, function(error, response, body) {
              var data = JSON.parse(body);
              console.log("data hopefully displayed:");
              //console.log(event.message.text)
              console.log(data.results[1].company);
              console.log("is this is the issue")
              //console.log(replytext);
              kittenMessage2(replytext, data.results[0].company, data.results[1].company, data.results[2].company, data.results[0].jobtitle, data.results[1].jobtitle, data.results[2].jobtitle, data.results[0].url, data.results[1].url, data.results[2].url, data.results[0].snippet, data.results[1].snippet, data.results[2].snippet,rolesend, locsend)

          });

        }
        else {
          console.log("normal")
          sendMessage(event.sender.id, {text: newstring[0]})
        }
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

// function sendMessage2(message) {
//   console.log("the message " + message)
//     request({
//         url: 'https://graph.facebook.com/v2.6/me/messages',
//         qs: {access_token: process.env.PAGE_ACCESS_TOKEN},
//         method: 'POST',
//         json: message
//
//     }, function(error, response, body) {
//         if (error) {
//             console.log('Error sending message: ', error);
//         } else if (response.body.error) {
//             console.log('Error: ', response.body.error);
//         }
//     });
// };


function sendButtonMessage2(recipientId,message,urlvalue,role,location) {
   messageData = {
      "attachment": {
        "type": "template",
        "payload": {
          "template_type": "button",
          "text": message,
          "buttons":[{
            "type": "web_url",
            "url": urlvalue,
            "title": "Apply Now"
          }, {
            "type": "postback",
            "title": "Find More",
            "payload": "emptys_tfindmores_t" + role + "s_t" + location
          }]
        }
      }
    };

  sendMessage(recipientId,messageData);
}

function sendButtonMessage1(recipientId,message) {
   messageData = {
      "attachment": {
        "type": "template",
        "payload": {
          "template_type": "button",
          "text": message,
          "buttons":[{
            "type": "postback",
            "title": "Sure",
            "payload": "Coolio! Let's start by picking your city.s_tsurebutton"
          }, {
            "type": "postback",
            "title": "Not Today",
            "payload": "That's alright. Gotta clean up Siri's mess anyway. I'll be around!s_tnotodaybutton"
          }]
        }
      }
    };

  sendMessage(recipientId,messageData);
}

// function returnimage(companyname){
//   var imageurl = '';
//   request({
//   url: 'https://api.cognitive.microsoft.com/bing/v5.0/images/search?mkt=en-us',
//   method: 'GET',
//   dataType: "json",
//   headers: {'Ocp-Apim-Subscription-Key': '8f762e2427bb44eb8f4473d707575889'},
//   qs: {q: companyname}
// },function(error, response, body) {
//   var data = JSON.parse(body);
//   //console.log("data hopefully displayed:");
//   //console.log(data.value[0].thumbnailUrl)
//   imageurl = data.value[0].thumbnailUrl;
// });
//
//     return imageurl;
//
// }

// send rich message with kitten
function kittenMessage2(recipientId, company1, company2, company3, jobtitle1, jobtitle2, jobtitle3, url1, url2, url3, snippet1, snippet2, snippet3, jobrole, location) {

    // text = text || "";
    // var values = text.split(' ');
    //
    // if (values.length === 3 && values[0] === 'kitten') {
    //     if (Number(values[1]) > 0 && Number(values[2]) > 0) {
    //

console.log("url")
var imageurl2 = "https://s3-us-west-1.amazonaws.com/havenchatbot/green_postback_greyKoala-01.png";
var imageurl1 = "https://s3-us-west-1.amazonaws.com/havenchatbot/purple_postback_pinkKoala-01.png";
var imageurl3 = "https://s3-us-west-1.amazonaws.com/havenchatbot/blue_postback_greyKoala-01.png";
            message = {
                "attachment": {
                    "type": "template",
                    "payload": {
                        "template_type": "generic",
                        "elements": [{
                            "title": company1,
                            "subtitle": jobtitle1,
                            "image_url": imageurl1 ,
                            "buttons": [{
                                "type": "web_url",
                                "url": url1,
                                "title": "Apply Now"
                                }, {
                                "type": "postback",
                                "title": "Show Job Summary",
                                "payload":snippet1 + "s_t" + "jobsummary" + "s_t" + url1 + "s_t" + jobrole + "s_t" + location,
                            }],
                          },
                          {
                            "title": company2,
                            "subtitle": jobtitle2,
                            "image_url": imageurl2 ,
                            "buttons": [{
                                "type": "web_url",
                                "url": url2,
                                "title": "Apply Now"
                                }, {
                                "type": "postback",
                                "title": "Show Job Summary",
                                "payload": snippet2 + "s_t" + "jobsummary" + "s_t" + url2,
                    }],
                  },
                  {
                    "title": company3,
                    "subtitle": jobtitle3,
                    "image_url": imageurl3 ,
                    "buttons": [{
                        "type": "web_url",
                        "url": url3,
                        "title": "Apply Now"
                        }, {
                        "type": "postback",
                        "title": "Show Job Summary",
                        "payload": snippet3 + "s_t" + "jobsummary" + "s_t" + url3,
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
