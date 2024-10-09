import { google } from "googleapis";
import { SERVICE_KEY } from '$env/static/private';

const credentials = JSON.parse(SERVICE_KEY);

export let authClient
export let sheetsClient

export async function authenticate() {
  
  if (!authClient) {
    // Create a JWT auth client with the service account credentials
    authClient = new google.auth.JWT(
      credentials.client_email,
      null,
      credentials.private_key,
      [ 
        // Google Sheets scopes
        'https://www.googleapis.com/auth/spreadsheets.readonly',
      ]
    )

    // Initialize Google Sheets API with the authenticated client
		sheetsClient = google.sheets({ version: 'v4', auth: authClient });
  }

  return { sheetsClient };
};