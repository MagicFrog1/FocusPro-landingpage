// Servicio de RevenueCat para manejar compras premium
// Basado en la documentación oficial: https://www.revenuecat.com/docs
// Funciona tanto en Expo como en React Native puro

import Purchases, { CustomerInfo, PurchasesOfferings, PurchasesPackage } from 'react-native-purchases';

// Claves de RevenueCat para distintos entornos
// - Desarrollo: proyecto de test (clave empieza por "test_")
// - Producción: proyecto real (clave empieza por "appl_")
const DEV_API_KEY = 'test_wMlpdnDfrJQuhNLOQukyeEkTFxM';
const PROD_API_KEY = 'appl_wUwrABOdUFZyLUKgdWkVNJqFstZ';

// React Native / Expo define __DEV__ en tiempo de ejecución
// true en desarrollo (expo start / debug), false en producción (build release)
const API_KEY = __DEV__ ? DEV_API_KEY : PROD_API_KEY;
const ENTITLEMENT_ID = 'premium';
let isInitialized = false;

/**
 * Initialize RevenueCat SDK
 * Call this once when the app starts
 */
export const initializeRevenueCat = async (userId?: string): Promise<void> => {
  if (isInitialized) {
    return;
  }

  try {
    await Purchases.configure({ apiKey: API_KEY });
    
    if (userId) {
      await Purchases.logIn(userId);
    }
    
    isInitialized = true;
    console.log('RevenueCat SDK initialized successfully');
  } catch (error) {
    // Silent error - SDK might not be available in some environments
    console.log('RevenueCat init error (silent):', error);
  }
};

/**
 * Check if user has premium access
 */
export const checkPremiumStatus = async (): Promise<boolean> => {
  try {
    const customerInfo = await Purchases.getCustomerInfo();
    const hasPremium = typeof customerInfo.entitlements.active[ENTITLEMENT_ID] !== 'undefined';
    return hasPremium;
  } catch (error) {
    console.log('RevenueCat checkPremiumStatus error:', error);
    return false;
  }
};

/**
 * Get available subscription offerings
 * Returns all available offerings or null if error
 */
export const getOfferings = async (): Promise<PurchasesOfferings | null> => {
  try {
    const offerings = await Purchases.getOfferings();
    return offerings;
  } catch (error) {
    console.log('RevenueCat getOfferings error:', error);
    return null;
  }
};

/**
 * Get current offering (most common use case)
 * Returns the current offering or null if not available
 */
export const getCurrentOffering = async () => {
  try {
    const offerings = await Purchases.getOfferings();
    return offerings.current;
  } catch (error) {
    console.log('RevenueCat getCurrentOffering error:', error);
    return null;
  }
};

/**
 * Purchase a subscription package
 * Returns CustomerInfo on success, null on error or cancellation
 */
export const purchasePackage = async (pkg: PurchasesPackage): Promise<CustomerInfo | null> => {
  try {
    const { customerInfo } = await Purchases.purchasePackage(pkg);
    return customerInfo;
  } catch (error: any) {
    if (error.userCancelled) {
      // User cancelled - don't show error
      console.log('Purchase cancelled by user');
    } else {
      // Purchase failed
      console.log('Purchase error:', error);
    }
    return null;
  }
};

/**
 * Restore previous purchases
 * Returns CustomerInfo on success, null on error
 */
export const restorePurchases = async (): Promise<CustomerInfo | null> => {
  try {
    const customerInfo = await Purchases.restorePurchases();
    return customerInfo;
  } catch (error) {
    console.log('RevenueCat restorePurchases error:', error);
    return null;
  }
};

/**
 * Get current customer info
 * Returns CustomerInfo or null if error
 */
export const getCustomerInfo = async (): Promise<CustomerInfo | null> => {
  try {
    const customerInfo = await Purchases.getCustomerInfo();
    return customerInfo;
  } catch (error) {
    console.log('RevenueCat getCustomerInfo error:', error);
    return null;
  }
};

/**
 * Get customer info with premium status check
 * Useful helper that returns both customer info and premium status
 */
export const getCustomerInfoWithPremium = async (): Promise<{
  customerInfo: CustomerInfo | null;
  isPremium: boolean;
}> => {
  try {
    const customerInfo = await Purchases.getCustomerInfo();
    const isPremium = typeof customerInfo.entitlements.active[ENTITLEMENT_ID] !== 'undefined';
    return { customerInfo, isPremium };
  } catch (error) {
    console.log('RevenueCat getCustomerInfoWithPremium error:', error);
    return { customerInfo: null, isPremium: false };
  }
};
