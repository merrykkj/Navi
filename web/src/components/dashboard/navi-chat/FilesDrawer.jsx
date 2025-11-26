// src/components/NaviChat/FilesDrawer.js (CORRIGIDO PARA EXPORT CONST)

import React from 'react';
import { XMarkIcon, ChartBarIcon, DocumentTextIcon } from '@heroicons/react/24/solid';
import { ArrowDownTrayIcon as DownloadIcon } from '@heroicons/react/24/outline';


export const FilesDrawer = ({ isOpen, onClose, files, onSelectFile }) => {
    return (
        <aside 
            className={`fixed right-0 top-0 w-80 h-full bg-white dark:bg-slate-800 border-l border-slate-200 dark:border-slate-700 p-4 overflow-y-auto z-40 
                        transition-transform duration-300 ease-in-out 
                        ${isOpen ? 'translate-x-0' : 'translate-x-full'} lg:translate-x-0 lg:static lg:flex-shrink-0`}
            onClick={(e) => e.stopPropagation()}
        >
            <div className="flex justify-between items-center mb-4 border-b pb-2 border-slate-200 dark:border-slate-700">
                <h3 className="text-sm font-semibold text-gray-800 dark:text-slate-200">Ficheiros da conversa ({files.length})</h3>
                <button onClick={onClose} className="text-slate-700 dark:text-slate-300 hover:text-red-500">
                    <XMarkIcon className="w-6 h-6" />
                </button>
            </div>
            
            <div className="p-3 overflow-auto flex-1 space-y-3">
                {files.length === 0 ? (
                    <p className="text-xs text-slate-400">Nenhum arquivo gerado.</p>
                ) : (
                    files.map(file => (
                        <div key={file.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                            <div className="flex items-center gap-2">
                                {file.type === 'chart' ? (
                                    <ChartBarIcon className="w-5 h-5 text-yellow-500" />
                                ) : (
                                    <DocumentTextIcon className="w-5 h-5 text-yellow-500" />
                                )}
                                <span className="text-sm font-medium truncate text-gray-800 dark:text-slate-200">{file.title}</span>
                            </div>
                            <button onClick={() => onSelectFile(file.id)} className="p-1 text-slate-400 hover:text-yellow-600">
                                <DownloadIcon className="w-4 h-4" />
                            </button>
                        </div>
                    ))
                )}
            </div>
        </aside>
    );
};