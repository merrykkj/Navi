// src/components/NaviChat/ChatDrawer.js (CORRIGIDO PARA EXPORT CONST)

import React from 'react';
import { ChatBubbleLeftIcon, XMarkIcon } from '@heroicons/react/24/solid';
import { PencilIcon } from '@heroicons/react/24/outline'; 

// Item de Conversa (Sidebar)
const ConversaItem = ({ chat, isActive, onSelect, onEdit }) => (
    <div 
        onClick={() => onSelect(chat.id)}
        className={`group flex items-center justify-between p-3 rounded-xl transition-colors ${isActive ? 'bg-yellow-500' : 'hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer'}`}
    >
        <div className="flex-1 truncate">
            <div className={`text-sm font-medium truncate ${isActive ? 'text-white' : 'text-gray-800 dark:text-slate-200'}`}>{chat.titulo || 'Nova Conversa'}</div>
            <div className={`text-xs ${isActive ? 'text-yellow-200' : 'text-slate-400'}`}>{new Date(chat.data_criacao).toLocaleDateString()}</div>
        </div>
        <button onClick={(e) => { e.stopPropagation(); onEdit(chat.id); }} className={`p-1 ${isActive ? 'text-white' : 'text-slate-400 opacity-0 group-hover:opacity-100'} hover:text-slate-600 transition-opacity`}>
            <PencilIcon className="w-4 h-4" />
        </button>
    </div>
);


export const ChatDrawer = ({ isOpen, onClose, chats, activeId, onSelect, onNewChat }) => {
    return (
        <aside 
            className={`absolute lg:relative inset-y-0 left-0 z-30 bg-white dark:bg-slate-800 transition-transform 
                        ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:w-80 w-80 flex flex-col border-r border-slate-200 dark:border-slate-700`}
            onClick={(e) => e.stopPropagation()}
        >
            <div className="p-4 flex items-center justify-between border-b border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-3">
                    <ChatBubbleLeftIcon className="w-6 h-6 text-yellow-500" />
                    <h3 className="text-sm font-semibold text-gray-800 dark:text-slate-200">Conversas</h3>
                </div>
                <button onClick={onNewChat} className="px-3 py-1.5 bg-yellow-500 text-white rounded-md text-xs hover:bg-yellow-600 transition-colors">+ Novo Chat</button>
                {/* Botão de Fechar Mobile (X) - Fica no topo do drawer, mas só aparece se 'isOpen' for true */}
                {isOpen && window.innerWidth < 1024 && (
                     <button onClick={onClose} className="absolute top-4 right-4 text-slate-700 dark:text-slate-300 hover:text-red-500 lg:hidden">
                        <XMarkIcon className="w-6 h-6" />
                     </button>
                )}
            </div>
            
            <div className="p-3 overflow-auto flex-1 space-y-2">
                {chats.map(c => (
                    <ConversaItem key={c.id} chat={c} isActive={activeId === c.id} onSelect={onSelect} onEdit={() => alert('Edição em implementação')} />
                ))}
                {chats.length === 0 && <p className="text-xs text-slate-400">Nenhuma conversa encontrada.</p>}
            </div>
        </aside>
    );
};