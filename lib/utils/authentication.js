/**
 * Copyright 2019 Wice GmbH

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

const request = require("request-promise");

// let uri = "";

/**
 * This method will authenticate the user in Snazzy Contacts
 * and return a Bearer token if it is successful
 *
 * @param {Object} config - incoming message object that contains username and password
 * @return {String} - Bearer token
 */
async function getToken(config) {
  let uri = `https://app.staffomatic.app/v3/${config.company_domain}/auth`;
  const options = {
    uri,
    json: true,
    body: {
      email: config.username,
      password: config.passphrase,
    },
  };
  console.log("these are the options!!::", options);
  try {
    const tokenRequest = await request.post(options);
    const { token } = tokenRequest;
    return token;
  } catch (err) {
    return err;
  }
}

module.exports = {
  getToken,
};
