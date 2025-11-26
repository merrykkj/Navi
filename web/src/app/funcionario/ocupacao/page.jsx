'use client';

// -----------------------------------------------------------------------------
// IMPORTAÇÕES
// -----------------------------------------------------------------------------
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import api from '../../../lib/api';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { Building, Loader2, X, Car, Bike, ParkingSquare, User, Zap, Wrench, PlayCircle, Eye } from 'lucide-react';

// -----------------------------------------------------------------------------
// CONFIGURAÇÕES E CONSTANTES
// -----------------------------------------------------------------------------
const VAGAS_POR_PAGINA = 32;

// -----------------------------------------------------------------------------
// COMPONENTES DE UI (REUTILIZADOS E ADAPTADOS)
// -----------------------------------------------------------------------------
const VagaIcon = ({ tipo, className = "w-6 h-6" }) => {
    switch (tipo) {
        case 'MOTO': return <Bike className={className} />;
        case 'PCD': return <ParkingSquare className={className} />;
        case 'IDOSO': return <User className={className} />;
        case 'ELETRICO': return <Zap className={className} />;
        default: return <Car className={className} />;
    }
};

const VagaCard = ({ vaga, onClick }) => {
    const statusClasses = {
        LIVRE: 'bg-green-100 dark:bg-green-900/50 border-green-300 dark:border-green-700 text-green-800 dark:text-green-300',
        OCUPADA: 'bg-red-100 dark:bg-red-900/50 border-red-300 dark:border-red-700 text-red-800 dark:text-red-300',
        RESERVADA: 'bg-blue-100 dark:bg-blue-900/50 border-blue-300 dark:border-blue-700 text-blue-800 dark:text-blue-300',
        MANUTENCAO: 'bg-gray-200 dark:bg-gray-800/50 border-gray-400 dark:border-gray-600 text-gray-700 dark:text-gray-400',
    };
    return (
        <button onClick={onClick} className={`p-4 rounded-lg border flex flex-col items-center justify-center text-center transition-transform hover:scale-105 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-amber-500 ${statusClasses[vaga.status] || statusClasses.MANUTENCAO}`}>
            <VagaIcon tipo={vaga.tipo_vaga} className="w-8 h-8" />
            <span className="font-bold text-gray-900 dark:text-white mt-2 text-base">{vaga.identificador}</span>
            <span className="text-xs font-semibold uppercase tracking-wider">{vaga.status}</span>
        </button>
    );
};

const Modal = ({ isOpen, onClose, title, children }) => (
    <AnimatePresence>
        {isOpen && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4" onClick={onClose}>
                <motion.div
                    initial={{ scale: 0.9, y: 30 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 30 }}
                    transition={{ type: "spring", stiffness: 400, damping: 40 }}
                    className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg p-6 pt-12 relative border-t-4 border-amber-500" onClick={e => e.stopPropagation()}>
                    <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-amber-500 transition-all duration-300 hover:rotate-90"><X size={28}/></button>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">{title}</h2>
                    {children}
                </motion.div>
            </motion.div>
        )}
    </AnimatePresence>
);

