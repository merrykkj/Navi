"use client";

import NaviChat from '../../../components/dashboard/navi-chat/NaviChat';

const PROP_TAGS = [
  'Faça um gráfico com os dados que você tem',
  'Faça um documento com os dados que você tem',
  'Resuma o estado do meu estacionamento.',
  ,
];

const PropContextSelector = () => {
  return {};
}

export default function PropNaviAIPage() {
  return (
    <div className="h-screen flex flex-col">
      <NaviChat
        apiEndpoint="/api/navi/proprietario/ask"
        tagSuggestions={PROP_TAGS}
        contextSelector={PropContextSelector}
        customHeader={null}
      />
    </div>
  );
}