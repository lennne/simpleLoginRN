import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import {createContext, useContext, useEffect, useState } from 'react';

interface AuthProps {
    authState?: {token: string | null; authenticated: boolean | null};
    onRegister?: (email:string, password:string) => Promise<any>;
    onLogin?: (email: string, password:string) => Promise<any>;
    onLogout?: () => Promise<any>;
}

const TOKEN_KEY = "my-jwt"; 
export const API_URL = "https://api.developbetterapps.com";
const AuthContenxt = createContext<AuthProps>({});

export const useAuth = () => {
    return useContext(AuthContenxt);
}

export const AuthProvider = ({children}:any) => {
    const [authState, setAuthState] = useState<{
        token: string | null;
        authenticated: boolean | null;
    }>({
        token:null,
        authenticated: null
    });

    //the interesting part is this, our useEffect, upon launch of the app it loads or logs in 
    useEffect(()=>{
        const loadToken = async () => {
            const token = await SecureStore.getItemAsync(TOKEN_KEY);
            console.log(token);
            if(token){
                axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

                setAuthState({
                    token: token,
                    authenticated: true
                })
            }
        }
        loadToken();
    })

    const register = async (email: string, password: string) => {
        try {
            return await axios.post(`${API_URL}/users`, {email,password});
        } catch (error) {
            return { error: true, msg: (error as any).response.data.msg};
        }
    }

    const login = async (email: string, password: string) => {
        try {
            const results = await axios.post(`${API_URL}/auth`, {email,password});

            //once we get our data we update our 
            setAuthState({
                token: results.data.token,
                authenticated: true
            });
            //after updating our authState we can now attach it to all the headers so that every outgoing request has an authToken /key/whatever
            axios.defaults.headers.common['Authorization'] = `Bearer ${results.data.token}`;
            
            //save the token inside expo's securestore, the first part of the function is the key or reference and the second part is the value
            await SecureStore.setItemAsync(TOKEN_KEY, results.data.token);
            
            return results;
        } catch (error) {
            return { error: true, msg: (error as any).response.data.msg};
        }
    }

    const logout = async () => {
        try {
        
            //now we delete the token from storage
            await SecureStore.deleteItemAsync(TOKEN_KEY);
          
            axios.defaults.headers.common['Authorization'] = '';
          
            //once we get our data we update our 
            setAuthState({
                token: null,
                authenticated: false
            });

            return;
        } catch (error) {
            return { error: true, msg: (error as any).response.data.msg};
        }
    }

    const value = {
        onRegister: register,
        onLogin: login,
        onLogout: logout,
        authState
    }

    return <AuthContenxt.Provider value={value}>
        {children}
    </AuthContenxt.Provider>
}