import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/useAuth';

/**
 * Custom hook for managing dynamic report data
 */
export const useDynamicReportData = (reportId) => {
  const { token } = useAuth();
  const [quantitativeData, setQuantitativeData] = useState(null);
  const [qualitativeData, setQualitativeData] = useState(null);
  const [commentsData, setCommentsData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    department: '',
    yearLevel: '',
    ratingFilter: '',
    sentiment: 'all',
    keyword: '',
    commentType: 'all'
  });

  // Fetch quantitative data
  const fetchQuantitativeData = useCallback(async (queryFilters = {}) => {
    if (!reportId) return;
    
    try {
      setError(null);
      const queryParams = new URLSearchParams({
        ...filters,
        ...queryFilters
      });

      const response = await fetch(`/api/analytics/reports/${reportId}/quantitative?${queryParams}`, {
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch quantitative data: ${response.status}`);
      }

      const result = await response.json();
      if (result.success) {
        setQuantitativeData(result.data);
        setLastUpdated(new Date().toISOString());
      } else {
        throw new Error(result.message || 'Failed to fetch quantitative data');
      }
    } catch (err) {
      console.error('Error fetching quantitative data:', err);
      setError(err.message);
    }
  }, [reportId, token, filters]);

  // Fetch qualitative data
  const fetchQualitativeData = useCallback(async (queryFilters = {}) => {
    if (!reportId) return;
    
    try {
      setError(null);
      const queryParams = new URLSearchParams({
        sentiment: filters.sentiment,
        keyword: filters.keyword,
        ...queryFilters
      });

      const response = await fetch(`/api/analytics/reports/${reportId}/qualitative?${queryParams}`, {
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch qualitative data: ${response.status}`);
      }

      const result = await response.json();
      if (result.success) {
        setQualitativeData(result.data);
        setLastUpdated(new Date().toISOString());
      } else {
        throw new Error(result.message || 'Failed to fetch qualitative data');
      }
    } catch (err) {
      console.error('Error fetching qualitative data:', err);
      setError(err.message);
    }
  }, [reportId, token, filters.sentiment, filters.keyword]);

  // Fetch comments data
  const fetchCommentsData = useCallback(async (queryFilters = {}) => {
    if (!reportId) return;
    
    try {
      setError(null);
      const queryParams = new URLSearchParams({
        type: filters.commentType,
        department: filters.department,
        ratingRange: filters.ratingFilter,
        ...queryFilters
      });

      const response = await fetch(`/api/analytics/reports/${reportId}/comments?${queryParams}`, {
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch comments data: ${response.status}`);
      }

      const result = await response.json();
      if (result.success) {
        setCommentsData(result.data);
        setLastUpdated(new Date().toISOString());
      } else {
        throw new Error(result.message || 'Failed to fetch comments data');
      }
    } catch (err) {
      console.error('Error fetching comments data:', err);
      setError(err.message);
    }
  }, [reportId, token, filters.commentType, filters.department, filters.ratingFilter]);

  // Update filters
  const updateFilters = useCallback((newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  // Apply filters and refetch data
  const applyFilters = useCallback(() => {
    setLoading(true);
    Promise.all([
      fetchQuantitativeData(),
      fetchQualitativeData(),
      fetchCommentsData()
    ]).finally(() => {
      setLoading(false);
    });
  }, [fetchQuantitativeData, fetchQualitativeData, fetchCommentsData]);

  // Refresh all data
  const refreshData = useCallback(() => {
    setLoading(true);
    Promise.all([
      fetchQuantitativeData(),
      fetchQualitativeData(),
      fetchCommentsData()
    ]).finally(() => {
      setLoading(false);
    });
  }, [fetchQuantitativeData, fetchQualitativeData, fetchCommentsData]);

  // Auto-refresh every 60 seconds
  useEffect(() => {
    if (reportId) {
      const interval = setInterval(() => {
        if (!loading) {
          refreshData();
        }
      }, 60000);

      return () => clearInterval(interval);
    }
  }, [reportId, refreshData, loading]);

  // Initial data fetch
  useEffect(() => {
    if (reportId) {
      refreshData();
    }
  }, [reportId]);

  return {
    quantitativeData,
    qualitativeData,
    commentsData,
    loading,
    error,
    lastUpdated,
    filters,
    updateFilters,
    applyFilters,
    refreshData,
    fetchQuantitativeData,
    fetchQualitativeData,
    fetchCommentsData
  };
};