const dayjs = require("dayjs");
const axios = require('axios');

function isSecondDateAfter(a, b) {
  return dayjs(a).isAfter(b);
}

async function endpointCall(url,options,cfg) {
  const token = await getToken(cfg);
  options.headers["Authorization"] = `Bearer ${token}`
  return await axios(url,options);
}
async function getToken(config) {
  try {
    const tokenRequest = await axios.post(`https://app.staffomatic.app/v3/${config.company_domain}/auth`,{
      email: config.username,
      password: config.passphrase,
    });
    const { token } = tokenRequest;
    return token;
  } catch (err) {
    return err;
  }
}

function mapFieldNames(obj) {
  if (Array.isArray(obj)) {
    obj.forEach(mapFieldNames);
  } else if (typeof obj === "object" && obj) {
    obj = Object.fromEntries(Object.entries(obj).filter(([_, v]) => v != null));
    return obj;
  }
}
function getMetadata(metadata) {
  const metadataKeys = ["oihUid", "recordUid", "applicationUid"];
  let newMetadata = {};
  for (let i = 0; i < metadataKeys.length; i++) {
    newMetadata[metadataKeys[i]] =
      metadata !== undefined && metadata[metadataKeys[i]] !== undefined
        ? metadata[metadataKeys[i]]
        : `${metadataKeys[i]} not set yet`;
  }
  return newMetadata;
}

async function dataAndSnapshot(
  newElement,
  snapshot,
  snapshotKey,
  standardSnapshot,
  self
) {
  if (Array.isArray(newElement.data)) {
    let lastElement = 0;
    for (let i = 0; i < newElement.data.length; i++) {
      const newObject = { ...newElement, data: newElement.data[i] };
      const currentObjectDate = newObject.data[snapshotKey]
        ? newObject.data[snapshotKey]
        : newObject.data[standardSnapshot];
      if (snapshot.lastUpdated === 0) {
        if (isSecondDateAfter(currentObjectDate, lastElement)) {
          lastElement = currentObjectDate;
        }
        await self.emit("data", newObject);
      } else {
        if (isSecondDateAfter(currentObjectDate, snapshot.lastUpdated)) {
          if (isSecondDateAfter(currentObjectDate, lastElement)) {
            lastElement = currentObjectDate;
          }
          await self.emit("data", newObject);
        }
      }
    }
    snapshot.lastUpdated =
      lastElement !== 0 ? lastElement : snapshot.lastUpdated;
    console.log("returned a new snapshot", snapshot);
    await self.emit("snapshot", snapshot);
  } else {
    await self.emit("data", newElement);
  }
}
function getElementDataFromResponse(splittingKey, res) {
  if (!splittingKey) {
    return res;
  } else {
    return splittingKey.split(".").reduce((p, c) => (p && p[c]) || null, res);
  }
}
module.exports = {
  isSecondDateAfter,
  mapFieldNames,
  getMetadata,
  dataAndSnapshot,
  endpointCall,
  getElementDataFromResponse,
  getToken
};
