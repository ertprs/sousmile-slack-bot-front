module.exports = {

  divider: function() {
    return [{
      "type": "divider"
    }]; 
  },

  section: function(text) {
    return [{
      "type": "section",
      "text": {
        "type": "mrkdwn",
        "text": text
      }
    }]
  },

  sectionWithButton: function(text, buttonText, actionId, blockId) {
    return [{
      "type": "section",
      "text": {
        "type": "mrkdwn",
        "text": text
      },
      "block_id": blockId,
      "accessory": {
        "type": "button",
        "text": {
          "type": "plain_text",
          "text": buttonText,  
          "emoji": true
        },
        "action_id": actionId
      }
    }];
  },

  sectionWithSelect: function(text, actionId) {
    return [{
      "type": "section",
      "text": {
        "type": "mrkdwn",
        "text": text
      },
      // "block_id": blockId,
      "accessory": {
        "type": "overflow",
        "action_id": actionId,
        "options": [
          {
            "text": {
              "type": "plain_text",
              "emoji": true,
              "text": "Aberto"
            },
            "value": "OPEN"
          },
          {
            "text": {
              "type": "plain_text",
              "emoji": true,
              "text": "Em andamento"
            },
            "value": "SOLVING"
          },
          {
            "text": {
              "type": "plain_text",
              "emoji": true,
              "text": "Finalizados"
            },
            "value": "FINISHED"
          }
        ]
      }
    }];
  },
    
  context: function(text) {
    return {
      "type": "context",
      "elements": [{
        "text": text,
        "type": "mrkdwn"
      }]
    }
  }
}