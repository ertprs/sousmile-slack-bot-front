const axios = require('axios');
const viewBlock = require('./blocks');


function translateStatus(status) {
  let translated = 'ABERTO';
  if (status == 'SOLVING') {
    translated = 'EM ANDAMENTO';
  } else if (status == 'FINISHED') {
    translated = 'RESOLVIDO';
  }
  
  return translated;
}

function translatePriority(priority) {
  let translated = "alta :warning:";
  if (priority == 'MEDIUM') {
    translated = "média :left_right_arrow: ";
  } else if (priority == 'LOW') {
    translated = "baixa :arrow_down:";
  }
  
  return translated;
}

module.exports = {

  techopsResume: async function(app, token, channelId) {
    let blocks = [
      {
        "type": "section",
        "text": {
          "type": "mrkdwn",
          "text": "*resumo dos techops do dia*"
        }
      },
      {
        "type": "divider"
      },
      {
        "type": "context",
        "elements": [
          {
            "type": "image",
            "image_url": "https://api.slack.com/img/blocks/bkb_template_images/notificationsWarningIcon.png",
            "alt_text": "notifications warning icon"
          },
          {
            "type": "mrkdwn",
            "text": "*prioridade alta: 0*"
          }
        ]
      },
      {
        "type": "context",
        "elements": [
          {
            "type": "image",
            "image_url": "https://pbs.twimg.com/profile_images/625633822235693056/lNGUneLX_400x400.jpg",
            "alt_text": "notifications warning icon"
          },
          {
            "type": "mrkdwn",
            "text": "*prioridade média: 1*"
          }
        ]
      },
      {
        "type": "divider"
      }
    ]

    let messagePayload = {
      token: token,
      channel: channelId,
      blocks: blocks
    }
    
    return await app.client.chat.postMessage(messagePayload);
  },


  techopsCreated: async function(app, token, payload, respond = undefined) {    
    let status = translateStatus(payload['status']); 
    let priority = translatePriority(payload['priority']);
    let description = payload['description'];
    let atribuitionButtonActionId = "techops.message.assign.button";
    
    let atribuitionButtonBlockId = atribuitionButtonActionId + "." + payload['ops_id'];
    let atribuitionSectionText = "@ramonzito novo techops";
    let atribuitionButtonText = ":ballot_box_with_check: atribuir";
    let atribuitionSection = viewBlock.sectionWithButton(atribuitionSectionText, atribuitionButtonText, atribuitionButtonActionId, atribuitionButtonBlockId);  
    if (respond) {
      atribuitionSection = viewBlock.section(atribuitionSectionText);    
    }
    
    let blocks = []
    blocks = blocks.concat(  
      atribuitionSection,
      viewBlock.context("> data: 20/12/2020 10:30:30" + 
        "\n> \n> cliente: <http://sousmile-admin-platform.herokuapp.com/clientes?emailSearch="+payload['customer_info']+"|" + payload['customer_info'] + ">" +
        "\n> solicitante: @" + payload['slack_user_name'] + 
        "\n> prioridade: " + priority + 
        "\n> \n> *Observações:* \n\n " + description)
    );
    
    let messagePayload = {
      token: token,
      // channel: payload['slack_user_id'],
      channel: 'C01AVBDGPPV',
      "blocks": blocks
    }
    
    if (respond) {
      messagePayload['replace_original'] = true;
      return await respond(messagePayload);
    }
    
    return await app.client.chat.postMessage(messagePayload);
  },
  
  techopsStatusChanged: async function(app, token, payload, respond = undefined) {    
    let responsibleText = '';
    if (payload['techops_request_status']) {
      let responsible = payload['techops_request_status'].find(status => status['slack_user_name'] != undefined)
      if (responsible) {
        let statusMessage = "@" + responsible['slack_user_name'] + " está resolvendo esse ops";
        let status = translateStatus(payload['status']);
        responsibleText = "> status: *" +  status.toLowerCase() + "* \n>" + statusMessage
      }
    }
    
    let finishButtonActionId = "techops.message.finish.button";
    let finishButtonBlockId = finishButtonActionId + "." + payload['id'];
    let blocks = []
    
    let section = viewBlock.sectionWithButton(responsibleText, 'finalizar', finishButtonActionId, finishButtonBlockId);
    if (respond) {
      section = viewBlock.section(responsibleText);
    }
    
    let messagePayload = {
      token: token,
      channel: payload['slack_channel'],
      "blocks": section
    }
    
    if (respond) {
      messagePayload['replace_original'] = true;
      return await respond(messagePayload);
    }
    
    messagePayload['thread_ts'] = payload['slack_thread'];
    return await app.client.chat.postMessage(messagePayload);
  },
  
  techopsFinished: async function(app, token, payload) {    
    let statusMessage = "@" + payload['slack_user_name'] + " problema resolvido";
    let status = translateStatus(payload['status']);
    let responsibleText = "> status: *" +  status.toLowerCase() + "* \n>" + statusMessage;
    
    return await app.client.chat.postMessage({
      token: token,
      channel: payload['slack_channel'],
      thread_ts: payload['slack_thread'],
      "blocks": viewBlock.section(responsibleText)
    });
  },
  
  findConversation: async function(app, token) {
    try {
      return app.client.conversations.list({
        token: token
      });

//       for (const channel of result.channels) {
//         if (channel.name === name) {
//            // = channel.id;

//           // Print result
//           // console.log("Found conversation ID: " + conversationId);
//           // Break from for loop
//           return channel.id;
//           break;
//         }
//       }
    }
    catch (error) {
      console.error(error);
    }
  },
  
  newEmployee: async function(app, token, channel, data) {
    return await app.client.chat.postMessage({
      token: token,
      channel: channel,
      "blocks": [
        {
          "type": "section",
          "text": {
            "type": "mrkdwn",
            "text": "*<fakeLink.toEmployeeProfile.com|Ramon Andrade>* cadastrou um no funcionário no admin"
          }
        },
        {
          "type": "divider"
        },
        {
          "type": "section",
          "fields": [
            {
              "type": "mrkdwn",
              "text": "*id:*\n#" + data.id + "\n"
            },
            {
              "type": "mrkdwn",
              "text": "*Nome:*\n" + data.name + "\n"
            }
          ]
        },
        {
          "type": "section",
          "fields": [
            {
              "type": "mrkdwn",
              "text": "*Email:*\n" + data.email
            },
            {
              "type": "mrkdwn",
              "text": "*Categoria:*\n" + data.category
            }
          ]
        },
        {
          "type": "divider"
        }
      ]
    });
  }
}
