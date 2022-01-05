const Q = require("q");
const { resolve } = require("../utils/resolver");
const { createObject } = require("../utils/helpers");
const { getToken } = require("../utils/authentication");

/**
 * createPerson creates a new person.
 *
/**
 * This method will be called from OIH platform providing following data
 *
 * @param {Object} msg - incoming message object that contains ``body`` with payload
 * @param {Object} cfg - configuration that is account information and configuration field values
 */
async function processAction(msg, cfg) {
  // const token = cfg.API_KEY;
  const token = await getToken(cfg);
  const self = this;
  const oihUid =
    msg.body.meta !== undefined && msg.body.meta.oihUid !== undefined
      ? msg.body.meta.oihUid
      : "oihUid not set yet";
  const recordUid =
    msg.body !== undefined && msg.body.meta.recordUid !== undefined
      ? msg.body.meta.recordUid
      : undefined;
  const applicationUid =
    msg.body.meta !== undefined && msg.body.meta.applicationUid !== undefined
      ? msg.body.meta.applicationUid
      : undefined;

  async function emitData() {
    /** Create an OIH meta object which is required
     * to make the Hub and Spoke architecture work properly
     */
    const newElement = {};
    const oihMeta = {
      applicationUid,
      oihUid,
      recordUid,
    };

    let absenceObject = msg.body.data;

    // if (recordUid && recordUid !== "" && recordUid !== "undefined") {
    //   // Conflict Management implementation
    //   const cfmResponse = await resolve(msg, token, "person");

    //   if (cfmResponse) {
    //     personObject = cfmResponse.resolvedConflict;
    //     objectExists = cfmResponse.exists;
    //   }
    // }

    // Upsert the object depending on 'objectExists' property
    const reply = await createObject(absenceObject, token, "absences", cfg.company_domain);

    oihMeta.recordUid = reply.body.payload.uid;
    delete reply.body.payload.uid;
    newElement.meta = oihMeta;
    newElement.data = reply.body.payload;

    self.emit("data", newElement);
  }

  /**
   * This method will be called from OIH platform if an error occured
   *
   * @param e - object containg the error
   */
  function emitError(e) {
    console.error("ERROR: ", e);
    console.log("Oops! Error occurred");
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
  process: processAction,
};
