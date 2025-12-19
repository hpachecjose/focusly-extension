<div align="center">
 
  <h1>Focusly</h1>
  <p><strong>Recupere seu tempo. Elimine distrações. Mantenha o foco.</strong></p>
</div>

---

**Focusly** é uma extensão para Google Chrome projetada para ajudar você a combater o vício em redes sociais e manter a produtividade. Ela monitora o tempo gasto em sites de distração e impõe limites suaves ou rígidos quando necessário.

## ✨ Funcionalidades Principais

- **📊 Monitoramento em Tempo Real:** Saiba exatamente quanto tempo você gastou em cada site hoje.
- **⛔ Bloqueio de Distrações:** Defina limites diários (ex: 30 min no YouTube). Atingiu o limite? O site é bloqueado.
- **🧠 Detecção de Inatividade:** O tempo só conta se você estiver realmente usando a aba. Se sair do computador, a contagem pausa.
- **🛡️ Privacidade Total:** Seus dados ficam 100% no seu computador (Local Storage API). Nada é enviado para a nuvem.

## 🚀 Como Instalar (Modo Desenvolvedor)

Como este projeto ainda está em desenvolvimento, siga os passos abaixo para testar:

1. Baixe ou clone este repositório.
2. Abra o Chrome e digite `chrome://extensions` na barra de endereço.
3. Ative o **"Modo do desenvolvedor"** no canto superior direito.
4. Clique em **"Carregar sem compactação"** (Load unpacked).
5. Selecione a pasta onde você salvou este projeto (`Focusly`).

## 🛠️ Tecnologias Utilizadas

- **Manifest V3:** Padrão moderno e seguro de extensões do Chrome.
- **Service Workers:** Para lógica em background eficiente.
- **Chrome Storage & Alarms:** Para persistência de dados e resets diários.
- **Vanilla JavaScript / HTML / CSS:** Leve, rápido e sem dependências pesadas.

## 📁 Estrutura do Projeto

```
Focusly/
├── manifest.json       # Configuração principal da extensão
├── background/         # Script de serviço (cérebro)
├── content/            # Scripts que rodam nas páginas (sensor/bloqueio)
├── popup/              # Interface rápida (ao clicar no ícone)
├── options/            # Painel de controle e configurações
├── pages/              # Páginas internas (ex: bloqueio)
├── utils/              # Funções auxiliares reutilizáveis
└── assets/             # Ícones e recursos visuais
```

## 🔒 Segurança

Este projeto foi auditado para garantir a segurança dos dados do usuário:
- ✅ Correção de vulnerabilidades XSS.
- ✅ Validação rígida de inputs de domínio.
- ✅ Uso restrito de permissões do navegador.

---

<div align="center">
  <sub>Desenvolvido com foco e disciplina.</sub>
</div>
