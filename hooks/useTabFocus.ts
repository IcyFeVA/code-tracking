// hooks/useTabFocus.ts
import { useCallback, useEffect, useState } from 'react';
import { useIsFocused } from '@react-navigation/native';

export const useTabFocus = () => {
  const isFocused = useIsFocused();
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (isFocused) {
      setRefreshKey(prevKey => prevKey + 1);
    }
  }, [isFocused]);

  const refresh = useCallback(() => {
    setRefreshKey(prevKey => prevKey + 1);
  }, []);

  return { refreshKey, refresh };
};