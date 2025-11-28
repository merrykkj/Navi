'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';

import { 
    PaperAirplaneIcon, 
    // ChatBubbleLeftRightIcon removido pois o botão foi retirado
    FolderOpenIcon, 
    XMarkIcon,
    DocumentTextIcon,
    ChartBarIcon,
    ArrowDownTrayIcon 
} from '@heroicons/react/24/outline';

import api from '@/lib/api'; 
import { useAuth } from '@/contexts/AuthContext'; 
import ReactMarkdown from 'react-markdown'; 

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  RadialLinearScale,
  Filler
} from 'chart.js';
import { Chart } from 'react-chartjs-2';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

ChartJS.register(
  CategoryScale, LinearScale, BarElement, PointElement, LineElement, 
  Title, Tooltip, Legend, ArcElement, RadialLinearScale, Filler
);

const ThinkingDots = () => (
    <div className="flex items-center space-x-1 p-2">
        <div className="w-2 h-2 rounded-full bg-slate-400 animate-pulse" style={{ animationDelay: '0s' }}></div>
        <div className="w-2 h-2 rounded-full bg-slate-400 animate-pulse" style={{ animationDelay: '0.2s' }}></div>
        <div className="w-2 h-2 rounded-full bg-slate-400 animate-pulse" style={{ animationDelay: '0.4s' }}></div>
    </div>
);

const MarkdownRenderer = ({ content }) => {
    const safeContent = typeof content === 'string' ? content : '';

    const components = {
        p: ({ node, ...props }) => <p className="whitespace-pre-wrap text-sm leading-relaxed mb-2" {...props} />,
        ul: ({ node, ...props }) => <ul className="list-disc ml-4 my-2" {...props} />,
        li: ({ node, ...props }) => <li className="mb-1" {...props} />,
        strong: ({ node, ...props }) => <strong className="font-bold text-slate-900 dark:text-white" {...props} />,
        h1: ({ node, ...props }) => <h1 className="text-lg font-bold mt-3 mb-2" {...props} />,
        h2: ({ node, ...props }) => <h2 className="text-base font-bold mt-2 mb-1" {...props} />,
        code: ({ node, inline, ...props }) => 
            inline 
            ? <code className="bg-slate-100 dark:bg-slate-700 px-1 rounded text-xs font-mono" {...props} />
            : <code className="block bg-slate-100 dark:bg-slate-700 p-2 rounded text-xs font-mono overflow-x-auto my-2" {...props} />
    };
    return <ReactMarkdown components={components}>{safeContent}</ReactMarkdown>;
};

