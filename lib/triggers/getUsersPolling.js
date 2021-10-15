/* eslint no-param-reassign: "off" */

/**
 * Copyright 2020 OIH

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

const Q = require("q");
const { getEntries } = require("../utils/helpers");
const { getToken } = require("../utils/authentication");

/**
 * This method will be called from OIH platform providing following data
 *
 * @param msg - incoming message object that contains ``body`` with payload
 * @param cfg - configuration that is account information and configuration field values
 * @param snapshot - saves the current state of integration step for the future reference
 */
async function processTrigger(msg, cfg, snapshot = {}) {
  // Authenticate and get the token from Snazzy Contacts
  const { applicationUid, domainId, schema } = cfg;
  // const token = cfg.API_KEY;
  const token = await getToken(cfg);
  const self = this;
  console.log(msg.body);

  // Set the snapshot if it is not provided
  snapshot.lastUpdated = snapshot.lastUpdated || new Date(0).getTime();

  async function emitData() {
    /** Create an OIH meta object which is required
     * to make the Hub and Spoke architecture work properly
     */
    const oihMeta = {
      applicationUid:
        applicationUid !== undefined && applicationUid !== null
          ? applicationUid
          : undefined,
      schema: schema !== undefined && schema !== null ? schema : undefined,
      domainId:
        domainId !== undefined && domainId !== null ? domainId : undefined,
    };

    // Get the total amount of fetched objects
    // let count;
    // const getCount = await getEntries(token, snapshot, count, "organization");
    // count = getCount.count; // eslint-disable-line

    const users = await getEntries(token, snapshot, "users", cfg);

    console.log(`Found ${users.length} new records.`);

    const newElement = {};
    newElement.metadata = oihMeta;
    newElement.data = JSON.parse(users);
    for(let i = 0; i < newElement.data.length; i++ ){
           const newObject = newElement;
           newObject.data = newElement.data[i];
           this.emit("data",newObject)
       } 
      // Get the lastUpdate property from the last object and attach it to snapshot
    //   snapshot.lastUpdated = users.result[users.length - 1].lastUpdate;
    //   console.log(`New snapshot: ${snapshot.lastUpdated}`);
    //   self.emit("snapshot", snapshot);
    //  {
    //   self.emit("snapshot", snapshot);
    // }
  }

  /**
   * This method will be called from OIH platform if an error occured
   *
   * @param e - object containg the error
   */
  function emitError(e) {
    console.log(`ERROR: ${e}`);
    self.emit("error", e);
  }

  /**
   * This method will be called from OIH platform
   * when the execution is finished successfully
   *
   */
  function emitEnd() {
    console.log("Finished execution");
    self.emit("end");
  }

  Q().then(emitData).fail(emitError).done(emitEnd);
}

module.exports = {
  process: processTrigger,
  getEntries,
};
