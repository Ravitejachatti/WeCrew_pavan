
const {API} = require("../../constants/constants")
import { useAuth } from '../contexts/AuthContext';
import { getFCMToken } from '../firebaseSetup';

export async function CreateFcm() {
  const { user } = useAuth()
  const token = await getFCMToken();
  console.log("fetching fcmtoken", token);
  
  if (token) {
    await axios.post(`${API}/notification/save-fcm-token`, {
      userId: user._id,  
      fcmToken: token,
    });
  }

  return true;
}
