import Purchases, { CustomerInfo, PurchasesStoreProduct } from 'react-native-purchases';

const REVENUECAT_API_KEY = 'goog_xPhhFyZWbrmRZoMWRJqXyZHZzqi';

export const PRODUCTS = [
  { id: 'iqquest_score_1000', title: '1000 Coins', price: '$1.49', coins: 1000 },
  { id: 'iqquest_score_5000', title: '5000 Coins', price: '$4.49', coins: 5000 },
  { id: 'iqquest_score_10000', title: '10000 Coins', price: '$8.99', coins: 10000 },
];

export const initializePurchases = async () => {
  try {
    await Purchases.configure({ apiKey: 'goog_xPhhFyZWbrmRZoMWRJqXyZHZzqi' });
    console.log('RevenueCat initialized with API key:', 'goog_xPhhFyZWbrmRZoMWRJqXyZHZzqi');
  } catch (error) {
    console.error('Failed to initialize RevenueCat:', error);
    throw error;
  }
};



















































