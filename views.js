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
  
  techopsRequest: async function(app, token, payload) {    
    await app.client.views.open({
      token: token,
      trigger_id: payload.trigger_id,
      callback_id: 'techops.request.view.submit',
      view: {
        "callback_id": 'techops.request.view.submit',
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
            "block_id": "customer_info",
            "element": {
              "type": "plain_text_input",
              "action_id": "customer_info"
            },
            "label": {
              "type": "plain_text",
              "text": "Informe o nome, email ou case code do usuário",
              "emoji": true
            }
          },
          {
            "type": "input",
            "block_id": "priority",
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
            "block_id": "description",
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
  },
  
  techopsList: async function(app, token, triggerId, payload, viewId = undefined) { 
    let blocks = []
    
    let priorityToFilter = translatePriority(payload['priority_to_filter']);
    let sectionText = " *" + payload.length + "* techops com a prioridade: *" + priorityToFilter + "*";
    blocks = blocks.concat(viewBlock.sectionWithSelect(sectionText, 'techops.list.view.piority.filter.change'));
    
    payload.forEach(item => {
      let status = translateStatus(item['status']); 
      let priority = translatePriority(item['priority']);
      let description = item['description'].replace("\n", "\n> ");
      
      let responsibleText = '';
      if (item['techops_request_status']) {
        let statusWithResponsible = item['techops_request_status'].find(status => status['slack_user_name'] != undefined)
        if (statusWithResponsible) {
          responsibleText = "responsável: *@" + statusWithResponsible['slack_user_name'] + "*";
        }  
      }
      
      let atribuitionButtonActionId = "techops.list.view.item.assign";
      let atribuitionButtonBlockId = atribuitionButtonActionId + "." + item['id'];
      let atribuitionSectionText = "#*"+ item['id'] +"* *"+ status +"* \n" + responsibleText;
      let atribuitionButtonText = ":ballot_box_with_check: Atribuir";
      let atribuitionSection = viewBlock.section(atribuitionSectionText);
      
      if (item['status'] == 'SOLVING') {
        atribuitionButtonText = ":ballot_box_with_check: Resolver";
      }
      
      if (item['status'] != 'FINISHED') {
        atribuitionSection = viewBlock.sectionWithButton(atribuitionSectionText, atribuitionButtonText, atribuitionButtonActionId, atribuitionButtonBlockId);  
      }
      
      blocks = blocks.concat(  
        viewBlock.divider(),
        viewBlock.section("\n\n\t\n"),
        atribuitionSection,
        viewBlock.context("> data: 20/12/2020 10:30:30" + 
          "\n>\n>cliente: <http://sousmile-admin-platform.herokuapp.com/clientes?emailSearch="+item['customer_info']+"|" + item['customer_info'] + ">" +   
          "\n>solicitante: @" + item['slack_user_name'] + 
          "\n> prioridade: " + priority + 
          "\n> status: " + translateStatus(item['status']) + 
          "\n>\n> *Observações:* \n> " + description)
      );
    });
    
    let viewPayload = {
      token: token,
      trigger_id: triggerId,
      callback_id: 'list_techops',
      view: {
        "callback_id": 'list_techops',
        "type": "modal",
        "title": {
          "type": "plain_text",
          "text": "Lista de techops",
          "emoji": true
        },
        "close": {
          "type": "plain_text",
          "text": "Fechar",
          "emoji": true
        },
        "blocks": blocks
      }
    };
    
    if (viewId) {
      viewPayload['view_id'] = viewId;
      await app.client.views.update(viewPayload);
    } else {
      await app.client.views.open(viewPayload);  
    }
  }
  
}

