const { App, ExpressReceiver, WorkflowStep } = require('@slack/bolt');
const receiver = new ExpressReceiver({ signingSecret: process.env.SLACK_SIGNING_SECRET });

const messages = require('./messages');
const views =  require('./views');
const api = require('./api');

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  receiver
});


app.step(new WorkflowStep('techops.request.workflow.created', {
  edit: async ({ ack, step, configure }) => {
    await ack();
    const blocks = [
      {
        "type": "input",
        "block_id": "slack_user_id",
        "element": {
          "type": "plain_text_input",
          "action_id": "slack_user_id"
        },
        "label": {
          "type": "plain_text",
          "text": "Solicitante",
          "emoji": true
        }
      },
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
        "element": {
          "type": "plain_text_input",
          "action_id": "priority"
        },
        "label": {
          "type": "plain_text",
          "text": "Prioridade",
          "emoji": true
        }
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
    ];

    await configure({ blocks });
  },
  
  save: async ({ ack, step, view, update }) => {
    await ack();
  
    const { values } = view.state;
    const taskName = values.customer_info.customer_info;
    const taskDescription = values.description.description;

    const inputs = {
      slack_user_id: { value: values.slack_user_id.slack_user_id.value },
      customer_info: { value: values.customer_info.customer_info.value },
      description: { value: values.description.description.value },
      priority: { value: values.priority.priority.value }
    };

    const outputs = [
      {
        type: 'text',
        name: 'techops_id',
        label: 'techops id',
      }
    ];

    await update({ inputs, outputs });
  },

  execute: async ({ step, complete, fail, context,body }) => {
    const { inputs } = step;
    
    let priorityNumber = inputs.priority.value.charAt(0);
    let priority = 'LOW';
    if (priorityNumber == '1') {
      priority = 'HIGH';
    } else if (priorityNumber == '2') {
      priority = 'MEDIUM';
    }

    let payload = {
      customer_info: inputs.customer_info.value,
      priority: priority,
      description: inputs.description.value,
      slack_user_id: inputs.slack_user_id.value.replace('<@','').replace('>','')
    }
    let techOpsId;
    try {
      const response = await api.createTechOps(payload)
      techOpsId = response['data']['id'];
    } catch (error) {
      console.error(error);
    } 

    const outputs = {
      techops_id: Math.floor(techOpsId),
      slack_user_id: inputs.slack_user_id.value,
      customer_info: inputs.customer_info.value,
      description: inputs.description.value,
      priority: inputs.priority.value 
    };

    await complete({ outputs });
  },
}));

app.step(new WorkflowStep('techops.request.workflow.assigned', {
  edit: async ({ ack, step, configure }) => {
    
    await ack();
    const blocks = [
      {
        "type": "input",
        "block_id": "slack_user_id",
        "element": {
          "type": "plain_text_input",
          "action_id": "slack_user_id"
        },
        "label": {
          "type": "plain_text",
          "text": "Responsável",
          "emoji": true
        }
      },
      {
        "type": "input",
        "block_id": "techops_id",
        "element": {
          "type": "plain_text_input",
          "action_id": "techops_id"
        },
        "label": {
          "type": "plain_text",
          "text": "Id do techops",
          "emoji": false
        }
      }
    ];
  
    await configure({ blocks });
  },
  
  save: async ({ ack, step, view, update }) => {
    await ack();
  
    const { values } = view.state;

    const inputs = {
      slack_user_id: { value: values.slack_user_id.slack_user_id.value },
      techops_id: { value: values.techops_id.techops_id.value }
    };

    const outputs = [];

    await update({ inputs, outputs });
  },

  execute: async ({ step, complete, fail, context,body }) => {
    const { inputs } = step;

    let techOpsId = Math.floor(inputs.techops_id.value);
    let payload = {
      techops_id: techOpsId,
      slack_user_id: inputs.slack_user_id.value.replace('<@','').replace('>',''),
      techops_request_id: techOpsId
    }
    try {
      const response = await api.moveToNextStatus(techOpsId, payload);
    } catch (error) {
      console.error(error);
    } 

    const outputs = {
      techops_id: techOpsId,
      slack_user_id: inputs.slack_user_id.value
    };

    await complete({ outputs });
  },
}));

