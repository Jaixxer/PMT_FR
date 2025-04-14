import { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [role,setRole]=useState(null)
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const refreshUser= async()=>{
        setLoading(true)
        await checkUser();
    }


    // Check the user against our Postgres-backed API using the stored token.
    const checkUser = async () => {
        const token =  localStorage.getItem('Authentication');
       console.log(token)
        if (token) {
            try {
                const response = await axios.get('http://localhost:8383/api/info/getuserdetails', {
                    headers: {
                        'authentication': token
                    }
                });
                if(response.status==200){
                   console.log(response)
                    setUser(response.data.uid)
                   setRole(response.data.role)
                }
            } catch (error) {
                console.error('Error verifying the token:', error);
                setUser(null);
                setRole(null)
            }
        } else {
            setUser(null);
            setRole(null)
            
        }
        setLoading(false);
    };

    useEffect(() => {
        checkUser();
    }, []);

   
    // Logout by calling the sign-out endpoint and clearing the token.
    const logout = async () => {
        try {
            const token = localStorage.getItem('Authentication');
            await axios.post('http://localhost:8383/api/auth/signout', {}, {
                headers: {
                    'Authentication': token
                }
            });
            localStorage.removeItem('Authentication');
            setUser(null);
        } catch (error) {
            console.error('Error signing out the user:', error);
        }
    };

    return(
        <AuthContext.Provider value={{user, role,loading, logout,refreshUser}}>
            {children}
        </AuthContext.Provider>
    );
};

export function useAuth() {
    return useContext(AuthContext);
}
 