// MODAL SIMPLIFICADO PARA FUNCIONÁRIO
const ModalAcoesVagaFuncionario = ({ vaga, isOpen, onClose, onAction }) => {
    if (!vaga) return null;
    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Operar Vaga ${vaga.identificador}`}>
             <div className="space-y-6">
                <div>
                     <h3 className="font-semibold text-gray-800 dark:text-white">Informações</h3>
                     <div className="text-base text-gray-600 dark:text-gray-400 mt-2 space-y-2 border-l-2 border-amber-500 pl-4">
                        <p className="flex items-center gap-2"><strong>Tipo:</strong> <VagaIcon tipo={vaga.tipo_vaga} className="w-5 h-5" /> {vaga.tipo_vaga}</p>
                        <p><strong>Status:</strong> <span className="font-semibold">{vaga.status}</span></p>
                    </div>
                </div>
                <div>
                    <h3 className="font-semibold text-gray-800 dark:text-white">Ações de Operação</h3>
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
                        <button onClick={() => onAction(vaga.id_vaga, 'OCUPADA')} disabled={vaga.status === 'OCUPADA'} className="flex items-center justify-center gap-2 py-3 px-4 bg-orange-100 text-orange-800 hover:bg-orange-200 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-orange-900/50 dark:text-orange-200 dark:hover:bg-orange-900/70 rounded-md transition font-medium">
                           <Car size={16}/> Marcar Ocupada
                        </button>
                         <button onClick={() => onAction(vaga.id_vaga, 'LIVRE')} disabled={vaga.status === 'LIVRE'} className="flex items-center justify-center gap-2 py-3 px-4 bg-green-100 text-green-800 hover:bg-green-200 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-green-900/50 dark:text-green-200 dark:hover:bg-green-900/70 rounded-md transition font-medium">
                             <PlayCircle size={16}/> Marcar Livre
                        </button>
                        <button onClick={() => onAction(vaga.id_vaga, 'MANUTENCAO')} className="sm:col-span-2 flex items-center justify-center gap-2 py-3 px-4 bg-yellow-100 text-yellow-800 hover:bg-yellow-200 dark:bg-yellow-900/50 dark:text-yellow-200 dark:hover:bg-yellow-900/70 rounded-md transition font-medium">
                            <Wrench size={16}/> Colocar em Manutenção
                        </button>
                    </div>
                </div>
            </div>
        </Modal>
    );
};


// -----------------------------------------------------------------------------
// COMPONENTE PRINCIPAL DA PÁGINA
// -----------------------------------------------------------------------------
export default function OcupacaoFuncionarioPage() {
    const [meusEstacionamentos, setMeusEstacionamentos] = useState([]);
    const [vagas, setVagas] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [filtroEstacionamento, setFiltroEstacionamento] = useState('');
    const [filtroTipo, setFiltroTipo] = useState('TODOS');
    const [filtroStatus, setFiltroStatus] = useState('TODOS');
    const [vagaSelecionada, setVagaSelecionada] = useState(null);

    const fetchData = useCallback(async (estacionamentoId) => {
        if (!estacionamentoId) return;
        setIsLoading(true); setVagas([]);
        try {
            const response = await api.get(`/estacionamentos/${estacionamentoId}/vagas`);
            setVagas(response.data);
        } catch {
            toast.error("Erro ao carregar vagas.");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        const fetchMeusVinculos = async () => {
            setIsLoading(true);
            try {
                // Rota que retorna os estacionamentos aos quais o funcionário está vinculado
                const response = await api.get('/estacionamentos/meus'); 
                setMeusEstacionamentos(response.data);
                if (response.data.length > 0) {
                    const primeiroId = response.data[0].id_estacionamento;
                    setFiltroEstacionamento(primeiroId.toString());
                    await fetchData(primeiroId);
                } else {
                    setError("Você не está vinculado a nenhum estacionamento.");
                    setIsLoading(false);
                }
            } catch(err) {
                setError("Não foi possível carregar os dados do seu vínculo.");
                setIsLoading(false);
            }
        };
        fetchMeusVinculos();
    }, [fetchData]);

    const handleAtualizarStatusVaga = async (vagaId, novoStatus) => {
        const loadingToast = toast.loading("Atualizando status...");
        try {
            await api.put(`/vagas/${vagaId}`, { status: novoStatus });
            toast.success("Status da vaga atualizado!", { id: loadingToast });
            setVagaSelecionada(null);
            fetchData(filtroEstacionamento); // Recarrega os dados
        } catch(error) {
            toast.error(error.response?.data?.message || "Erro ao atualizar status.", { id: loadingToast });
        }
    };
    
    const vagasFiltradas = useMemo(() =>
        vagas.filter(vaga => (filtroStatus === 'TODOS' || vaga.status === filtroStatus) && (filtroTipo === 'TODOS' || vaga.tipo_vaga === filtroTipo)),
        [vagas, filtroStatus, filtroTipo]
    );

    if (isLoading && meusEstacionamentos.length === 0 && !error) {
        return <div className="p-8 flex justify-center items-center h-screen"><Loader2 className="animate-spin text-amber-500" size={48}/></div>;
    }
    if (error) { return <div className="p-8 text-center text-red-500">{error}</div>; }

    return (
        <main className="min-h-screen bg-white dark:bg-slate-900 p-4 sm:p-8 font-sans">
             <div className="w-full max-w-7xl mx-auto space-y-8">
                 <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Controle de Ocupação</h1>
                
                <div className="bg-gray-50 dark:bg-slate-800 rounded-lg shadow-sm p-4 flex flex-col sm:flex-row items-end gap-4 border-l-4 border-amber-500">
                    <div className="flex-1 w-full sm:w-auto">
                        <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Estacionamento</label>
                        <span className="font-semibold text-gray-700 dark:text-gray-200 p-2 flex items-center gap-2 w-full mt-1 h-10 border-b border-gray-300 dark:border-slate-600">
                             <Building size={16}/> {meusEstacionamentos[0]?.nome || 'Carregando...'}
                         </span>
                    </div>
                     <div className="flex-1 w-full sm:w-auto">
                        <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Filtrar por Tipo</label>
                        <select onChange={(e) => setFiltroTipo(e.target.value)} className="w-full mt-1 bg-white ... h-10">{/* opções */}</select>
                    </div>
                     <div className="flex-1 w-full sm:w-auto">
                        <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Filtrar por Status</label>
                        <select onChange={(e) => setFiltroStatus(e.target.value)} className="w-full mt-1 bg-white ... h-10">{/* opções */}</select>
                    </div>
                </div>

                {isLoading ? ( <div className="flex justify-center p-12"><Loader2 className="animate-spin text-amber-500" size={48}/></div> )
                : vagas.length > 0 ? (
                    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-6">
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Exibindo {vagasFiltradas.length} de {vagas.length} vagas.</p>
                        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
                            {vagasFiltradas.map(vaga => <VagaCard key={vaga.id_vaga} vaga={vaga} onClick={() => setVagaSelecionada(vaga)} />)}
                        </div>
                    </div>
                ) : ( <div className="text-center ..."><p>Nenhuma vaga encontrada para este estacionamento.</p></div> )}
            </div>
            
            <ModalAcoesVagaFuncionario isOpen={!!vagaSelecionada} onClose={() => setVagaSelecionada(null)} vaga={vagaSelecionada} onAction={handleAtualizarStatusVaga} />
        </main>
    );
}