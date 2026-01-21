import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Currency, detectUserCurrency, getCurrencySymbol } from '@/lib/localStorage';

interface CurrencyContextType {
  currency: Currency;
  symbol: string;
  setCurrency: (currency: Currency) => void;
  isLoading: boolean;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export const CurrencyProvider = ({ children }: { children: ReactNode }) => {
  const [currency, setCurrency] = useState<Currency>('SAR');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const detectCurrency = async () => {
      const detected = await detectUserCurrency();
      setCurrency(detected);
      setIsLoading(false);
    };
    detectCurrency();
  }, []);

  const symbol = getCurrencySymbol(currency);

  return (
    <CurrencyContext.Provider value={{ currency, symbol, setCurrency, isLoading }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};
