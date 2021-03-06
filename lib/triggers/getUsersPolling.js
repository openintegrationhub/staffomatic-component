/* eslint no-param-reassign: "off" */

/**
 * Copyright 2019 OIH

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

// const Q = require("q");
const { transform } = require("@openintegrationhub/ferryman");

const { newMessage } = require("../helpers");
const { getEntries } = require("../utils/helpers");
const { getToken } = require("../utils/authentication");
const { userToOih } = require("../transformations/UserToOih");
const moment = require("moment");

/**
 * This method will be called from OIH platform providing following data
 *
 * @param msg - incoming message object that contains ``body`` with payload
 * @param cfg - configuration that is account information and configuration field values
 * @param snapshot - saves the current state of integration step for the future reference
 */
async function processTrigger(msg, cfg, snapshot = {}) {
  // new version of the trigger

  try {
    const { applicationUid, domainId, schema, company_domain } = cfg;
    console.log("this is the cfg:", cfg);
    // const token = cfg.API_KEY;
    const token = await getToken(cfg);
    const self = this;
    console.log(msg.body);

    // Set the snapshot if it is not provided
    snapshot.lastUpdated = snapshot.lastUpdated || moment(new Date(0));

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
    // const getCount = await getEntries(token, snapshot, count, "users");
    // count = getCount.count; // eslint-disable-line

    const users = await getEntries(token, snapshot, "users", company_domain);

    console.error(`Found ${users.result.length} new records.`);
    console.log("this is the snapshot i will pass", snapshot);

    console.log(`Found ${users.result.length} new records.`);
    //console.log("this is the result", users.result);
    console.log("Passed");
    if (users.result.length > 0) {
      users.result.forEach((elem) => {
        const newElement = {};
        // Attach object uid to oihMeta object
        oihMeta.recordUid = elem.uid;
        delete elem.uid;
        newElement.meta = oihMeta;
        newElement.data = elem;
        console.log("this is the new element.data:", newElement.data);
        // Emit the object with meta and data properties

        const transformedElement = transform(newElement, cfg, userToOih);

        self.emit(newMessage("data", transformedElement));
      });

      // Get the lastUpdate property from the last object and attach it to snapshot
      snapshot.lastUpdated = moment(
        users.result[users.result.length - 1].updated_at
      );
      console.error(`New snapshot: ${JSON.stringify(snapshot, undefined, 2)}`);
      self.emit("snapshot", snapshot);
    }
  } catch (e) {
    console.error("ERROR: ", e);
    this.emit("error", e);
  }
}
///end of the new version

// Authenticate and get the token from Snazzy Contacts
//   const { applicationUid, domainId, schema, company_domain } = cfg;
//   console.log("this is the cfg:", cfg);
//   // const token = cfg.API_KEY;
//   const token = await getToken(cfg);
//   const self = this;
//   console.log(msg.body);

//   // Set the snapshot if it is not provided
//   snapshot.lastUpdated = snapshot.lastUpdated || moment(new Date(0));

//   async function emitData() {
//     /** Create an OIH meta object which is required
//      * to make the Hub and Spoke architecture work properly
//      */
//     const oihMeta = {
//       applicationUid:
//         applicationUid !== undefined && applicationUid !== null
//           ? applicationUid
//           : undefined,
//       schema: schema !== undefined && schema !== null ? schema : undefined,
//       domainId:
//         domainId !== undefined && domainId !== null ? domainId : undefined,
//     };

//     // Get the total amount of fetched objects
//     // let count;
//     // const getCount = await getEntries(token, snapshot, count, "users");
//     // count = getCount.count; // eslint-disable-line

//     const users = await getEntries(token, snapshot, "users", company_domain);

//     console.error(`Found ${users.result.length} new records.`);
//     console.log("this is the snapshot i will pass", snapshot);

//     console.log(`Found ${users.result.length} new records.`);
//     console.log("this is the result", result);
//     console.log("Passed");
//     if (users.result.length > 0) {
//       users.result.forEach((elem) => {
//         const newElement = {};
//         // Attach object uid to oihMeta object
//         oihMeta.recordUid = elem.uid;
//         delete elem.uid;
//         newElement.meta = oihMeta;
//         newElement.data = elem;
//         // Emit the object with meta and data properties

//         const transformedElement = transform(newElement, cfg, userToOih);

//         self.emit("data", newMessage(transformedElement));
//       });

//       // Get the lastUpdate property from the last object and attach it to snapshot
//       snapshot.lastUpdated = moment(
//         users.result[users.result.length - 1].updated_at
//       );
//       console.error(`New snapshot: ${JSON.stringify(snapshot, undefined, 2)}`);
//       self.emit("snapshot", snapshot);
//     }
//   }

//   /**
//    * This method will be called from OIH platform if an error occured
//    *
//    * @param e - object containg the error
//    */
//   function emitError(e) {
//     console.log(`ERROR: ${e}`);
//     self.emit("error", e);
//   }

//   /**
//    * This method will be called from OIH platform
//    * when the execution is finished successfully
//    *
//    */
//   function emitEnd() {
//     console.log("Finished execution");
//     self.emit("end");
//   }

//   Q().then(emitData).fail(emitError).done(emitEnd);
// }

module.exports = {
  process: processTrigger,
  getEntries,
};
