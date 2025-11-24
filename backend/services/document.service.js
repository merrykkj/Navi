import PDFDocument from 'pdfkit';
import { Document, Packer, Paragraph, TextRun } from 'docx';
import { Writable } from 'stream'; 


const streamToBuffer = (stream) => new Promise((resolve, reject) => {
    const chunks = [];
    stream.on('data', (chunk) => chunks.push(chunk));
    stream.on('error', reject);
    stream.on('end', () => resolve(Buffer.concat(chunks)));
});

/**
 * Gera um documento formatado com base nos dados do contexto.
 * @param {string} type - Tipo de documento ('PDF' ou 'DOCX').
 * @param {string} title - Título do documento.
 * @param {object} context - Dados operacionais fornecidos ao Navi.
 * @returns {Buffer} - O conteúdo binário do ficheiro.
 */
export async function generateDocument(type, title, context) {
    const dataString = JSON.stringify(context, null, 2);

    if (type === 'PDF') {
        const doc = new PDFDocument();
        doc.fontSize(16).text(title, { align: 'center' }).moveDown();
        doc.fontSize(12).text('Relatório Gerado pela Navi IA').moveDown();
        doc.fontSize(10).text(dataString); // Adiciona os dados como conteúdo formatado
        doc.end();
        return streamToBuffer(doc);
    } 
    
    if (type === 'DOCX') {
        const doc = new Document({
            sections: [{
                children: [
                    new Paragraph({
                        children: [new TextRun({ text: title, size: 32, bold: true })],
                        alignment: 'center'
                    }),
                    new Paragraph({
                        children: [new TextRun({ text: "Relatório Gerado pela Navi IA" })],
                        spacing: { after: 300 }
                    }),
                    new Paragraph({
                        children: [new TextRun({ text: "Dados de Contexto:" })],
                    }),
                    new Paragraph(dataString),
                ],
            }],
        });
        
        return Packer.toBuffer(doc);
    }

    throw new Error(`Tipo de documento '${type}' não suportado.`);
}