import axios, { AxiosResponse } from "axios"

function sendMessage(data:any): Promise<AxiosResponse<any, any>> {

  console.log(`control in send messaage`);
  
  var config = {

    method: 'post',

    url: `https://graph.facebook.com/v18.0/239579209230999/messages`,

    headers: {
      
      'Authorization': `Bearer 
      EAAtO8Ap5ib0BOZBeuO2tuWebdQasDsRi48UZCpnU60weGLfv7yQlBxqLMYdnhAcegXYtyrUuCVz7D1Qwn6wZAD290NjXnDaTBVnyJZBWyS8FKZBCxAJ8bqZBoQVBGGgMscq1fXhDuDtEYhoZAHEQpuJUaptqHncS7ZBbvlY8OPp7QPjlnF9oUiU8ZAOCnKIMJi3DxB9thSnXYp6gG47t5LdIZD`,
      'Content-Type': 'application/json'

    },

    data: data

  };
  
  console.log(`goin to return sendmessage`);
  
  return axios(config)
}

export default sendMessage;
