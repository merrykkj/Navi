import prisma from '../config/prisma.js';

export const criarReserva = async (dadosReserva, usuarioId) => {
    const { id_vaga, id_veiculo } = dadosReserva;

    return prisma.$transaction(async (tx) => {
        
    
        const vaga = await tx.vaga.findFirst({
            where: {
                id_vaga: parseInt(id_vaga),
                status: 'LIVRE',
            },
        });

        if (!vaga) {
            throw new Error("Vaga não está disponível para reserva.");
        }

        await tx.vaga.update({
            where: { id_vaga: parseInt(id_vaga) },
            data: { status: 'RESERVADA' },
        });

        const novaReserva = await tx.reserva.create({
            data: {
                id_vaga: parseInt(id_vaga),
                id_usuario: parseInt(usuarioId),
                id_veiculo: id_veiculo ? parseInt(id_veiculo) : null,
                status: 'ATIVA',
            },
        });

        return novaReserva;
    });
};

export const listarReservasPorUsuario = async (usuarioId) => {
    return await prisma.reserva.findMany({
        where: { id_usuario: parseInt(usuarioId) },
        include: { vaga: true, veiculo: true }, 
    });
};

export const listarReservasPorEstacionamento = async (estacionamentoId) => {
    return await prisma.reserva.findMany({
        where: {
            vaga: {
                id_estacionamento: parseInt(estacionamentoId),
            },
        },
        include: { usuario: true, veiculo: true, vaga: true }, 
    });
};

export const obterReservaPorId = async (reservaId) => {
    return await prisma.reserva.findUnique({
        where: { id_reserva: parseInt(reservaId) },
    });
};

export const concluirOuCancelarReserva = async (reservaId, novoStatus) => {
   
    return prisma.$transaction(async (tx) => {
    
        const reserva = await tx.reserva.findUnique({
            where: { id_reserva: parseInt(reservaId) },
        });

        if (!reserva) {
            throw new Error("Reserva não encontrada.");
        }

        await tx.vaga.update({
            where: { id_vaga: reserva.id_vaga },
            data: { status: 'LIVRE' },
        });

        const reservaAtualizada = await tx.reserva.update({
            where: { id_reserva: parseInt(reservaId) },
            data: { status: novoStatus, data_hora_fim: new Date() },
        });

        return reservaAtualizada;
    });
};