import './globals.css';
import { AuthProvider } from '../contexts/AuthContext';
import { ThemeProvider } from '../components/providers/providers'; 

export const metadata = {
  title: 'Navi - Encontre Sua Vaga',
  description: 'A solução inteligente para encontrar e gerenciar vagas de estacionamento.',
};

export default function RootLayout({ children }) {
  return (
  
    <html lang="pt-br" suppressHydrationWarning={true}>
      <body>
  
        <ThemeProvider
          attribute="class"
          defaultTheme="system" 
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            {children}
          </AuthProvider>
          
        </ThemeProvider>
      </body>
    </html>
  );
}