const ChatMessageItem = ({ msg, isUser, messageRef }) => {
    const chartComponentRef = useRef(null);
  
    let content = "";
    if (msg.parts?.[0]?.text) {
        content = msg.parts[0].text;
    } else if (typeof msg.content === 'string') {
        content = msg.content;
    } else if (typeof msg.content === 'object' && msg.content !== null) {
        content = msg.content.insightText || msg.content.content || msg.content.text || "";
    }

    const downloadChartPDF = () => {
        const doc = new jsPDF();
        doc.setFontSize(16);
        doc.text("Relatório Gráfico Navi AI", 10, 10);
        doc.setFontSize(12);

        const splitText = doc.splitTextToSize(content, 180);
        doc.text(splitText, 10, 20);
 
        if (msg.chartData && chartComponentRef.current) {
            const canvas = chartComponentRef.current.canvas; 
            const imgData = canvas.toDataURL('image/png');
            doc.addImage(imgData, 'PNG', 10, 100, 190, 100); 
        }
        doc.save(`navi-chart-${Date.now()}.pdf`);
    };

    const downloadChartCSV = () => {
        if (!msg.chartData?.data) return;
        const data = msg.chartData.data;
        const labels = data.labels || [];
        const datasets = data.datasets || [];

        let csvContent = "data:text/csv;charset=utf-8,Label," + datasets.map(d => d.label).join(",") + "\n";

        labels.forEach((label, index) => {
            const row = [label];
            datasets.forEach(ds => row.push(ds.data[index]));
            csvContent += row.join(",") + "\n";
        });
        
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `navi-data-${Date.now()}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const downloadDocument = async () => {
        try {
            const dadosParaEnvio = {
                ...(msg.content?.dataContext || {}),
                texto: msg.content?.texto,
                insightText: msg.content?.insightText
            };

            const response = await api.post('/api/navi/download', {
                documentType: 'PDF', 
                documentTitle: msg.content?.documentTitle || "Relatorio",
                dataContext: dadosParaEnvio, 
                prefixo: 'Navi_Doc'
            }, { responseType: 'blob' });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `navi-document-${Date.now()}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error("Erro ao baixar documento:", error);
            alert("Erro ao gerar o documento no servidor.");
        }
    };
    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { position: 'bottom', labels: { color: '#94a3b8', font: { size: 10 } } },
        },
        scales: {
            x: { ticks: { color: '#94a3b8' }, grid: { color: '#334155' } },
            y: { ticks: { color: '#94a3b8' }, grid: { color: '#334155' } }
        },
        ...msg.chartData?.options 
    };
    const isDocument = msg.content?.type === 'document' || (typeof msg.content === 'object' && msg.content?.type === 'document');

    return (
        <div ref={messageRef} className={`flex w-full mb-4 ${isUser ? 'justify-end' : 'justify-start'}`}>
            <div 
                className={`
                    max-w-[90%] md:max-w-[80%] px-5 py-4 shadow-sm
                    ${isUser 
                        ? "bg-white text-slate-800 rounded-2xl rounded-br-none border border-slate-100 dark:border-slate-700 dark:text-gray-200 dark:bg-slate-800" 
                        : "bg-white text-slate-700 rounded-2xl rounded-tl-none border border-slate-100 dark:border-slate-700 dark:text-gray-200 dark:bg-slate-800"
                    }
                `}
            >
                {msg.chartData ? (
                     <div className="flex flex-col gap-3 w-full">
                        <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                            <ChartBarIcon className="w-4 h-4" />
                            Análise Gráfica
                        </div>
                        
                        <MarkdownRenderer content={content} />
                        <div className="w-full h-64 bg-slate-50 dark:bg-slate-900/50 rounded-lg p-2 border border-slate-100 dark:border-slate-700 relative">
                            <Chart 
                                ref={chartComponentRef} 
                                type={msg.chartData.type || 'bar'} 
                                data={msg.chartData.data} 
                                options={chartOptions}
                            />
                        </div>
                        <div className="flex gap-2 mt-2 justify-end">
                            <button onClick={downloadChartCSV} className="flex items-center gap-1 text-xs px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 rounded-md transition-colors">
                                <ArrowDownTrayIcon className="w-3 h-3" /> CSV
                            </button>
                            <button onClick={downloadChartPDF} className="flex items-center gap-1 text-xs px-3 py-1.5 bg-orange-100 text-orange-700 hover:bg-orange-200 dark:bg-orange-900/30 dark:text-orange-300 rounded-md transition-colors">
                                <DocumentTextIcon className="w-3 h-3" /> PDF
                            </button>
                        </div>
                     </div>
                ) : isDocument ? (
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2 text-xs font-semibold text-green-600 dark:text-green-400 uppercase tracking-wider">
                            <DocumentTextIcon className="w-4 h-4" />
                            Documento Gerado
                        </div>
                        <MarkdownRenderer content={content} />
                        <button onClick={downloadDocument} className="mt-2 w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors shadow-sm">
                            <ArrowDownTrayIcon className="w-4 h-4" /> Baixar Documento (PDF)
                        </button>
                    </div>
                ) : (
                    <MarkdownRenderer content={content} />
                )}
            </div>
        </div>
    );
};

