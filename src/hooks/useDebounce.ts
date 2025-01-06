import { useState, useEffect } from 'react';

/**
 * Хук для дебаунса значения.
 * @param value Значение, которое нужно дебаунсить.
 * @param delay Задержка в миллисекундах.
 * @returns Дебаунснутое значение.
 */
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export default useDebounce; 