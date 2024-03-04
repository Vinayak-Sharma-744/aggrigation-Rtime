function getTextMessageInput(recipient:string, name:string) {
    console.log(`control in getTextMessage`);
    
    return JSON.stringify({
      "messaging_product": "whatsapp",
      "to": `${recipient}`,
      "type": "template",
      "template": {
        "name": "sample_timesheet_update",
        "language": {
          "code": "en"
        },
        "components": [
          {
              "type": "body",
              "parameters": [{
                  "type": "text",
                  "text":`${name}`
              }]
          }]
      }}); 
  }
  
  export default getTextMessageInput