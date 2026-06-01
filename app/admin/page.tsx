"use client";

import React, { useEffect, useState } from "react";
import adminService, { NotificationLog } from "@/services/adminService";
import { useToast } from "@/hooks/use-toast";

export default function AdminPage() {
  const [logs, setLogs] = useState<NotificationLog[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<any[]>([]);
  const [history, setHistory] = useState<NotificationLog[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [viewMode, setViewMode] = useState<"logs" | "history" | "reports">("logs");
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [channelFilter, setChannelFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [sortBy, setSortBy] = useState("startTime");
  const [sortDir, setSortDir] = useState("DESC");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalServerItems, setTotalServerItems] = useState(0);
  const ITEMS_PER_PAGE = 20;
  const { toast } = useToast();

  const fetchData = async () => {
    try {
      if (viewMode === "logs") {
        const response: any = await adminService.getLogs();
        const dataArray = Array.isArray(response) ? response : [];
        const sortedLogs = dataArray.sort((a: any, b: any) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime());
        setLogs(sortedLogs);
        setFilteredLogs(sortedLogs);
      } else if (viewMode === "history") {
        const response: any = await adminService.getHistory();
        const dataArray = Array.isArray(response) ? response : [];
        const sortedHistory = dataArray.sort((a: any, b: any) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime());
        setHistory(sortedHistory);
        setFilteredLogs(sortedHistory);
      } else if (viewMode === "reports") {
        const response: any = await adminService.getReports(
          currentPage - 1,
          ITEMS_PER_PAGE,
          searchTerm || undefined,
          statusFilter === "ALL" ? undefined : statusFilter,
          sortBy,
          sortDir
        );
        const dataArray = Array.isArray(response.content) ? response.content : [];
        setReports(dataArray);
        setTotalServerItems(response.totalElements || 0);
        // We don't setFilteredLogs here because for reports we use reports directly
      }
    } catch (err: any) {
      toast({ title: "Erreur", description: "Erreur lors de la récupération des données", variant: "destructive" });
      console.error(err);
    }
  };

  useEffect(() => {
    setCurrentPage(1);
    fetchData();
  }, [viewMode, statusFilter, sortBy, sortDir]);

  useEffect(() => {
    if (viewMode === "reports") {
      fetchData();
    }
  }, [currentPage]);

  useEffect(() => {
    if (viewMode === "reports") return; // For reports, filtering is server-side

    let result = viewMode === "logs" ? logs : history;
    if (channelFilter !== "ALL") {
      result = result.filter(l => l.channel && l.channel.toLowerCase() === channelFilter.toLowerCase());
    }
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(l => 
        (l.title && l.title.toLowerCase().includes(term)) || 
        (l.message && l.message.toLowerCase().includes(term)) ||
        (l.userId && l.userId.toLowerCase().includes(term)) ||
        (l.type && l.type.toLowerCase().includes(term)) ||
        (l.targetId && l.targetId.toLowerCase().includes(term))
      );
    }
    setFilteredLogs(result);
    setCurrentPage(1);
  }, [logs, history, searchTerm, channelFilter, viewMode]);

  const totalPages = viewMode === "reports" 
    ? Math.ceil(totalServerItems / ITEMS_PER_PAGE) 
    : Math.ceil(filteredLogs.length / ITEMS_PER_PAGE);

  const paginatedLogs = viewMode === "reports" 
    ? reports 
    : filteredLogs.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const totalItemsCount = viewMode === "reports" ? totalServerItems : filteredLogs.length;

  const handleTrigger = async (triggerFn: () => Promise<any>, name: string) => {
    setLoading(true);
    try {
      await triggerFn();
      toast({ title: "Succès", description: `${name} exécuté avec succès` });
      await fetchData();
    } catch (err: any) {
      toast({ title: "Erreur", description: `Erreur lors de l'exécution de ${name}`, variant: "destructive" });
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-8 text-white min-h-screen">
      <h1 className="text-3xl font-bold mb-8 text-primary-500">Administration Système</h1>

      <div className="bg-gray-800 rounded-lg p-6 mb-8 shadow-lg">
        <h2 className="text-xl font-semibold mb-4 border-b border-gray-700 pb-2">Déclencheurs Manuels (Batchs)</h2>
        <div className="flex flex-wrap gap-4">
          <button
            disabled={loading}
            onClick={() => handleTrigger(adminService.triggerPeriodicDaily, "Batch Daily (Top/Flop)")}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded transition disabled:opacity-50"
          >
            Lancer Daily
          </button>
          <button
            disabled={loading}
            onClick={() => handleTrigger(adminService.triggerPeriodicWeekly, "Batch Weekly (Top/Flop)")}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded transition disabled:opacity-50"
          >
            Lancer Weekly
          </button>
          <button
            disabled={loading}
            onClick={() => handleTrigger(adminService.triggerPeriodicMonthly, "Batch Monthly (Top/Flop)")}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded transition disabled:opacity-50"
          >
            Lancer Monthly
          </button>
          <button
            disabled={loading}
            onClick={() => handleTrigger(adminService.triggerMonthlyPerformance, "Batch Monthly (Portfolio Perf)")}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded transition disabled:opacity-50"
          >
            Lancer Perf Mensuelle Portefeuille
          </button>
          <button
            disabled={loading}
            onClick={() => handleTrigger(adminService.triggerStockVariation, "Batch Stock Variations (5%)")}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded transition disabled:opacity-50"
          >
            Lancer Stock Variations ({'>'}5%)
          </button>
        </div>
      </div>

      <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 border-b border-gray-700 pb-4 gap-4">
          <div className="flex flex-col gap-2">
            <h2 className="text-xl font-semibold">Historique & Logs des Notifications</h2>
            <div className="flex gap-2">
              <button 
                onClick={() => setViewMode("logs")} 
                className={`px-3 py-1 rounded text-sm font-medium ${viewMode === "logs" ? "bg-blue-600 text-white" : "bg-gray-700 text-gray-300 hover:bg-gray-600"}`}
              >
                Derniers Messages
              </button>
              <button 
                onClick={() => setViewMode("history")} 
                className={`px-3 py-1 rounded text-sm font-medium ${viewMode === "history" ? "bg-blue-600 text-white" : "bg-gray-700 text-gray-300 hover:bg-gray-600"}`}
              >
                Traces (Raw)
              </button>
              <button 
                onClick={() => setViewMode("reports")} 
                className={`px-3 py-1 rounded text-sm font-medium ${viewMode === "reports" ? "bg-green-600 text-white" : "bg-gray-700 text-gray-300 hover:bg-gray-600"}`}
              >
                Rapports de Batch
              </button>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <input 
              type="text" 
              placeholder="Rechercher..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-gray-700 border border-gray-600 rounded px-3 py-1.5 text-sm w-full md:w-64 focus:outline-none focus:border-blue-500"
            />
            {viewMode !== "reports" ? (
              <select 
                value={channelFilter}
                onChange={(e) => setChannelFilter(e.target.value)}
                className="bg-gray-700 border border-gray-600 rounded px-3 py-1.5 text-sm focus:outline-none focus:border-blue-500"
              >
                <option value="ALL">Tous les canaux</option>
                <option value="ntfy">Ntfy</option>
                <option value="telegram">Telegram</option>
                <option value="email">Email</option>
              </select>
            ) : (
              <>
                <select 
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-gray-700 border border-gray-600 rounded px-3 py-1.5 text-sm focus:outline-none focus:border-blue-500"
                >
                  <option value="ALL">Tous les statuts</option>
                  <option value="SUCCESS">Success</option>
                  <option value="FAILED">Failed</option>
                </select>
                <select 
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-gray-700 border border-gray-600 rounded px-3 py-1.5 text-sm focus:outline-none focus:border-blue-500"
                >
                  <option value="startTime">Date (Départ)</option>
                  <option value="durationMs">Durée d'exécution</option>
                </select>
                <button 
                  onClick={() => setSortDir(d => d === "ASC" ? "DESC" : "ASC")} 
                  className="bg-gray-700 border border-gray-600 rounded px-3 py-1.5 text-sm focus:outline-none focus:border-blue-500"
                >
                  {sortDir === "ASC" ? "⬆️" : "⬇️"}
                </button>
              </>
            )}
            <button onClick={fetchData} className="text-sm px-3 py-1.5 bg-gray-700 hover:bg-gray-600 border border-gray-600 rounded transition whitespace-nowrap">
              🔄 Rafraîchir
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-300">
            <thead className="text-xs text-gray-400 uppercase bg-gray-700/50">
              {viewMode === "logs" ? (
                <tr>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Canal</th>
                  <th className="px-4 py-3">Titre</th>
                  <th className="px-4 py-3 min-w-[300px]">Message</th>
                </tr>
              ) : viewMode === "history" ? (
                <tr>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Cible (ID)</th>
                  <th className="px-4 py-3">Période</th>
                  <th className="px-4 py-3">Utilisateur</th>
                </tr>
              ) : (
                <tr>
                  <th className="px-4 py-3">Date d'Exécution</th>
                  <th className="px-4 py-3">Nom du Job</th>
                  <th className="px-4 py-3">Statut</th>
                  <th className="px-4 py-3">Durée</th>
                  <th className="px-4 py-3 min-w-[200px]">Erreur</th>
                  <th className="px-4 py-3">Métadonnées</th>
                </tr>
              )}
            </thead>
            <tbody>
              {paginatedLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-gray-500">
                    {(viewMode === "logs" ? logs.length : viewMode === "history" ? history.length : reports.length) === 0 ? "Aucun historique trouvé" : "Aucun résultat pour cette recherche"}
                  </td>
                </tr>
              ) : (
                paginatedLogs.map((log, idx) => (
                  <tr key={idx} className="border-b border-gray-700 hover:bg-gray-700/30">
                    {viewMode === "reports" ? (
                      <>
                        <td className="px-4 py-3 font-mono text-xs whitespace-nowrap">
                          {new Date(log.startTime).toLocaleString()}
                        </td>
                        <td className="px-4 py-3 font-medium text-purple-400">{log.jobName}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded text-xs ${log.status === 'SUCCESS' ? 'bg-green-800 text-green-100' : 'bg-red-800 text-red-100'}`}>
                            {log.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-mono text-xs">{(log.durationMs / 1000).toFixed(2)} s</td>
                        <td className="px-4 py-3 text-xs text-red-400 truncate max-w-[200px]" title={log.errorMessage}>
                          {log.errorMessage || '-'}
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-400">
                          {Object.keys(log.metadata || {}).length > 0 ? (
                            <pre className="bg-gray-800 p-2 rounded overflow-x-auto text-[10px]">
                              {JSON.stringify(log.metadata, null, 2)}
                            </pre>
                          ) : '-'}
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="px-4 py-3 font-mono text-xs whitespace-nowrap">
                          {new Date(log.sentAt).toLocaleString()}
                        </td>
                        {viewMode === "logs" ? (
                      <>
                        <td className="px-4 py-3">
                          <span className="px-2 py-1 bg-gray-700 rounded text-xs">{log.channel}</span>
                        </td>
                        <td className="px-4 py-3 font-medium">{log.title}</td>
                        <td className="px-4 py-3 whitespace-pre-wrap font-mono text-xs text-gray-400">{log.message}</td>
                      </>
                    ) : (
                      <>
                        <td className="px-4 py-3 font-medium text-blue-400">{log.type}</td>
                        <td className="px-4 py-3 font-mono text-xs text-gray-400">{log.targetId || '-'}</td>
                        <td className="px-4 py-3">
                          {log.period && <span className="px-2 py-1 bg-gray-700 rounded text-xs">{log.period}</span>}
                        </td>
                        <td className="px-4 py-3 font-mono text-xs">{log.userId || '-'}</td>
                      </>
                    )}
                      </>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex justify-between items-center mt-6 border-t border-gray-700 pt-4">
            <span className="text-sm text-gray-400">
              Affichage {((currentPage - 1) * ITEMS_PER_PAGE) + 1} à {Math.min(currentPage * ITEMS_PER_PAGE, totalItemsCount)} sur {totalItemsCount} éléments
            </span>
            <div className="flex gap-2">
              <button 
                disabled={currentPage === 1} 
                onClick={() => setCurrentPage(p => p - 1)}
                className="px-3 py-1 bg-gray-700 text-gray-300 rounded hover:bg-gray-600 disabled:opacity-50 transition"
              >
                Précédent
              </button>
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 2)
                  .map((p, i, arr) => (
                    <React.Fragment key={p}>
                      {i > 0 && arr[i - 1] !== p - 1 && <span className="text-gray-500 px-1">...</span>}
                      <button 
                        onClick={() => setCurrentPage(p)}
                        className={`px-3 py-1 rounded text-sm ${currentPage === p ? "bg-blue-600 text-white" : "bg-gray-700 text-gray-300 hover:bg-gray-600"}`}
                      >
                        {p}
                      </button>
                    </React.Fragment>
                  ))}
              </div>
              <button 
                disabled={currentPage === totalPages} 
                onClick={() => setCurrentPage(p => p + 1)}
                className="px-3 py-1 bg-gray-700 text-gray-300 rounded hover:bg-gray-600 disabled:opacity-50 transition"
              >
                Suivant
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
