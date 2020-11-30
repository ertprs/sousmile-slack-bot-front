const { App, ExpressReceiver, WorkflowStep } = require('@slack/bolt');
const receiver = new ExpressReceiver({ signingSecret: process.env.SLACK_SIGNING_SECRET });

const messages = require('./messages');
const views =  require('./views');
const api = require('./api');

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  receiver
});


const ws = new WorkflowStep('techops_created', {
  edit: async ({ ack, step, configure }) => {
    await ack();
    const blocks = [
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
    console.log(values.customer_info);
    console.log(values['customer_info']);
    const taskName = values['customer_info']['customer_info']['type'];
    const taskDescription = values['customer_info']['description']['type'];
    // const taskDescription = values.task_description_input.description;

    const inputs = {
      taskName: { value: 'TaskName' },
      taskDescription: { value: taskDescription.value }
    };

    const outputs = [
      {
        type: 'text',
        name: 'taskName',
        label: 'Task name',
      },
      {
        type: 'text',
        name: 'taskDescription',
        label: 'Task description',
      }
    ];

    await update({ inputs, outputs });
  },
  execute: async ({ step, complete, fail }) => {},

})

app.step(ws)


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


