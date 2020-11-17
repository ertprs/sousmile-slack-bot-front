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
              "text": "Alta"
            },
            "value": "HIGH"
          },
          {
            "text": {
              "type": "plain_text",
              "emoji": true,
              "text": "Média"
            },
            "value": "MEDIUM"
          },
          {
            "text": {
              "type": "plain_text",
              "emoji": true,
              "text": "Baixa"
            },
            "value": "LOW"
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