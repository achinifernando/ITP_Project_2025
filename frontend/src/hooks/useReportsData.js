import { useEffect, useMemo, useState } from "react";
import { api } from "../utils/apiPaths";

export function useReportsData() {
  const [summaryData, setSummaryData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.get('/api/reports/stock-summary');
      setSummaryData(data);
    } catch (err) {
      setError(err.message || "Failed to load reports data");
      setSummaryData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const totalsArray = useMemo(
    () =>
      Object.entries(summaryData?.totalsByUnit ?? {}).sort(([a], [b]) =>
        a.localeCompare(b)
      ),
    [summaryData]
  );

  return {
    summaryData,
    totalsArray,
    loading,
    error,
    refetch: fetchData,
  };
}
