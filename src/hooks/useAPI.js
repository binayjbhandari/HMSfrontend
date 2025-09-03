import { useState, useEffect } from 'react';

// Generic hook for API calls with loading, error, and data states
export const useAPI = (apiCall, dependencies = []) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiCall();
      setData(result.data || result);
    } catch (err) {
      setError(err.message || 'An error occurred');
      console.error('API Error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, dependencies);

  const refetch = () => {
    fetchData();
  };

  return { data, loading, error, refetch };
};

// Hook for paginated data
export const usePaginatedAPI = (apiCall, initialParams = {}) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });
  const [params, setParams] = useState(initialParams);

  const fetchData = async (newParams = {}) => {
    try {
      setLoading(true);
      setError(null);
      const mergedParams = { ...params, ...newParams };
      const result = await apiCall(mergedParams);
      
      // Handle different response structures
      if (result.data) {
        // If the response has a data property, extract the main data and pagination
        const responseData = result.data;
        if (responseData.students) {
          setData(responseData.students);
        } else if (responseData.faculty) {
          setData(responseData.faculty);  
        } else if (responseData.courses) {
          setData(responseData.courses);
        } else if (responseData.admissions) {
          setData(responseData.admissions);
        } else if (Array.isArray(responseData)) {
          setData(responseData);
        } else {
          setData(responseData);
        }
        
        if (responseData.pagination) {
          setPagination(responseData.pagination);
        }
      } else {
        // Fallback for direct array responses
        setData(result);
      }
    } catch (err) {
      setError(err.message || 'An error occurred');
      console.error('API Error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const updateParams = (newParams) => {
    setParams(prev => ({ ...prev, ...newParams }));
    fetchData(newParams);
  };

  const changePage = (page) => {
    updateParams({ page });
  };

  const changeLimit = (limit) => {
    updateParams({ page: 1, limit });
  };

  const search = (searchTerm) => {
    updateParams({ page: 1, search: searchTerm });
  };

  const filter = (filterParams) => {
    updateParams({ page: 1, ...filterParams });
  };

  const refetch = () => {
    fetchData();
  };

  return {
    data,
    loading,
    error,
    pagination,
    updateParams,
    changePage,
    changeLimit,
    search,
    filter,
    refetch
  };
};

// Hook for CRUD operations
export const useCRUD = (api) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const performOperation = async (operation, ...args) => {
    try {
      setLoading(true);
      setError(null);
      const result = await operation(...args);
      return result;
    } catch (err) {
      setError(err.message || 'Operation failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const create = async (data) => {
    return performOperation(api.create, data);
  };

  const update = async (id, data) => {
    return performOperation(api.update, id, data);
  };

  const remove = async (id) => {
    return performOperation(api.delete, id);
  };

  const getById = async (id) => {
    return performOperation(api.getById, id);
  };

  return {
    create,
    update,
    remove,
    getById,
    loading,
    error
  };
};

// Hook for form handling with API integration
export const useForm = (initialState, onSubmit) => {
  const [values, setValues] = useState(initialState);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState({});

  const handleChange = (name, value) => {
    setValues(prev => ({ ...prev, [name]: value }));
    if (touched[name] && errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleBlur = (name) => {
    setTouched(prev => ({ ...prev, [name]: true }));
  };

  const validate = (validationRules = {}) => {
    const newErrors = {};
    
    Object.keys(validationRules).forEach(field => {
      const rules = validationRules[field];
      const value = values[field];

      if (rules.required && (!value || value.toString().trim() === '')) {
        newErrors[field] = `${field} is required`;
      } else if (rules.minLength && value && value.length < rules.minLength) {
        newErrors[field] = `${field} must be at least ${rules.minLength} characters`;
      } else if (rules.email && value && !/\S+@\S+\.\S+/.test(value)) {
        newErrors[field] = 'Please enter a valid email';
      } else if (rules.pattern && value && !rules.pattern.test(value)) {
        newErrors[field] = rules.message || `${field} format is invalid`;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (validationRules = {}) => {
    const isValid = validate(validationRules);
    if (!isValid) return;

    try {
      setLoading(true);
      await onSubmit(values);
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setValues(initialState);
    setErrors({});
    setTouched({});
  };

  const setFieldError = (field, error) => {
    setErrors(prev => ({ ...prev, [field]: error }));
  };

  return {
    values,
    errors,
    loading,
    touched,
    handleChange,
    handleBlur,
    handleSubmit,
    validate,
    reset,
    setFieldError,
    setValues
  };
};

// Hook for search functionality
export const useSearch = (items, searchFields) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredItems, setFilteredItems] = useState(items);

  useEffect(() => {
    if (!searchTerm) {
      setFilteredItems(items);
      return;
    }

    const filtered = items.filter(item => {
      return searchFields.some(field => {
        const value = getNestedValue(item, field);
        return value && value.toString().toLowerCase().includes(searchTerm.toLowerCase());
      });
    });

    setFilteredItems(filtered);
  }, [searchTerm, items, searchFields]);

  const getNestedValue = (obj, path) => {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  };

  return {
    searchTerm,
    setSearchTerm,
    filteredItems
  };
};

// Hook for sorting functionality
export const useSort = (items, defaultSortKey = '', defaultDirection = 'asc') => {
  const [sortKey, setSortKey] = useState(defaultSortKey);
  const [sortDirection, setSortDirection] = useState(defaultDirection);
  const [sortedItems, setSortedItems] = useState(items);

  useEffect(() => {
    if (!sortKey) {
      setSortedItems(items);
      return;
    }

    const sorted = [...items].sort((a, b) => {
      const aValue = getNestedValue(a, sortKey);
      const bValue = getNestedValue(b, sortKey);

      if (aValue === bValue) return 0;
      
      let comparison = 0;
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        comparison = aValue.toLowerCase().localeCompare(bValue.toLowerCase());
      } else {
        comparison = aValue < bValue ? -1 : 1;
      }

      return sortDirection === 'asc' ? comparison : -comparison;
    });

    setSortedItems(sorted);
  }, [items, sortKey, sortDirection]);

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDirection('asc');
    }
  };

  const getNestedValue = (obj, path) => {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  };

  return {
    sortedItems,
    sortKey,
    sortDirection,
    handleSort
  };
};

// Hook for local storage
export const useLocalStorage = (key, initialValue) => {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return initialValue;
    }
  });

  const setValue = (value) => {
    try {
      setStoredValue(value);
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Error writing to localStorage:', error);
    }
  };

  return [storedValue, setValue];
};