export default function NaviChat({ 
    id_estacionamento_selecionado, 
    tagSuggestions = [], 
}) {
    const { user, isLoading: authLoading } = useAuth(); 
    
    const [isChatDrawerOpen, setIsChatDrawerOpen] = useState(false); 
    const [isFilesDrawerOpen, setIsFilesDrawerOpen] = useState(false);

    const [conversas, setConversas] = useState([]);
    const [activeConversaId, setActiveConversaId] = useState(null);
    const [historico, setHistorico] = useState([]);
    const [userInput, setUserInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [generatedFiles, setGeneratedFiles] = useState([]); 

    const messagesEndRef = useRef(null);
    const messageRefs = useRef({}); 
    
    const isSessionReady = !authLoading && !!user;
    const effectiveRole = user?.papel;

    // 1. Buscar Lista de Conversas
    const fetchConversas = useCallback(async () => {
        if (!user) return; 
        try {
            const response = await api.get('/api/conversas-navi');
            const data = response.data;
            setConversas(Array.isArray(data) ? data.sort((a, b) => new Date(b.data_atualizacao) - new Date(a.data_atualizacao)) : []);
        } catch (err) {
            console.warn("NaviChat: Erro ao listar conversas.", err);
        }
    }, [user]);

    useEffect(() => { if (isSessionReady) fetchConversas(); }, [fetchConversas, isSessionReady]);

    // 2. Carregar Histórico
    useEffect(() => {
        if (!activeConversaId || !user) { setHistorico([]); return; }

        setIsLoading(true);
        api.get(`/api/conversas-navi/${activeConversaId}/salvar`)
            .then(response => {
                const data = response.data;
                setHistorico(Array.isArray(data) ? data : []);
            })
            .catch(err => { console.error("Erro ao carregar histórico:", err); })
            .finally(() => setIsLoading(false));
    }, [activeConversaId, user]);

    useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [historico, isLoading]);

    // 3. Salvar Conversa
    const saveConversation = async (finalHistory, conversaId) => {
        try {
            const payload = {
                conversaId: conversaId,
                historico: finalHistory,
                id_estacionamento: effectiveRole !== 'ADMINISTRADOR' && id_estacionamento_selecionado 
                    ? Number(id_estacionamento_selecionado) 
                    : null
            };

            const response = await api.post('/api/conversas-navi/salvar', payload);
            const savedChat = response.data;

            if (!conversaId && savedChat?.id_conversa) {
                setActiveConversaId(savedChat.id_conversa);
                fetchConversas();
            }
        } catch (err) {
            console.error("ERRO CRÍTICO AO SALVAR CONVERSA:", err);
        }
    };

    // 4. Enviar Pergunta
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!userInput.trim() || isLoading || !isSessionReady) return;
        
        let endpoint = '';
        let body = {};

        if (effectiveRole === 'ADMINISTRADOR') {
            endpoint = `/api/navi/admin/ask`;
            body = { user_question: userInput, history: historico };
        } else {
            if (!id_estacionamento_selecionado) { setError('Selecione um estacionamento.'); return; }
            endpoint = `/api/navi/proprietario/ask`;
            body = { id_estacionamento: Number(id_estacionamento_selecionado), user_question: userInput, history: historico };
        }

        const newUserMessage = { role: 'user', parts: [{ text: userInput }] };
        const tempHistorico = [...historico, newUserMessage];
        
        setHistorico(tempHistorico);
        setUserInput('');
        setIsLoading(true);
        setError(null);

        try {
            const response = await api.post(endpoint, body);
            const iaResponse = response.data;
            
            let newAiMessage = {
                role: 'model',
                parts: [{ text: iaResponse.type === 'chart' ? iaResponse.insightText : iaResponse.content }],
                chartData: iaResponse.type === 'chart' ? iaResponse.chartData : null,
                content: iaResponse 
            };

            if (iaResponse.type === 'chart' || iaResponse.type === 'document') {
                setGeneratedFiles(prev => [...prev, { 
                    id: Date.now(), 
                    type: iaResponse.type, 
                    title: iaResponse.insightText?.substring(0, 30) + '...' || "Novo Arquivo"
                }]);
            }

            const finalHistorico = [...tempHistorico, newAiMessage];
            setHistorico(finalHistorico);

            await saveConversation(finalHistorico, activeConversaId);

        } catch (err) {
            console.error("Erro na requisição da IA:", err);
            const msg = err.response?.data?.error || err.message || 'Não foi possível conectar ao Navi.';
            setError(msg);
            setHistorico(prev => prev.slice(0, -1)); 
        } finally {
            setIsLoading(false);
        }
    };

    // === HELPERS UI ===
    const toggleChatDrawer = () => { setIsChatDrawerOpen(!isChatDrawerOpen); if(isFilesDrawerOpen) setIsFilesDrawerOpen(false); };
    const toggleFilesDrawer = () => { setIsFilesDrawerOpen(!isFilesDrawerOpen); if(isChatDrawerOpen) setIsChatDrawerOpen(false); };
    const closeAllDrawers = () => { setIsChatDrawerOpen(false); setIsFilesDrawerOpen(false); };
    
    const handleNewChat = () => {
        setActiveConversaId(null);
        setHistorico([]);
        setGeneratedFiles([]);
        setUserInput('');
        closeAllDrawers();
    };

    const handleSelectChat = (id) => {
        if (id !== activeConversaId) setActiveConversaId(id);
        closeAllDrawers();
    };

    const scrollToMessage = (index) => {
        const ref = messageRefs.current[index];
        if (ref && ref.scrollIntoView) ref.scrollIntoView({ behavior: 'smooth', block: 'center' });
        closeAllDrawers();
    };
    return (
        <div className="relative w-full h-screen overflow-hidden font-sans text-slate-600 dark:text-slate-300 bg-[#F3F4F6] dark:bg-slate-900 transition-colors duration-300">
            <header className="absolute top-0 left-0 right-0 h-16 px-6 flex items-center justify-between z-40 bg-transparent pointer-events-none">
                
                {/* 🚨 BOTÃO DO CHAT DRAWER REMOVIDO AQUI */}

                <div className="font-bold text-slate-400 text-xs tracking-widest uppercase pointer-events-auto">
                   NAVI IA
                </div>

                <button 
                    onClick={toggleFilesDrawer}
                    className="pointer-events-auto p-2 bg-white dark:bg-slate-800 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 text-slate-700 dark:text-slate-200"
                >
                    {isFilesDrawerOpen ? <XMarkIcon className="w-6 h-6" /> : <FolderOpenIcon className="w-6 h-6" />}
                </button>
            </header>
            
            {/* 🚨 BACKDROP PARA CHAT DRAWER REMOVIDO (Só sobrou para Files) */}
            {(isFilesDrawerOpen) && (
                <div 
                    className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm z-40 transition-opacity duration-300"
                    onClick={closeAllDrawers}
                />
            )}
            
            {/* 🚨 ASIDE DO CHAT DRAWER REMOVIDO COMPLETO */}

            <aside 
                className={`
                    absolute top-4 bottom-4 right-4 w-80 bg-white dark:bg-slate-800 rounded-3xl shadow-2xl z-50
                    flex flex-col overflow-hidden transition-transform duration-300 ease-in-out
                    ${isFilesDrawerOpen ? 'translate-x-0' : 'translate-x-[120%]'}
                `}
                onClick={e => e.stopPropagation()} 
            >
                <div className="p-6 border-b border-slate-100 dark:border-slate-700">
                    <h2 className="font-bold text-lg text-slate-800 dark:text-white">Arquivos</h2>
                    <p className="text-xs text-slate-400">Gerados na sessão atual</p>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {generatedFiles.length === 0 && <p className="text-center text-xs text-slate-400 mt-10">Nenhum arquivo gerado.</p>}
                    {generatedFiles.map((file, index) => (
                        <button 
                            key={file.id} 
                            onClick={() => scrollToMessage(index)} 
                            className="flex w-full items-center p-3 bg-slate-50 rounded-xl border border-slate-100 hover:bg-slate-100 transition-colors text-left dark:bg-slate-700 dark:border-slate-600 dark:hover:bg-slate-600"
                        >
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center mr-3 ${file.type === 'chart' ? 'bg-blue-100 text-blue-500' : 'bg-green-100 text-green-500'}`}>
                                {file.type === 'chart' ? <ChartBarIcon className="w-5 h-5" /> : <DocumentTextIcon className="w-5 h-5" />}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate">{file.title}</p>
                                <p className="text-xs text-slate-400 uppercase">{file.type}</p>
                            </div>
                        </button>
                    ))}
                </div>
            </aside>
            <main className="flex flex-col h-full w-full max-w-4xl mx-auto pt-20 pb-6 px-4">
                <div className="flex-1 overflow-y-auto scrollbar-hide px-2">
                    {historico.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center opacity-60">
                            <div className="w-24 h-24 bg-white dark:bg-slate-800 rounded-3xl mb-6 shadow-lg flex items-center justify-center p-4">
                                <img src="/naviIA.png" alt="Logo da Navi" className="w-full h-full object-contain opacity-80" />
                            </div>
                            <h3 className="text-lg font-medium text-slate-500 dark:text-slate-400">Como posso ajudar hoje?</h3>
                        </div>
                    ) : (
                        <div className="py-4">
                            {historico.map((msg, idx) => (<ChatMessageItem key={idx} msg={msg} isUser={msg.role === 'user'} messageRef={el => messageRefs.current[idx] = el} />))}
                            {isLoading && (<div className="flex justify-start mb-4"><div className="bg-white rounded-2xl rounded-tl-none shadow-sm px-4 py-2 dark:bg-slate-800"><ThinkingDots /></div></div>)}
                            <div ref={messagesEndRef} />
                        </div>
                    )}
                </div>
                <div className="flex-shrink-0 mt-4">
                    {error && <div className="text-xs text-red-500 text-center mb-2">{error}</div>}
                    {historico.length === 0 && tagSuggestions.length > 0 && (
                        <div className="flex justify-center gap-2 mb-4 overflow-x-auto pb-2 scrollbar-hide">
                            {tagSuggestions.map((tag, i) => (<button key={i} onClick={() => setUserInput(tag)} className="whitespace-nowrap px-4 py-2 bg-white border border-slate-200 rounded-full text-xs font-medium text-slate-600 shadow-sm hover:bg-slate-50 transition-colors dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-700">{tag}</button>))}
                        </div>
                    )}
                    <form onSubmit={handleSubmit} className="relative flex items-center bg-white rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.05)] border border-slate-100 p-2 pl-6 dark:bg-slate-800 dark:border-slate-700">
                        <input value={userInput} onChange={(e) => setUserInput(e.target.value)} placeholder={!isSessionReady ? "Conectando..." : "O que você gostaria de saber hoje?"} disabled={isLoading || !isSessionReady} className="flex-1 bg-transparent outline-none text-sm text-slate-700 placeholder:text-slate-400 dark:text-slate-200" />
                        <button type="submit" disabled={isLoading || !userInput.trim() || !isSessionReady} className="p-3 bg-yellow-400 text-white rounded-full hover:bg-yellow-500 disabled:opacity-50 disabled:hover:bg-yellow-400 transition-all duration-200 shadow-md shadow-yellow-200">
                            <PaperAirplaneIcon className="w-5 h-5 -rotate-45 translate-x-[2px] -translate-y-[1px]" />
                        </button>
                    </form>
                    <div className="text-center mt-3">
                        <p className="text-[10px] text-slate-400">O Navi pode cometer erros. Verifique informações importantes.</p>
                    </div>
                </div>
            </main>
        </div>
    );
}