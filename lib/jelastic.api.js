const request = require('request');

async function requestPromise(options) {
  return new Promise((resolve, reject) => {
    request(options, (err, resp, body) => {
      if (err) {
        return reject(err);
      }
      return resolve({ res: resp, body: body });
    });
  })
}
class JelasticAPI {

  /**
   * initialize parameters
   * @param {string} host 
   * @param {string} system_appid 
   * @param {object} options 
   */
  constructor(host, system_appid, options = { type: 'rest', verbose: false }) {
    this.host = host;
    this.system_appid = system_appid;
    this.type = 'rest';
    this.verbose = false;

    if (options) {
      this.type = options.type || 'rest';
      this.verbose = options.verbose || false;
    }
  }
  async post(namespace, section, method, parameters) {
    let result = await requestPromise({
      method: 'POST',
      uri: `${this.host}/1.0/${namespace}/${section}/${this.type}/${method}`,
      'content-type': 'application/x-www-form-urlencoded',
      form: parameters
    }).catch(err => {
      if (this.verbose == true) console.log('error:', err);
      throw err;
    });

    if (result) {
      if(result.res.statusCode==200){
        result.body = JSON.parse(result.body);
        if (result.body.result != 0) { throw { code: result.body.result, message: result.body.error } }
      }
      else{
        throw { code: result.res.statusCode, message: result.res.statusMessage }
      }

      return result.body;
    }
  }
  
  //#region USERS
  async login(username, password, appId = this.system_appid) {
    let result = await this.post('users', 'authentication', 'signin', {
      login: username,
      password: password,
      appid: appId
    }).catch(err => {
      if (this.verbose == true) console.log('error:', err);
      throw err;
    });

    return result;
  }
  async logout(session, appId = this.system_appid) {
    let result = await this.post('users', 'authentication', 'signout', {
      session: session,
      appid: appId
    }).catch(err => {
      if (this.verbose == true) console.log('error:', err);
      throw err;
    });

    return result;
  }
  //#endregion

  //#region ENVIROMENT
  async getEnvs(session, appId = this.system_appid) {
    let result = await this.post('environment', 'control', 'getenvs', {
      session: session,
      appid: appId
    }).catch(err => {
      if (this.verbose == true) console.log('error:', err);
      throw err;
    });

    return result;
  }
  async getEnvInfo(session, envName) {
    let result = await this.post('environment', 'control', 'getenvinfo', {
      session: session,
      envName: envName
    }).catch(err => {
      if (this.verbose == true) console.log('error:', err);
      throw err;
    });

    return result;
  }

  async getNodeGroups(session, envName) {
    let result = await this.post('environment', 'control', 'getNodeGroups', {
      session: session,
      envName: envName
    }).catch(err => {
      if (this.verbose == true) console.log('error:', err);
      throw err;
    });

    return result;
  }
  async getLogs(session, envName, nodeId, { path } = {}) {
    let result = await this.post('environment', 'control', 'getlogs', {
      session: session,
      envName: envName,
      nodeId: nodeId,
      path: path
    }).catch(err => {
      if (this.verbose == true) console.log('error:', err);
      throw err;
    });

    return result;
  }

  async getStats(session, envName, duration, interval, { nodeId, nodeGroup } = {}) {
    let result = await this.post('environment', 'control', 'getstats', {
      session: session,
      envName: envName,
      duration: duration,
      interval: interval,
      nodeGroup: nodeGroup,
      nodeId: nodeId
    }).catch(err => {
      if (this.verbose == true) console.log('error:', err);
      throw err;
    });

    return result;
  }
  async getSumStat(session, envName, duration, { endtime } = {}) {
    let result = await this.post('environment', 'control', 'getsumstat', {
      session: session,
      envName: envName,
      duration: duration,
      endtime: endtime
    }).catch(err => {
      if (this.verbose == true) console.log('error:', err);
      throw err;
    });

    return result;
  }
  async getAllSumStatByUid(session, envName) {
    let result = await this.post('environment', 'control', 'getallsumstatbyuid', {
      session: session,
      envName: envName
    }).catch(err => {
      if (this.verbose == true) console.log('error:', err);
      throw err;
    });

    return result;
  }
  //#endregion
}


module.exports = JelasticAPI;