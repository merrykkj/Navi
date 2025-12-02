import bcrypt from 'bcryptjs';
export const generateHashedPassword = async (senha)  => {
    try {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(senha, salt);
        return hashedPassword;
    } catch (error) {
        console.error('Erro ao hashear a senha:', error);
        process.exit(1); // Encerra o processo com código de erro
    }
}
