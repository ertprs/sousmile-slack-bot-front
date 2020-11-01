// Require the Bolt package (github.com/slackapi/bolt)
const { App } = require("@slack/bolt");

// const messages = require('./messages');
// const welcome = require('./welcome');
const http = require('http');
const axios = require('axios');

const app = new App({
  // token: process.env.SLACK_BOT_TOKEN,
  // signingSecret: process.env.SLACK_SIGNING_SECRET
  token: 'xoxb-405218432613-1467840145619-aADCIv7Gs3SkCCUYX4EjtZEu',
  signingSecret: 'a451024b17f98232d1f9c2351490d91b'
});


app.view('techops', async ({ payload, ack, context }) => {
  ack();
  console.log('techops view submission');
});

app.shortcut('open_techops',  async ({ payload, ack, context }) => {
  ack();

  try {
    // Call the views.open method using the built-in WebClient
    const result = await app.client.views.open({
      token: context.botToken,
      trigger_id: payload.trigger_id,
      callback_id: 'techops',
      view: {
        "callback_id": 'techops',
        "type": "modal",
        "title": {
          "type": "plain_text",
          "text": "Descreva o problema",
          "emoji": true
        },
        "submit": {
          "type": "plain_text",
          "text": "Solicitar",
          "emoji": true
        },
        "close": {
          "type": "plain_text",
          "text": "Cancelar",
          "emoji": true
        },
        "blocks": [
          {
            "type": "input",
            "element": {
              "type": "plain_text_input",
              "action_id": "customer"
            },
            "label": {
              "type": "plain_text",
              "text": "Informe o nome, email ou case code do usuário",
              "emoji": true
            }
          },
          {
            "type": "input",
            "label": {
              "type": "plain_text",
              "text": "Prioridade",
              "emoji": true
            },
            "element": {
              "type": "static_select",
              "action_id": "priority",
              "placeholder": {
                "type": "plain_text",
                "text": "Prioridade",
                "emoji": true
              },
              "options": [
                {
                  "text": {
                    "type": "plain_text",
                    "text": "Alta",
                    "emoji": true
                  },
                  "value": "HIGH"
                },
                {
                  "text": {
                    "type": "plain_text",
                    "text": "Média",
                    "emoji": true
                  },
                  "value": "MEDIUM"
                },
                {
                  "text": {
                    "type": "plain_text",
                    "text": "Baixa",
                    "emoji": true
                  },
                  "value": "LOW"
                }
              ]
            }
          },
          {
            "type": "context",
            "elements": [
              {
                "type": "mrkdwn",
                "text": ":arrow_up: Alta  :arrow_left: Média  :arrow_down: Baixa"
              }
            ]
          },
          {
            "type": "input",
            "label": {
              "type": "plain_text",
              "text": "Descreva o problema",
              "emoji": true
            },
            "element": {
              "type": "plain_text_input",
              "action_id": "description",
              "multiline": true
            }
          }
        ]
      }
    });

    console.log(result);
  }
  catch (error) {
    console.error(error);
  }
});


(async () => {
  // Start your app
  await app.start(process.env.PORT || 3000);

  console.log('⚡️ Bolt app is running!!!!!!');
})();


