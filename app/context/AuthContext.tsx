import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import {createContext, useContext, useEffect, useState } from 'react';

interface AuthProps {
    authState?: {token: string | null; authenticated: boolean | null};
    onRegister?: (email:string, password:string) => Promise<any>;
    onLogin?: (email: string, password:string) => Promise<any>;
    onLogout?: () => Promise<any>;
}