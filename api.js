const axios = require('axios');

module.exports = {
  
  createTechOps: async function(payload) {
    return axios.post(process.env.API_URL + '/techops', payload, requestHeader())
  },
  
  updateTechOpsMessageId: async function(id, payload) {
    let url = process.env.API_URL + '/techops/' + id + '/channel';
    return axios.put(url , payload, requestHeader())
  },
  
  // listOpenTechOps: async function() {
  //   return axios.get(process.env.API_URL + '/techops/open', requestHeader())
  // },
  
  // listTechOpsByStatus: async function(status) {
  //   return axios.get(process.env.API_URL + '/techops-by-status?status=' + status, requestHeader())
  // },

  listTechopsResume: async function() {
    return axios.get(process.env.API_URL + '/techops-resume', requestHeader())
  },

  listTechOpsByPriority: async function(priority) {
    return axios.get(process.env.API_URL + '/techops-by-priority?priority=' + priority, requestHeader())
  },
  
  moveToNextStatus: async function(id, payload) {
    let url = process.env.API_URL + '/techops/' + id + '/next-status';
    return axios.put(url, payload, requestHeader());
  }
}

function requestHeader() {
  return {
    headers: {'Authorization': 'Bearer ' + process.env.API_TOKEN}
  }
}