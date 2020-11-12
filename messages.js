const axios = require('axios');


module.exports = {
  findCustomer: async function(id) {
    return axios.get(process.env.ADMIN_API_URL + 'customers/' + id, adminHeader())
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



function adminHeader() {
  return {
    headers: {'Authorization': 'Bearer ' + process.env.ADMIN_API_TOKEN}
  }
}