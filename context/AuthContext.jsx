import { createContext, useContext, useState } from "react";
import { saveUserProfile as updateUserProfileInDB } from "../services/userService"; 

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);

  const setAuth = (authUser) => setUser(authUser);
  const updateUserData = (data) => setUserData(data);

// In AuthContext - update the saveUserProfile function
const saveUserProfile = async (userId, profileData) => {
  const res = await updateUserProfileInDB(userId, profileData); 
  if (res.success) {
    // Update the userData state with the new profile data
    setUserData(prev => ({
      ...prev,
      ...profileData,
      profile_image: profileData.profile_image // Ensure image is updated
    }));
  } else {
    console.error("Profile update failed:", res.error);
  }
  return res;
};

  return (
    <AuthContext.Provider
      value={{
        user,
        userData,
        setAuth,
        setUserData: updateUserData,
        saveUserProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
