import PDFDocument from 'pdfkit';
import { Document, Packer, Paragraph, TextRun, AlignmentType, HeadingLevel } from 'docx';

const streamToBuffer = (stream) => new Promise((resolve, reject) => {
    const chunks = [];
    stream.on('data', (chunk) => chunks.push(chunk));
    stream.on('error', reject);
    stream.on('end', () => resolve(Buffer.concat(chunks)));
});

// Helper para limpar Markdown
const cleanMarkdown = (text) => {
    if (typeof text !== 'string') return '';
    return text
        .replace(/\*\*(.*?)\*\*/g, '$1') // Remove negrito **texto**
        .replace(/##\s?/g, '')            // Remove titulos ##
        .replace(/\\n/g, '\n')            // Corrige quebras de linha escapadas (\n) no JSON
        .trim();
};

// Helper seguro para JSON
const safeJsonParse = (input) => {
    if (typeof input === 'object' && input !== null) return input;
    if (typeof input !== 'string') return null;
    try {
        return JSON.parse(input);
    } catch (e) {
        const clean = input.replace(/```json/g, '').replace(/```/g, '').trim();
        try { return JSON.parse(clean); } catch (e2) { return null; }
    }
};

export const DocumentGenerateNavi = {
    generateAndSend: async (res, naviResponse, contentData, prefixo) => {
        const { documentType, documentTitle } = naviResponse;
        
        try {
            const fileBuffer = await DocumentGenerateNavi._generateBuffer(documentType, documentTitle, contentData);

            const contentType = documentType === 'PDF' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
            const fileExtension = documentType === 'PDF' ? 'pdf' : 'docx';
            const fileName = `${(documentTitle || 'Relatorio').replace(/[^a-zA-Z0-9]/g, '_')}_${prefixo}.${fileExtension}`;

            res.setHeader('Content-Type', contentType);
            res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
            res.setHeader('Content-Length', fileBuffer.length);
            
            res.status(200).send(fileBuffer);
        } catch (error) {
            console.error('Erro ao gerar documento:', error);
            if (!res.headersSent) res.status(500).json({ error: 'Falha ao gerar documento.' });
        }
    },

    _generateBuffer: async (type, title, contentData) => {
        // 1. Parse do Texto Estruturado
        const rawText = contentData.texto || contentData.content?.texto;
        let structuredContent = safeJsonParse(rawText);

        // Fallback
        if (!structuredContent) {
            structuredContent = { "Resumo": contentData.insightText || "Conteúdo indisponível." };
        }

        // Dados técnicos (sobras)
        const metricsData = { ...contentData };
        delete metricsData.texto;
        delete metricsData.insightText;
        delete metricsData.content;
        delete metricsData.documentTitle;
        delete metricsData.documentType;
        delete metricsData.type;

        // =================================================================
        // GERAÇÃO DE PDF
        // =================================================================
        if (type === 'PDF') {
            const doc = new PDFDocument({ margin: 50, bufferPages: true });
            
            // Cabeçalho
            doc.fontSize(20).font('Helvetica-Bold').text(title || 'Relatório Navi', { align: 'center' });
            doc.moveDown();
            doc.fontSize(10).font('Helvetica').text(`Gerado em: ${new Date().toLocaleString()}`, { align: 'center', color: 'grey' });
            doc.moveDown(2);
            doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
            doc.moveDown(2);

            // Loop Dinâmico
            for (const [key, value] of Object.entries(structuredContent)) {
                
                // A. Sumário
                if (key === 'sumario' && Array.isArray(value)) {
                    doc.fontSize(14).font('Helvetica-Bold').text("Sumário");
                    doc.moveDown(0.5);
                    value.forEach(item => {
                        doc.fontSize(11).font('Helvetica').text(`• ${cleanMarkdown(item)}`, { indent: 10 });
                    });
                    doc.moveDown(2);
                    continue;
                }

                // B. Seções (1. Introdução, 2. Visão Geral, etc.)
                // No seu JSON, a CHAVE é o Título
                doc.font('Helvetica-Bold').fontSize(14).text(cleanMarkdown(key));
                doc.moveDown(0.5);

                // O conteúdo está dentro de value.texto ou é o próprio value se for string
                let textoCorpo = "";
                if (typeof value === 'object' && value.texto) {
                    textoCorpo = value.texto;
                } else if (typeof value === 'string') {
                    textoCorpo = value;
                }

                if (textoCorpo) {
                    doc.font('Helvetica').fontSize(12).text(cleanMarkdown(textoCorpo), { 
                        align: 'justify', 
                        lineGap: 3 
                    });
                }
                
                doc.moveDown(1.5);
            }

            // Anexo: Dados Técnicos
            if (Object.keys(metricsData).length > 0) {
                doc.addPage();
                doc.fontSize(16).font('Helvetica-Bold').text('Anexo: Dados Brutos', { underline: true });
                doc.moveDown();
                doc.fontSize(10).font('Courier');
                for (const [key, val] of Object.entries(metricsData)) {
                    const valStr = typeof val === 'object' ? JSON.stringify(val) : String(val);
                    if (valStr.length < 500) {
                        doc.text(`• ${key}: ${valStr}`);
                        doc.moveDown(0.2);
                    }
                }
            }

            // Rodapé
            const range = doc.bufferedPageRange();
            for (let i = range.start; i < (range.start + range.count); i++) {
                doc.switchToPage(i);
                doc.fontSize(8).font('Helvetica').text(`Página ${i + 1} de ${range.count}`, 50, 700, { align: 'center', width: 500 });
            }

            doc.end();
            return streamToBuffer(doc);
        }

        // =================================================================
        // GERAÇÃO DE DOCX
        // =================================================================
        if (type === 'DOCX') {
            const docChildren = [
                new Paragraph({ text: title || "Relatório", heading: HeadingLevel.TITLE, alignment: AlignmentType.CENTER }),
                new Paragraph({ text: `Gerado em: ${new Date().toLocaleString()}`, alignment: AlignmentType.CENTER, spacing: { after: 400 } }),
            ];

            for (const [key, value] of Object.entries(structuredContent)) {
                
                // Sumário
                if (key === 'sumario' && Array.isArray(value)) {
                    docChildren.push(new Paragraph({ text: "Sumário", heading: HeadingLevel.HEADING_1 }));
                    value.forEach(item => {
                        docChildren.push(new Paragraph({ text: cleanMarkdown(item), bullet: { level: 0 } }));
                    });
                    continue;
                }

                // Título da Seção (A própria chave)
                docChildren.push(new Paragraph({
                    text: cleanMarkdown(key),
                    heading: HeadingLevel.HEADING_1,
                    spacing: { before: 300, after: 100 }
                }));

                // Conteúdo
                let textoCorpo = "";
                if (typeof value === 'object' && value.texto) {
                    textoCorpo = value.texto;
                } else if (typeof value === 'string') {
                    textoCorpo = value;
                }

                if (textoCorpo) {
                    docChildren.push(new Paragraph({
                        children: [new TextRun(cleanMarkdown(textoCorpo))],
                        alignment: AlignmentType.JUSTIFIED,
                        spacing: { after: 200 }
                    }));
                }
            }

            // Anexo
            if (Object.keys(metricsData).length > 0) {
                docChildren.push(new Paragraph({ text: "Dados Brutos", heading: HeadingLevel.HEADING_1, pageBreakBefore: true }));
                for (const [key, val] of Object.entries(metricsData)) {
                    const valStr = typeof val === 'object' ? JSON.stringify(val) : String(val);
                    docChildren.push(new Paragraph({ text: `${key}: ${valStr.substring(0, 200)}` }));
                }
            }

            const doc = new Document({ sections: [{ children: docChildren }] });
            return Packer.toBuffer(doc);
        }

        throw new Error(`Tipo '${type}' não suportado.`);
    }
};