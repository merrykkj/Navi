"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Users, Truck, Percent } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import api from '../../../lib/api';
import InfoCard from '../../../components/dashboard/cards/InfoCard';
import UserManagementTable from '../../../components/dashboard/UserManagementTable';
import ChartCard from '../../../components/dashboard/cards/ChartCard';

const PIE_CHART_COLORS = ['#FFD600', '#3b82f6', '#10b981', '#ef4444', '#f59e0b'];

const axiosFetcher = async (endpoint, options = {}) => {
    try {
        const response = await api.request({
            url: endpoint,
            method: options.method || 'GET',
            data: options.data,
            params: options.params,
        });
        return response.data;
    } catch (error) {
        const message = error.response?.data?.message || `Requisição falhou: ${error.message}`;
        throw new Error(message);
    }
};

// Componente de Gráfico Corrigido e Estilizado (Donut)
const RoleDistributionChart = ({ data }) => {
    const chartData = (data && data.length > 0)
        ? data.map((entry, index) => ({
            name: entry.role.charAt(0).toUpperCase() + entry.role.slice(1), // Capitalizar
            value: entry.count,
            color: PIE_CHART_COLORS[index % PIE_CHART_COLORS.length],
        }))
        : [{ name: 'Sem dados', value: 1, color: '#e2e8f0' }];

    return (
        <ResponsiveContainer width="100%" height={300}>
            <PieChart>
                <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60} // Estilo Donut
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                >
                    {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                    ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }} />
                <Legend verticalAlign="bottom" iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
            </PieChart>
        </ResponsiveContainer>
    );
};

export default function UserManagementPage() {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [users, setUsers] = useState([]);
    const [userKpis, setUserKpis] = useState({
        ativos: 0,
        inativos: 0,
        totalVeiculos: 0,
        variacaoVeiculos: 0,
        distribuicaoPapeis: [],
    });
    const router = useRouter();

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const fetchedUsers = await axiosFetcher('/usuarios');
            const fetchedKpis = await axiosFetcher('/usuarios/kpis/summary');
            
            const mappedUsers = Array.isArray(fetchedUsers)
                ? fetchedUsers.map(user => ({
                    id: user.id_usuario,
                    name: user.nome,
                    email: user.email,
                    role: user.papel.toLowerCase(),
                    isActive: user.ativo,
                }))
                : [];
                
            setUsers(mappedUsers);
            setUserKpis({
                ativos: fetchedKpis.usuarios.ativos,
                inativos: fetchedKpis.usuarios.inativos,
                totalVeiculos: fetchedKpis.veiculos.totalAtivos,
                variacaoVeiculos: fetchedKpis.veiculos.variacao,
                distribuicaoPapeis: fetchedKpis.distribuicaoPapeis.map(p => ({ role: p.role, count: p.count })), // Ajustado para p.role conforme correções anteriores
            });

        } catch (err) {
            if (err.message && err.message.includes('401')) {
                toast.error("Sessão expirada. Faça login novamente.");
                router.push('/login/administrador');
            } else {
                toast.error(err.message || 'Falha ao carregar dados.');
                setError(err.message || 'Falha na conexão.');
            }
        } finally {
            setLoading(false);
        }
    }, [router]);

    const handleLocalUserUpdate = useCallback((updatedData) => {
        setUsers(prevUsers =>
            prevUsers.map(user =>
                user.id === updatedData.id
                    ? { ...user, ...updatedData }
                    : user
            )
        );
        fetchData(); // Recarrega KPIs ao atualizar
    }, [fetchData]);

    const handleUpdateAndRefresh = useCallback(() => {
        fetchData();
    }, [fetchData]);

    useEffect(() => {
        const tokenExists = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
        if (tokenExists) {
            fetchData();
        } else {
            router.push('/login/administrador');
        }
    }, [fetchData, router]);

    if (loading) {
        return <div className="flex justify-center items-center min-h-screen dark:text-white"><p>Carregando dados dos Usuários...</p></div>;
    }

    if (error) {
        return (
            <div className="p-6 md:p-8 dark:text-red-400">
                <h1 className="text-3xl font-bold mb-6">Erro na Conexão</h1>
                <p>Não foi possível carregar a página. Detalhes: {error}</p>
                <button onClick={handleUpdateAndRefresh} className="mt-4 px-4 py-2 bg-yellow-500 text-white rounded-md">Tentar Novamente</button>
            </div>
        );
    }

    const totalUsers = userKpis.ativos + userKpis.inativos;
    const topKpis = [
        { title: 'Usuários Ativos', icon: Users, data: { value: userKpis.ativos, change: 0 } },
        { title: 'Usuários Inativos', icon: Users, data: { value: userKpis.inativos, change: 0 } },
        { title: 'Total de Veículos Ativos', icon: Truck, data: { value: userKpis.totalVeiculos, change: userKpis.variacaoVeiculos } },
        { title: 'Taxa de Proprietários', icon: Percent, data: { value: totalUsers > 0 ? parseFloat((userKpis.distribuicaoPapeis.find(p => p.role === 'proprietario')?.count / totalUsers * 100).toFixed(1)) : 0, change: 0, unit: '%' } },
    ];

    return (
        <div className="flex-1 p-6 md:p-8 bg-gray-50 dark:bg-slate-900 min-h-screen">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Gestão de Usuários da Plataforma</h1>

            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {topKpis.map(kpi => (
                    <InfoCard
                        key={kpi.title}
                        title={kpi.title}
                        value={kpi.data.value}
                        change={kpi.data.change}
                        icon={kpi.icon}
                        unit={kpi.unit}
                    />
                ))}
            </section>
            
            <section className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8">
                <ChartCard
                    title="Distribuição de Papéis"
                    subtitle={`Total de Usuários Ativos: ${userKpis.ativos}`}
                    data={userKpis.distribuicaoPapeis} // Dados para CSV
                >
                    <RoleDistributionChart data={userKpis.distribuicaoPapeis} />
                </ChartCard>

                <ChartCard
                    title="Engajamento de Veículos"
                    subtitle="Percentual de Motoristas com veículos cadastrados"
                >
                    <div className="flex justify-center items-center h-full text-gray-500 dark:text-gray-400">
                         *Dados de Engajamento por Motorista seriam colocados aqui.*
                    </div>
                </ChartCard>
            </section>

            <section className="mb-8">
                <UserManagementTable
                    users={users}
                    onUpdate={handleUpdateAndRefresh}
                    onLocalStatusChange={handleLocalUserUpdate}
                    axiosFetcher={axiosFetcher}
                />
            </section>
        </div>
    );
}