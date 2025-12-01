"use client";

import NaviChat from '../../../components/dashboard/navi-chat/NaviChat';

const ADMIN_TAGS = [
  'Faça um gráfico com os dados que você tem',
  'Poderia fazer um documento complexo sobre os dados do sistema?',
  'Resuma o estado atual do sistema.',
  ,
];

const adminContextSelector = () => {
  return {};
}

export default function AdminNaviAIPage() {
  return (
    <div className="h-screen flex flex-col">
      <NaviChat
        apiEndpoint="/api/navi/admin/ask"
        tagSuggestions={ADMIN_TAGS}
        contextSelector={adminContextSelector}
        customHeader={null}
      />
    </div>
  );
}