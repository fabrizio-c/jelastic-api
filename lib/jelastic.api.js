const request = require('request');
const queryString = require('querystring');

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

  async post(namespace, section, method, parameters, { raw, rewriteHost } = {}) {
    let options = {
      method: 'POST',
      uri: `${rewriteHost ? rewriteHost : this.host}/1.0/${namespace}/${section}/${this.type}/${method}`,
      'content-type': 'application/x-www-form-urlencoded',
      form: parameters
    }
    if (this.verbose == true) {
      console.log(`> calling ${options.method} ${options.uri} - body: `, options.form)
    }
    let result = await requestPromise(options).catch(err => {
      if (this.verbose == true) console.log('> error:', err);
      throw err;
    });
    if (result) {
      if (result.res.statusCode == 200) {
        result.body = JSON.parse(result.body);
        if (result.body.result != 0 && !raw) { throw { code: result.body.result, message: result.body.error } }
      }
      else {
        throw { code: result.res.statusCode, message: result.res.statusMessage }
      }

      return result.body;
    }
  }
  async get(namespace, section, method, parameters, { raw } = {}) {
    let options = {
      method: 'GET',
      uri: `${this.host}JBilling/${namespace}/${section}/${this.type}/${method}?${queryString.stringify(parameters)}`,
      // 'content-type': 'application/x-www-form-urlencoded',
    }

    if (this.verbose == true) {
      console.log(`> calling ${options.method} ${options.uri} - body: `, options.form)
    }
    let result = await requestPromise(options).catch(err => {
      if (this.verbose == true) console.log('> error:', err);
      throw err;
    });

    if (result) {
      if (result.res.statusCode == 200) {
        result.body = JSON.parse(result.body);
        if (result.body.result != 0 && !raw) { throw { code: result.body.result, message: result.body.error } }
      }
      else {
        throw { code: result.res.statusCode, message: result.res.statusMessage }
      }

      return result.body;
    }
  }

  //#region AUTHENTICATION
  async login(username, password, appId = this.system_appid) {
    let result = await this.post('users', 'authentication', 'signin', {
      login: username,
      password: password,
      appid: appId
    }).catch(err => {
      if (this.verbose == true) console.log('> error:', err);
      throw err;
    });

    return result;
  }
  async logout(session, appId = this.system_appid) {
    let result = await this.post('users', 'authentication', 'signout', {
      session: session,
      appid: appId
    }).catch(err => {
      if (this.verbose == true) console.log('> error:', err);
      throw err;
    });

    return result;
  }
  //#endregion

  //#region DEVELPMENT

  async signup(session, appId = this.system_appid, email, password, signupKey) {
    let result = await this.post('development', 'scripting', 'eval', {
      'script': "signup",
      'email': email,
      'password': password,
      'signupKey': signupKey,
    }, { rewriteHost: 'https://reg.cloud.ccws.it' }).catch(err => {
      if (this.verbose == true) console.log('> error:', err);
      throw err;
    });

    return result;

    // let options = {
    //   method: 'POST',
    //   uri: `https://reg.cloud.ccws.it/1.0/development/scripting/rest/eval`,
    //   'content-type': 'application/x-www-form-urlencoded',
    //   form: {
    //     'script': "signup",
    //     'email': email,
    //     'password': password,
    //     'signupKey': signupKey,
    //   }
    // }
    // if (this.verbose == true) {
    //   console.log(`> calling ${options.method} ${options.uri} - body: `, options.body)
    // }
    // let result = await requestPromise(options).catch(err => {
    //   if (this.verbose == true) console.log('> error:', err);
    //   throw err;
    // });
    // if (result) {
    //   if (result.res.statusCode == 200) {
    //     result.body = JSON.parse(result.body);
    //   }
    //   else {
    //     throw { code: result.res.statusCode, message: result.res.statusMessage }
    //   }
    //   console.log(result);
    //   return result.body;
    // }

  }
  //#endregion

  //#region ACCOUNT  

  async getUserInfoInner(session, appId = this.system_appid, login) {
    let result = await this.post('users', 'account', 'getuserinfoinner', {
      session: session,
      appid: appId,
      login: login
    }).catch(err => {
      if (this.verbose == true) console.log('> error:', err);
      throw err;
    });

    return result;
  }
  async getAccounts(session, appId = this.system_appid) {
    let result = await this.post('billing', 'account', 'getaccounts', {
      session: session,
      appid: appId
    }).catch(err => {
      if (this.verbose == true) console.log('> error:', err);
      throw err;
    });

    return result;
  }
  async addAccount(session, appId = this.system_appid, email, password, { name, notify = 1 }) {
    let result = await this.post('users', 'account', 'addaccount', {
      session: session,
      appid: appId,
      email: email,
      password,
      name: name,
      notify: notify
    }).catch(err => {
      if (this.verbose == true) console.log('> error:', err);
      throw err;
    });

    return result;
  }
  async changeGroup(session, appId = this.system_appid, groupName, { uids, sentEmail = false, template }) {
    let result = await this.post('billing', 'account', 'changegroup', {
      session: session,
      appid: appId,
      groupName: groupName,
      uids: uids,
      sentEmail: sentEmail,
      template: template
    }).catch(err => {
      if (this.verbose == true) console.log('> error:', err);
      throw err;
    });

    return result;
  }

  async getUserGroups(session, appId = this.system_appid) {
    let result = await this.post('billing', 'groupquota', 'getgroups', {
      session: session,
      appid: appId
    }).catch(err => {
      if (this.verbose == true) console.log('> error:', err);
      throw err;
    });

    return result;
  }
  async checkUser(session, appId = this.system_appid, login) {
    let result = await this.post('users', 'account', 'checkuser', {
      session: session,
      appid: appId,
      login: login
    }).catch(err => {
      if (this.verbose == true) console.log('> error:', err);
      throw err;
    });

    return result;
  }
  async getLinkedUsers(session, appId = this.system_appid) {
    let result = await this.post('users', 'account', 'getlinkedusers', {
      session: session,
      appid: appId
    }).catch(err => {
      if (this.verbose == true) console.log('> error:', err);
      throw err;
    });

    return result;
  }
  //#endregion

  //#region ENVIROMENT
  async getEnvs(session, appId = this.system_appid, uid) {
    let result = await this.post('administration', 'cluster', 'getenvs', {
      session: session,
      appid: appId,
      uid: uid
    }).catch(err => {
      if (this.verbose == true) console.log('> error:', err);
      throw err;
    });

    return result;
  }
  async getEnvs(session, appId = this.system_appid) {
    let result = await this.post('environment', 'control', 'getenvs', {
      session: session,
      appid: appId
    }).catch(err => {
      if (this.verbose == true) console.log('> error:', err);
      throw err;
    });

    return result;
  }
  async getEnvInfo(session, envName) {
    let result = await this.post('environment', 'control', 'getenvinfo', {
      session: session,
      envName: envName
    }).catch(err => {
      if (this.verbose == true) console.log('> error:', err);
      throw err;
    });

    return result;
  }

  async getNodeGroups(session, envName) {
    let result = await this.post('environment', 'control', 'getNodeGroups', {
      session: session,
      envName: envName
    }).catch(err => {
      if (this.verbose == true) console.log('> error:', err);
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
      if (this.verbose == true) console.log('> error:', err);
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
      if (this.verbose == true) console.log('> error:', err);
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
      if (this.verbose == true) console.log('> error:', err);
      throw err;
    });

    return result;
  }
  async getAllSumStatByUid(session, envName) {
    let result = await this.post('environment', 'control', 'getallsumstatbyuid', {
      session: session,
      envName: envName
    }).catch(err => {
      if (this.verbose == true) console.log('> error:', err);
      throw err;
    });

    return result;
  }
  //#endregion

  //#region BILLING
  async getExtendedAccountBillingHistoryByPeriod(session, appId, startTime, endTime, { targetAppid } = {}) {
    let result = await this.post('billing', 'account', 'getextendedaccountbillinghistorybyperiod', {
      session: session,
      appid: appId,
      starttime: startTime,
      endtime: endTime,
      period: 'DAY',
      timeOffset: 120,
    }).catch(err => {
      if (this.verbose == true) console.log('> error:', err);
      throw err;
    });

    return result;
  }
  async getAggClusterBillingHistory(session, appId, startTime, endTime, interval, isPaid, sumFields, { targetAppid } = {}, options) {
    let result = await this.get('billing', 'account', 'getaggclusterbillinghistory', {
      session: session,
      appid: appId,
      starttime: startTime,
      endtime: endTime,
      interval: interval,
      isPaid: isPaid,
      sumFields: sumFields
    }, options).catch(err => {
      if (this.verbose == true) console.log('> error:', err);
      throw err;
    });

    return result;
  }

  async getAccountBillingHistoryByPeriodInner(session, appId, startTime, endTime, uid, { period = null, targetAppid = null, groupNodes = null } = {}, options) {
    let result = await this.post('billing', 'account', 'getaccountbillinghistorybyperiodinner', {
      appid: appId,
      session: session,
      starttime: startTime,
      endtime: endTime,
      uid: uid,
      period: period,
      targetAppid: targetAppid,
      groupNodes: groupNodes
    }, options).catch(err => {
      if (this.verbose == true) console.log('> error:', err);
      throw err;
    });

    return result;
  }
  async getAccountConsumptionByPeriodInner(session, appId, startTime, endTime, uid, options) {
    let result = await this.post('billing', 'account', 'getaccountconsumptionbyperiodinner', {
      uid: uid,
      session: session,
      appid: appId,
      start: startTime,
      end: endTime,
    }, options).catch(err => {
      if (this.verbose == true) console.log('> error:', err);
      throw err;
    });

    return result;
  }
  async getAccount(session, appId) {
    let result = await this.post('billing', 'account', 'getaccount', {
      session: session,
      appid: appId,
    }).catch(err => {
      if (this.verbose == true) console.log('> error:', err);
      throw err;
    });

    return result;
  }

  async getAccounts(session, appId, { orderField, orderDirection, filterField, filterValue, startRow, resultCount } = {}) {
    let result = await this.post('billing', 'account', 'getaccounts', {
      session: session,
      appid: appId,
      orderField: orderField,
      orderDirection: orderDirection,
      filterField: filterField,
      filterValue: filterValue,
      startRow: startRow,
      resultCount: resultCount
    }).catch(err => {
      if (this.verbose == true) console.log('> error:', err);
      throw err;
    });

    return result;
  }

  //#endregion
}


module.exports = JelasticAPI;