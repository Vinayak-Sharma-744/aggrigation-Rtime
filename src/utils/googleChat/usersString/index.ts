import { getUnfilledTimesheetUsers } from '../../unfilledtimesheetusers/index';

const getChatUserString = async (): Promise<string> => {
  try {
    const { numberOfUnfilledUsers } = await getUnfilledTimesheetUsers();
    let userString: string = '';

    for (let i = 0; i < numberOfUnfilledUsers.length; i++) {
      const user: { email: string; status: boolean; name: string } = numberOfUnfilledUsers[i];

      if (user.status === false) {
        continue;
      } else {
        userString += `${user.name} ( ${user.email})\n`;
      }
    }

    console.log(`User string: ${userString}`);
    return userString;
  } catch (error) {
    console.error('Error in getUserString:', error);
    throw error; // Re-throw the error if needed
  }
};

export default getChatUserString;
