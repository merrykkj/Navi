"use client";

import React, { useRef, useState } from 'react';
import { Download, FileText, Image as ImageIcon } from 'lucide-react';
import { toPng } from 'html-to-image';
import jsPDF from 'jspdf';

export default function ChartCard({ 
  title, 
  subtitle, 
  children, 
  data = [], 
  dropdownOptions, 
  selectedDropdown, 
  onDropdownChange,
}) {
  const chartRef = useRef(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // --- Função Download PDF ---
  const handleDownloadPDF = async () => {
    if (!chartRef.current) return;
    setIsMenuOpen(false);

    try {
      const isDarkMode = document.documentElement.classList.contains('dark');
      const bgColor = isDarkMode ? '#1e293b' : '#ffffff';

      const dataUrl = await toPng(chartRef.current, {
        backgroundColor: bgColor,
        pixelRatio: 2,
      });

      const pdf = new jsPDF({ orientation: 'landscape' });
      const imgProps = pdf.getImageProperties(dataUrl);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

      pdf.setFontSize(14);
      pdf.text(title, 10, 10);
      pdf.addImage(dataUrl, 'PNG', 0, 15, pdfWidth, pdfHeight);
      
      pdf.save(`${title.replace(/\s+/g, '_').toLowerCase()}.pdf`);
    } catch (err) {
      console.error('Erro ao gerar PDF:', err);
    }
  };

  // --- Função Download CSV ---
  const handleDownloadCSV = () => {
    if (!data || data.length === 0) return;
    setIsMenuOpen(false);

    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(obj => 
      Object.values(obj).map(val => `"${val}"`).join(',')
    ).join('\n');

    const csvContent = `data:text/csv;charset=utf-8,${headers}\n${rows}`;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${title.replace(/\s+/g, '_').toLowerCase()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6 flex flex-col border-b-4 border-amber-500 transition-colors duration-300 relative min-h-[420px]">
      
      {/* --- HEADER: Títulos e Filtros --- */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-bold text-gray-800 dark:text-white">{title}</h3>
          {subtitle && <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{subtitle}</p>}
        </div>

        {/* Dropdown de Filtro (Mantido no Topo) */}
        {dropdownOptions && (
          <select
            className="bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-md py-1.5 px-3 text-sm text-gray-700 dark:text-gray-200 outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer transition-colors"
            value={selectedDropdown}
            onChange={(e) => onDropdownChange && onDropdownChange(e.target.value)}
          >
            {dropdownOptions.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        )}
      </div>

      {/* --- ÁREA DO GRÁFICO --- */}
      <div ref={chartRef} className="flex-1 w-full bg-white dark:bg-slate-800 p-2 rounded flex flex-col justify-center">
        {children}
      </div>

      {/* --- FOOTER: Botão de Download --- */}
      <div className="flex justify-end mt-4 pt-3 border-t border-gray-100 dark:border-slate-700">
        <div className="relative">
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="cursor-pointer flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-gray-500 hover:text-amber-600 dark:text-gray-400 dark:hover:text-amber-400 rounded-md hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
            title="Opções de Exportação"
          >
            <span>Exportar</span>
            <Download size={16} />
          </button>

          {/* Menu Dropup (Abre para CIMA agora: bottom-full mb-2) */}
          {isMenuOpen && (
            <div className="absolute right-0 bottom-full mb-2 w-40 bg-white dark:bg-slate-700 rounded-md shadow-xl ring-1 ring-black/5 overflow-hidden z-50">
              <button 
                onClick={handleDownloadPDF} 
                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-600 transition-colors"
              >
                <ImageIcon size={16} className="mr-2 text-blue-500" /> PDF (Imagem)
              </button>
              <button 
                onClick={handleDownloadCSV} 
                disabled={!data || data.length === 0} 
                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <FileText size={16} className="mr-2 text-green-500" /> CSV (Dados)
              </button>
            </div>
          )}

          {/* Overlay para fechar ao clicar fora */}
          {isMenuOpen && <div className="fixed inset-0 z-40" onClick={() => setIsMenuOpen(false)} />}
        </div>
      </div>
    </div>
  );
}