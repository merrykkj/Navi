import PDFDocument from 'pdfkit';
import { Document, Packer, Paragraph, TextRun, AlignmentType } from 'docx';


const streamToBuffer = (stream) => new Promise((resolve, reject) => {
    const chunks = [];
    stream.on('data', (chunk) => chunks.push(chunk));
    stream.on('error', reject);
    stream.on('end', () => resolve(Buffer.concat(chunks)));
});


export const DocumentService = {
    generateAndSend: async (res, naviResponse, dataContext, prefixo) => {
        const { documentType, documentTitle } = naviResponse;
      
        const fileBuffer = await DocumentService._generateBuffer(documentType, documentTitle, dataContext);
        const contentType = documentType === 'PDF' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
        const fileExtension = documentType === 'PDF' ? 'pdf' : 'docx';
        const fileName = `${documentTitle.replace(/\s/g, '_')}_${prefixo}.${fileExtension}`;
        res.setHeader('Content-Type', contentType);
        res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
        res.setHeader('Content-Length', fileBuffer.length);
        
        res.status(200).send(fileBuffer);
    },

    /**
     * Gera o Buffer do arquivo (PDF ou DOCX).
     */
    _generateBuffer: async (type, title, context) => {
        const dataString = JSON.stringify(context, null, 2);

        if (type === 'PDF') {
            const doc = new PDFDocument();
            doc.fontSize(16).text(title, { align: 'center' }).moveDown();
            doc.fontSize(12).text('Relatório Gerado pela Navi IA').moveDown();
            doc.fontSize(10).text(dataString); 
            doc.end();
            return streamToBuffer(doc);
        } 
        
        if (type === 'DOCX') {
            const doc = new Document({
                sections: [{
                    children: [
                        new Paragraph({
                            children: [new TextRun({ text: title, size: 36, bold: true })],
                            alignment: AlignmentType.CENTER
                        }),
                        new Paragraph({
                            children: [new TextRun({ text: "Relatório Gerado pela Navi IA" })],
                            spacing: { after: 300 }
                        }),
                        new Paragraph("Dados de Contexto:"),
                        new Paragraph(dataString),
                    ],
                }],
            });
            
            return Packer.toBuffer(doc);
        }

        throw new Error(`Tipo de documento '${type}' não suportado.`);
    }
};