app.step(new WorkflowStep('techops.request.workflow.finished', {
  edit: async ({ ack, step, configure }) => {
    
    await ack();
    const blocks = [
      {
        "type": "input",
        "block_id": "slack_user_id",
        "element": {
          "type": "plain_text_input",
          "action_id": "slack_user_id"
        },
        "label": {
          "type": "plain_text",
          "text": "Responsável",
          "emoji": true
        }
      },
      {
        "type": "input",
        "block_id": "techops_id",
        "element": {
          "type": "plain_text_input",
          "action_id": "techops_id"
        },
        "label": {
          "type": "plain_text",
          "text": "Id do techops",
          "emoji": false
        }
      }
    ];
  
    await configure({ blocks });
  },
  
  save: async ({ ack, step, view, update }) => {
    await ack();
  
    const { values } = view.state;

    const inputs = {
      slack_user_id: { value: values.slack_user_id.slack_user_id.value },
      techops_id: { value: values.techops_id.techops_id.value }
    };

    const outputs = [
      {
        type: 'text',
        name: 'requested_at',
        label: 'requested_at',
      },
      {
        type: 'text',
        name: 'assigned_at',
        label: 'assigned_at',
      },
      {
        type: 'text',
        name: 'finished_at',
        label: 'finished_at',
      },
      {
        type: 'text',
        name: 'time',
        label: 'time',
      },
    ];

    await update({ inputs, outputs });
  },

  execute: async ({ step, complete, fail, context,body }) => {
    const { inputs } = step;

    let techOpsId = Math.floor(inputs.techops_id.value);
    let payload = {
      techops_id: techOpsId,
      slack_user_id: inputs.slack_user_id.value.replace('<@','').replace('>',''),
      techops_request_id: techOpsId
    }
    let outputs = {
    }

    try {
      const response = await api.moveToNextStatus(techOpsId, payload);
      let techopsStatuses = response['data']['techops']['techops_request_status']
      
      let requested_at = techopsStatuses.find(status => status['status'] == 'OPEN')['created_at'];
      let assigned_at = techopsStatuses.find(status => status['status'] == 'SOLVING')['created_at'];
      let finished_at = techopsStatuses.find(status => status['status'] == 'FINISHED')['created_at'];
      var diff = Math.abs(new Date(finished_at) - new Date(requested_at));
      let minutes = Math.floor((diff/1000)/60);

      console.log(requested_at);
      console.log(new Date(requested_at).toLocaleString('pt-BR'));
      console.log(event.);
      outputs = {
        techops_id: techOpsId,
        slack_user_id: inputs.slack_user_id.value,
        time: minutes,
        requested_at: new Date(requested_at).toLocaleString('en-GB', { timeZone: 'America/Sao_Paulo' }),
        assigned_at: new Date(assigned_at).toLocaleString('en-GB', { timeZone: 'America/Sao_Paulo' }),
        finished_at: new Date(finished_at).toLocaleString('en-GB', { timeZone: 'America/Sao_Paulo' })
      };  
    } catch (error) {
      console.error(error);
    } 

    await complete({ outputs });
  },
}));


// abrir modal para solicitar um techops
app.shortcut('techops.request.view.open',  async ({ payload, ack, context }) => {
  ack();
  
  try {
    const result = await views.techopsRequest(app, context.botToken, payload)
  } catch (error) {
    console.error(error);
  }
});

// faz o submit do formulário da view para solicitar novo techops
app.view('techops.request.view.submit', async ({ ack, body, view, context }) => {
  ack();
  
  let values = view['state']['values']
  let customer = values['customer_info']['customer_info']['value']
  let priority = values['priority']['priority']['selected_option']['value']
  let description = values['description']['description']['value']
    
  let payload = {
    customer_info: customer,
    priority: priority,
    description: description,
    slack_user_id: body['user']['id'],
    slack_user_name: body['user']['username']
  }
  
  try {
    const response = await api.createTechOps(payload)
    payload['ops_id'] = response['data']['id'];
    
    let result = await messages.techopsCreated(app, context.botToken, payload);
    await api.updateTechOpsMessageId(payload['ops_id'], {
      channel: result['channel'],
      thread_id: result['ts']
    });
    
  } catch (error) {
    console.error(error);
  }
});


