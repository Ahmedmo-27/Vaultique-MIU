// secrets.js
import dotenv from 'dotenv';
dotenv.config();

export const PORT = process.env.PORT;
export const MONGO_DB_URI = process.env.MONGO_DB_URI;
export const NODE_ENV = process.env.NODE_ENV;
export const AZURE_CLIENT_ID = process.env.AZURE_CLIENT_ID;
export const AZURE_TENANT_ID = process.env.AZURE_TENANT_ID;
export const AZURE_SUBSCRIPTION_ID = process.env.AZURE_SUBSCRIPTION_ID;
export const AZURE_CLIENT_SECRET = process.env.AZURE_CLIENT_SECRET;
export const AZUREAPPSERVICE_PUBLISHPROFILE = process.env.AZUREAPPSERVICE_PUBLISHPROFILE;
