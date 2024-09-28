import React, { createContext, useContext, useState } from 'react';

interface FilterPreference {
  key: string;
  value: string | string[];
}

interface SearchFilters {
  genderPreference: FilterPreference;
  ageRange: {
    min: number;
    max: number;
  };
  distance: FilterPreference;
  starSignPreference: FilterPreference;
  bodyTypePreference: FilterPreference;
  exerciseFrequency: FilterPreference;
  smokingFrequency: FilterPreference;
  drinkingFrequency: FilterPreference;
  cannabisFrequency: FilterPreference;
  dietPreference: FilterPreference;
}



interface AppContextType {
  searchFilters: SearchFilters;
  setSearchFilters: React.Dispatch<React.SetStateAction<SearchFilters>>;
  resetFilters: () => void;

  showOnboarding: boolean;
  setShowOnboarding: React.Dispatch<React.SetStateAction<boolean>>;

  isLoading: boolean;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
}

const defaultSearchFilters: SearchFilters = {
  genderPreference: { key: '', value: [] },
  ageRange: { min: 18, max: 35 },
  distance: { key: '', value: '' },
  starSignPreference: { key: '', value: '' },
  bodyTypePreference: { key: '', value: '' },
  exerciseFrequency: { key: '', value: '' },
  smokingFrequency: { key: '', value: '' },
  drinkingFrequency: { key: '', value: '' },
  cannabisFrequency: { key: '', value: '' },
  dietPreference: { key: '', value: '' },
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [searchFilters, setSearchFilters] = useState<SearchFilters>(defaultSearchFilters);
  const [showOnboarding, setShowOnboarding] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const resetFilters = () => {
    console.log('Resetting filters');
    setSearchFilters(defaultSearchFilters);
  };

  return (
    <AppContext.Provider value={{
      searchFilters,
      setSearchFilters,
      resetFilters,
      showOnboarding,
      setShowOnboarding,
      isLoading,
      setIsLoading,
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};