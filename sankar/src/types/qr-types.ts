export type QRType = 'website' | 'text' | 'wifi' | 'contact';

export type QRSize = 'small' | 'medium' | 'large';

export interface WebsiteData {
  url: string;
}

export interface TextData {
  message: string;
}

export interface WifiData {
  networkName: string;
  password: string;
  securityType: 'WPA' | 'WEP' | 'nopass';
}

export interface ContactData {
  name: string;
  phone: string;
  email: string;
}

export interface QRData {
  website: WebsiteData;
  text: TextData;
  wifi: WifiData;
  contact: ContactData;
}

export const sampleData: QRData = {
  website: {
    url: 'https://www.example.com'
  },
  text: {
    message: 'Hello, this is a sample QR code message!'
  },
  wifi: {
    networkName: 'MyWiFiNetwork',
    password: 'mypassword123',
    securityType: 'WPA'
  },
  contact: {
    name: 'John Doe',
    phone: '+1234567890',
    email: 'john.doe@example.com'
  }
}; 