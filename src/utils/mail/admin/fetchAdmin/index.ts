import axios from 'axios';

const apiUrl = process.env.ADMIN_URL as string;

const fetchAdmin = async () => {

  try {

    const response = await axios.get(apiUrl);

    const admins = response.data.result;

    console.log(admins[0]);

    return admins;

  } catch (error) {

    console.error("Couldn't fetch admin data:", error);

    throw error; // Throw the error after logging

  }

};

fetchAdmin()

  .then(() => {

    console.log('Working done');

  })

  .catch((err) => {

    console.error('Error in API:', err);
    
  });

export default fetchAdmin;