// abre modal com lista de techops - status: em aberto
app.shortcut('techops.list.view.open',  async ({ payload, ack, context }) => {
  ack();
  
  let a = await messages.findConversation(app, context.botToken);
  let as = []
  a.channels.forEach(channel => {
    as.push({
      id: channel.id,
      name: channel.name
    })
  })
  console.log(as);
  
  
  try {
    const response = await api.listTechOpsByPriority('HIGH');
    response['data']['priority_to_filter'] = 'HIGH';
    const result = await views.techopsList(app, context.botToken, payload.trigger_id, response['data']);
  } catch(error) {
    console.error(error);
  }
});

// altera o filtro de status da lista de techops
app.action('techops.list.view.piority.filter.change', async ({ ack, body, context, client }) => {
  await ack();
  
  let viewId = body['view']['id'];
  let priorityToFilter = body['actions'][0]['selected_option']['value'];
  
  try {
    const response = await api.listTechOpsByPriority(priorityToFilter);
    response['data']['priority_to_filter'] = priorityToFilter;
    const result = await views.techopsList(app, context.botToken, body['trigger_id'], response['data'], viewId);
  }catch(error) {
    console.error(error);
  }
});


app.action('techops.message.finish.button', async ({ ack, body, say, respond, context, client }) => {
  await ack();
  console.log(body['response_url']);
  
  let techOpsId = body['actions'][0]['block_id'].replace('techops.message.finish.button.', '');
  let payload = {
    "slack_user_id": body['user']['id'],
    "slack_user_name": body['user']['username'],
    "techops_request_id": techOpsId
  }
  
  try {
    const response = await api.moveToNextStatus(techOpsId, payload);
    await messages.techopsStatusChanged(app, context.botToken, response['data']['techops'], respond);
    await messages.techopsFinished(app, context.botToken, response['data']['techops']);
  } catch(error) {
    console.error(error);
  }
});

// botão de atribir techops
app.action('techops.message.assign.button', async ({ ack, body, say, respond, context, client }) => {
  await ack();
  console.log(body['response_url']);
  let techOpsId = body['actions'][0]['block_id'].replace('techops.message.assign.button.', '');
  let payload = {
    "slack_user_id": body['user']['id'],
    "slack_user_name": body['user']['username'],
    "techops_request_id": techOpsId
  }
  
  try {
    const response = await api.moveToNextStatus(techOpsId, payload);
    await messages.techopsCreated(app, context.botToken, response['data']['techops'], respond);
    await messages.techopsStatusChanged(app, context.botToken, response['data']['techops']);
  }catch(error) {
    console.error(error);
  }
});

// clica no botão de atribuir em algum item da lista de techops
app.action('techops.list.view.item.assign', async ({ ack, body, context, client }) => {
  await ack();
  
  let techOpsId = body['actions'][0]['block_id'].replace('techops.list.view.item.assign.', '')
  let payload = {
    "slack_user_id": body['user']['id'],
    "slack_user_name": body['user']['username'],
    "techops_request_id": techOpsId
  }
  
  try {  
    const response = await api.moveToNextStatus(techOpsId, payload);
    await views.techopsList(app, context.botToken, body['trigger_id'], response['data']['all_techops'], body['view']['id']);
    await messages.techopsStatusChanged(app, context.botToken, response['data']['techops']);
  }catch(error) {
    console.error(error);
  }
});


receiver.router.get('/secret-page', (req, res) => {
  res.send('yay!');
});


(async () => {
  // Start your app
  await app.start(process.env.PORT || 3000);
  console.log('⚡️ Bolt app is running!!!!!!');
})();


