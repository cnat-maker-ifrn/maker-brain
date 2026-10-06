import { useState, useEffect, useCallback } from 'react';
import { reportService } from '../services/reportService';
import { extractServerErrors } from '@/frontLib/apiErrors';

export function useReport(initialYear = new Date().getFullYear(), initialMonth = '') {
  const [selectedYear, setSelectedYear] = useState(initialYear);
  const [selectedMonth, setSelectedMonth] = useState(initialMonth); // '' for all year, or 1..12
  const [reportData, setReportData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [error, setError] = useState(null);

  const fetchReport = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await reportService.getReportData({
        year: selectedYear,
        month: selectedMonth,
      });
      setReportData(data);
    } catch (err) {
      setError(extractServerErrors(err));
    } finally {
      setIsLoading(false);
    }
  }, [selectedYear, selectedMonth]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  const downloadPdf = async () => {
    if (!reportData) return;
    setIsDownloadingPdf(true);
    try {
      await reportService.downloadReportPdf({
        year: selectedYear,
        month: selectedMonth,
      });
    } catch (err) {
      console.error('Failed to download PDF:', err);
      // Fallback: client-side generation
      try {
        reportService.generateClientPdf(reportData);
      } catch (clientErr) {
        console.error('Client PDF generation error:', clientErr);
      }
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  return {
    reportData,
    isLoading,
    isDownloadingPdf,
    error,
    selectedYear,
    setSelectedYear,
    selectedMonth,
    setSelectedMonth,
    downloadPdf,
    refetch: fetchReport,
  };
}
