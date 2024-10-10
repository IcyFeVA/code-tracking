import React, { createContext, useContext, useEffect, useState } from "react";
import {
  getData,
  getUserSearchFilters,
  resetUserSearchFilters,
} from "@/utils/storage";

interface SearchFilters {
  looking_for: number | null;
  body_type_filter: number | null;
  zodiac_sign_filter: number | null;
  smoking_status_filter: number | null;
  drinking_status_filter: number | null;
  interest_filter: number[] | null;
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
  looking_for: null,
  body_type_filter: null,
  zodiac_sign_filter: null,
  smoking_status_filter: null,
  drinking_status_filter: null,
  interest_filter: null,
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [searchFilters, setSearchFilters] =
    useState<SearchFilters>(defaultSearchFilters);
  const [showOnboarding, setShowOnboarding] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const resetFilters = () => {
    console.log("Resetting filters");
    setSearchFilters(defaultSearchFilters);
  };

  const fetchFilters = async () => {
    setIsLoading(true);
    try {
      const filters = await getUserSearchFilters();

      const filtersObj = filters.reduce((acc, filter) => {
        // convert numbers as strings to integers
        if (filter[1] !== null) {
          acc[filter[0]] = parseInt(filter[1]);
        } else {
          acc[filter[0]] = filter[1];
        }
        return acc;
      }, {});

      // console.log('AppProvider >>>>>>>>>>>>>>>>>>', filtersObj);

      setSearchFilters(filtersObj);
    } catch (error) {
      console.error("Error fetching filters:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFilters();
  }, []);

  return (
    <AppContext.Provider
      value={{
        searchFilters,
        setSearchFilters,
        resetFilters,
        showOnboarding,
        setShowOnboarding,
        isLoading,
        setIsLoading,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
};
