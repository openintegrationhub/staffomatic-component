const request = require("request-promise").defaults({
    simple: false,
    resolveWithFullResponse: true,
  });
async function createObject() {
let msg = {data: { first_name: "newName", last_name: "newlastName" }}
    // if (!type) {
    //   return false;
    // }
  const token = "eyJhbGciOiJIUzI1NiJ9.eyJ1c2VyX2lkIjo2MTc0NzcsImFjY291bnRfaWQiOjU1NDE5LCJleHAiOjE2NDE0NzA0MDZ9.dk5N6soHm6e9hOY8OIm0rXHYKyl4eMrPuQypxemLqQU"
    let newObject;
    let uri;
    let method;
  
    // Create the object if it does not exist
    method = "POST";
    uri = `https://app.staffomatic.app/v3/cloudecosystem/users`;
    newObject = msg;
    // console.log(msg)
    // delete newObject.uid;
    // delete newObject.categories;
    // delete newObject.relations;
  
    try {
      const options = {
        method,
        uri,
        json: true,
        headers: {
          Authorization: `Bearer ${token}`,
        },      
        body: msg.data,
      };
      console.log("obj options",options)
      const person = await request(options);
      console.log("person",person.body)
      return person;
    } catch (e) {
      return e;
    }
  }

createObject()