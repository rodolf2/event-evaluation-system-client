import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../contexts/useAuth";

/**
 * Custom hook for managing dynamic report data
 */
export const useDynamicReportData = (
  reportId,
  isGeneratedReport = false,
  reportSnapshot = null,
) => {
  const { token } = useAuth();
  const [quantitativeData, setQuantitativeData] = useState(null);
  const [qualitativeData, setQualitativeData] = useState(null);
  const [commentsData, setCommentsData] = useState(null);
  const [formData, setFormData] = useState(null);
  const [loading, setLoading] = useState(
    isGeneratedReport && !reportSnapshot ? true : false,
  );
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [isLiveData, setIsLiveData] = useState(!isGeneratedReport);
  const [commentsPagination, setCommentsPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
  });
  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    department: "",
    yearLevel: "",
    ratingFilter: "",
    sentiment: "all",
    keyword: "",
    commentType: "all",
  });

  // Fetch quantitative data
  const fetchQuantitativeData = useCallback(
    async (queryFilters = {}) => {
      if (!reportId) return;

      try {
        setError(null);
        const queryParams = new URLSearchParams({
          ...filters,
          ...queryFilters,
          useSnapshot: isGeneratedReport ? "true" : "false",
        });

        const response = await fetch(
          `/api/analytics/reports/${reportId}/quantitative?${queryParams}`,
          {
            credentials: "include",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        if (!response.ok) {
          throw new Error(
            `Failed to fetch quantitative data: ${response.status}`,
          );
        }

        const result = await response.json();
        if (result.success) {
          setQuantitativeData(result.data);
          setLastUpdated(new Date().toISOString());
        } else {
          throw new Error(
            result.message || "Failed to fetch quantitative data",
          );
        }
      } catch (err) {
        console.error("Error fetching quantitative data:", err);
        setError(err.message);
      }
    },
    [reportId, token, filters, isGeneratedReport],
  );

  // Fetch qualitative data
  const fetchQualitativeData = useCallback(
    async (queryFilters = {}) => {
      if (!reportId) return;

      try {
        setError(null);
        const queryParams = new URLSearchParams({
          sentiment: filters.sentiment,
          keyword: filters.keyword,
          ...queryFilters,
          useSnapshot: isGeneratedReport ? "true" : "false",
        });

        const response = await fetch(
          `/api/analytics/reports/${reportId}/qualitative?${queryParams}`,
          {
            credentials: "include",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        if (!response.ok) {
          throw new Error(
            `Failed to fetch qualitative data: ${response.status}`,
          );
        }

        const result = await response.json();
        if (result.success) {
          setQualitativeData(result.data);
          setLastUpdated(new Date().toISOString());
        } else {
          throw new Error(result.message || "Failed to fetch qualitative data");
        }
      } catch (err) {
        console.error("Error fetching qualitative data:", err);
        setError(err.message);
      }
    },
    [reportId, token, filters.sentiment, filters.keyword, isGeneratedReport],
  );

  // Fetch comments data
  const fetchCommentsData = useCallback(
    async (queryFilters = {}) => {
      if (!reportId) return;

      try {
        setError(null);
        const queryParams = new URLSearchParams({
          type: filters.commentType,
          department: filters.department,
          ratingRange: filters.ratingFilter,
          page: queryFilters.page || commentsPagination.page,
          limit: queryFilters.limit || commentsPagination.limit,
          ...queryFilters,
          useSnapshot: isGeneratedReport ? "true" : "false",
        });

        const response = await fetch(
          `/api/analytics/reports/${reportId}/comments?${queryParams}`,
          {
            credentials: "include",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        if (!response.ok) {
          throw new Error(`Failed to fetch comments data: ${response.status}`);
        }

        const result = await response.json();
        if (result.success) {
          setCommentsData(result.data.comments);
          if (result.data.pagination) {
            setCommentsPagination(result.data.pagination);
          }
          setLastUpdated(new Date().toISOString());
        } else {
          throw new Error(result.message || "Failed to fetch comments data");
        }
      } catch (err) {
        console.error("Error fetching comments data:", err);
        setError(err.message);
      }
    },
    [
      reportId,
      token,
      filters.commentType,
      filters.department,
      filters.ratingFilter,
      commentsPagination.page,
      commentsPagination.limit,
      isGeneratedReport,
    ],
  );

  // Fetch form data
  const fetchFormData = useCallback(async () => {
    if (!reportId) return;

    try {
      setError(null);
      const response = await fetch(`/api/forms/${reportId}`, {
        credentials: "include",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch form data: ${response.status}`);
      }

      const result = await response.json();
      if (result.success) {
        setFormData(result.data);
        setLastUpdated(new Date().toISOString());
      } else {
        throw new Error(result.message || "Failed to fetch form data");
      }
    } catch (err) {
      console.error("Error fetching form data:", err);
      setError(err.message);
    }
  }, [reportId, token]);

  // Update filters
  const updateFilters = useCallback((newFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  }, []);

  // Apply filters and refresh all data
  const applyFilters = useCallback(
    (newFilters = {}) => {
      // Don't apply filters for generated reports
      if (isGeneratedReport && reportSnapshot) {
        return;
      }

      const mergedFilters = { ...filters, ...newFilters };
      setFilters(mergedFilters);
      setLoading(true);

      // Reset pagination state locally
      setCommentsPagination((prev) => ({ ...prev, page: 1 }));

      Promise.all([
        fetchQuantitativeData(mergedFilters),
        fetchQualitativeData(mergedFilters),
        fetchCommentsData({ ...mergedFilters, page: 1 }),
        fetchFormData(),
      ]).finally(() => {
        setLoading(false);
      });
    },
    [
      filters,
      fetchQuantitativeData,
      fetchQualitativeData,
      fetchCommentsData,
      fetchFormData,
      isGeneratedReport,
      reportSnapshot,
    ],
  );

  // Refresh all data
  const refreshData = useCallback(() => {
    // Don't refresh for generated reports - they use embedded snapshots
    if (isGeneratedReport && reportSnapshot) {
      return;
    }

    setLoading(true);
    Promise.all([
      fetchQuantitativeData(),
      fetchQualitativeData(),
      fetchCommentsData({ page: 1 }),
      fetchFormData(),
    ]).finally(() => {
      setLoading(false);
    });
  }, [
    fetchQuantitativeData,
    fetchQualitativeData,
    fetchCommentsData,
    fetchFormData,
    isGeneratedReport,
    reportSnapshot,
  ]);

  // Auto-refresh every 60 seconds (only for live data, not generated reports)
  useEffect(() => {
    if (reportId && !isGeneratedReport) {
      const interval = setInterval(() => {
        if (!loading) {
          refreshData();
        }
      }, 60000);

      return () => clearInterval(interval);
    }
  }, [reportId, refreshData, loading, isGeneratedReport]);

  // Initialize with snapshot data for generated reports
  useEffect(() => {
    if (isGeneratedReport && reportSnapshot?.analytics) {
      // Use embedded snapshot data directly
      setQuantitativeData(reportSnapshot.analytics.quantitativeData);
      setQualitativeData(reportSnapshot.analytics.sentimentBreakdown);
      setFormData(reportSnapshot.metadata);
      setLoading(false);
    } else if (reportId && !isGeneratedReport) {
      // Only fetch for live data
      refreshData();
    }
  }, [reportId, isGeneratedReport, reportSnapshot]);

  return {
    quantitativeData,
    qualitativeData,
    commentsData,
    commentsPagination,
    formData,
    loading,
    error,
    lastUpdated,
    filters,
    updateFilters,
    applyFilters,
    refreshData,
    fetchQuantitativeData,
    fetchQualitativeData,
    fetchCommentsData,
    fetchFormData,
    isLiveData,
  };
};
