import axios from 'axios';

const apiUrl = 'http://192.168.1.32:8000/internalApi/getuserbyid';

export async function fetchData(id: string): Promise<string | null> {

    try {

        const queryParams = { userId: id };
        
        const response = await axios.get(apiUrl, { params: queryParams });

        return response.data.result.name;
    } 
    catch (error) {

        console.error(error);
        
        return null;
    }
}
