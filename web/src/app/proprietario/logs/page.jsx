'use client';

// -----------------------------------------------------------------------------
// IMPORTAÇÕES
// -----------------------------------------------------------------------------
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import api from '../../../lib/api';
import toast from 'react-hot-toast';
import { Building, Loader2, Calendar, Download, ListChecks, History } from 'lucide-react';
import Papa from 'papaparse';
import { saveAs } from 'file-saver';

// -----------------------------------------------------------------------------
// COMPONENTES DE UI
// -----------------------------------------------------------------------------
const LogTableRow = ({ log }) => {
    const dataFormatada = new Date(log.data_log).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'medium' });
    
    const detalhesFormatados = log.detalhes && Object.keys(log.detalhes).length > 0 ? 
        Object.entries(log.detalhes)
              .map(([key, value]) => `${key}: ${value}`)
              .join('; ')
        : 'N/A';
        
    return (
        <tr className="hover:bg-gray-50 dark:hover:bg-slate-800/50">
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{dataFormatada}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{log.acao}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">{log.usuario?.nome || 'Sistema'}</td>
            <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 max-w-sm truncate" title={detalhesFormatados}>
                {detalhesFormatados}
            </td>
        </tr>
    );
};
// -----------------------------------------------------------------------------
// COMPONENTE PRINCIPAL DA PÁGINA
// -----------------------------------------------------------------------------
export default function LogsPage() {
    const [meusEstacionamentos, setMeusEstacionamentos] = useState([]);
    const [filtroEstacionamento, setFiltroEstacionamento] = useState('');
    const [logs, setLogs] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    
    const [dataInicio, setDataInicio] = useState('');
    const [dataFim, setDataFim] = useState('');

    const fetchLogs = useCallback(async () => {
        if (!filtroEstacionamento) return;
        setIsLoading(true);
        try {
            const params = new URLSearchParams();
            if (dataInicio) params.append('dataInicio', dataInicio);
            if (dataFim) params.append('dataFim', dataFim);
            
            const response = await api.get(`/estacionamentos/${filtroEstacionamento}/logs?${params.toString()}`);
            setLogs(response.data);
        } catch { 
            toast.error("Erro ao carregar os registros de log.");
        } 
        finally { 
            setIsLoading(false);
        }
    }, [filtroEstacionamento, dataInicio, dataFim]);

    useEffect(() => {
        const fetchEstacionamentos = async () => {
            setIsLoading(true);
            try {
                const response = await api.get('/estacionamentos/meus');
                setMeusEstacionamentos(response.data);
                if (response.data.length > 0) {
                    setFiltroEstacionamento(response.data[0].id_estacionamento.toString());
                } else {
                    setIsLoading(false);
                }
            } catch {
                setError("Não foi possível carregar seus estacionamentos.");
                setIsLoading(false);
            }
        };
        fetchEstacionamentos();
    }, []);
    
    useEffect(() => {
        const timer = setTimeout(() => {
            if (filtroEstacionamento) {
                fetchLogs();
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [filtroEstacionamento, dataInicio, dataFim, fetchLogs]);

    const handleDownload = () => {
        if (logs.length === 0) {
            toast.error("Não há dados para exportar.");
            return;
        }
        const loadingToast = toast.loading("Preparando download...");
        const dataParaExportar = logs.map(log => ({
            "Data e Hora": new Date(log.data_log).toLocaleString('pt-BR'),
            "Usuário": log.usuario?.nome || 'Sistema',
            "Ação": log.acao,
            "Detalhes": JSON.stringify(log.detalhes),
        }));
        
        const csv = Papa.unparse(dataParaExportar);
        const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' });
        const nomeDoEstacionamento = meusEstacionamentos.find(e => e.id_estacionamento == filtroEstacionamento)?.nome || 'estacionamento';
        const nomeArquivo = `logs_${nomeDoEstacionamento.replace(/\s+/g, '_')}_${new Date().toLocaleDateString('pt-BR').replace(/\//g, '-')}.csv`;
        
        saveAs(blob, nomeArquivo);
        toast.success("Download iniciado!", { id: loadingToast });
    };

    if (isLoading && meusEstacionamentos.length === 0 && !error) {
        return <div className="p-8 flex justify-center items-center h-screen"><Loader2 className="animate-spin text-amber-500" size={48}/></div>;
    }
    if (error) {
        return <div className="p-8 text-center text-red-500">{error}</div>;
    }
    
    return (
        <main className="min-h-screen bg-white dark:bg-slate-900 p-4 sm:p-8 font-sans">
            <div className="w-full max-w-7xl mx-auto space-y-8">
                 <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                     <History size={32}/>
                     Registros de Atividade
                 </h1>
                 
                 {meusEstacionamentos.length === 0 ? (
                    <div className="text-center bg-white dark:bg-slate-800 rounded-lg p-12 shadow-sm">
                        <h2 className="text-xl font-bold">Nenhum estacionamento encontrado.</h2>
                        <p className="mt-2">Você precisa cadastrar um estacionamento para visualizar os logs.</p>
                    </div>
                ) : (
                <>
                    <div className="bg-gray-50 dark:bg-slate-800 rounded-lg shadow-sm p-4 flex flex-col sm:flex-row items-end gap-4 border-l-4 border-amber-500">
                        <div className="w-full sm:flex-1">
                            <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Estacionamento</label>
                            <select onChange={(e) => setFiltroEstacionamento(e.target.value)} value={filtroEstacionamento} className="w-full mt-1 h-10 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md p-2 text-sm focus:ring-amber-500 focus:border-amber-500">
                                {meusEstacionamentos.map(e => <option key={e.id_estacionamento} value={e.id_estacionamento}>{e.nome}</option>)}
                            </select>
                        </div>
                        <div className="w-full sm:w-auto">
                             <label className="text-xs font-medium text-gray-500 dark:text-gray-400">De</label>
                             <input type="date" value={dataInicio} onChange={(e) => setDataInicio(e.target.value)} className="w-full mt-1 h-10 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md p-2 text-sm focus:ring-amber-500 focus:border-amber-500"/>
                        </div>
                         <div className="w-full sm:w-auto">
                             <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Até</label>
                             <input type="date" value={dataFim} onChange={(e) => setDataFim(e.target.value)} className="w-full mt-1 h-10 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md p-2 text-sm focus:ring-amber-500 focus:border-amber-500"/>
                        </div>
                         <div className="w-full sm:w-auto">
                            <button onClick={handleDownload} className="w-full h-10 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md flex items-center justify-center gap-2 transition whitespace-nowrap">
                                <Download size={18}/> Baixar CSV
                            </button>
                        </div>
                    </div>
                    
                    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm overflow-hidden border dark:border-slate-700">
                        {isLoading ? (<div className="flex justify-center p-20"><Loader2 className="animate-spin text-amber-500" size={40}/></div>)
                        : (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
                                    <thead className="bg-gray-50 dark:bg-slate-700/50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Data e Hora</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Ação</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Usuário</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Detalhes</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-700">
                                        {logs.length > 0 ? logs.map(log => <LogTableRow key={log.id_log} log={log} />) 
                                        : (<tr><td colSpan={4} className="text-center py-16 text-gray-500 dark:text-gray-400">
                                            <div className="flex flex-col items-center gap-2">
                                                <ListChecks size={40} className="text-gray-400" />
                                                Nenhum registro encontrado para os filtros selecionados.
                                            </div>
                                        </td></tr>)}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </>
                )}
            </div>
        </main>
    );
}''