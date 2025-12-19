# 📘 rules.md  
## Livro de Regras para Geração de Código Profissional, Seguro, Escalável e Manutenível

> **Propósito deste documento**  
Este arquivo define as **regras obrigatórias** que toda IA, desenvolvedor ou sistema automatizado **DEVE seguir antes de gerar, alterar ou revisar qualquer código** neste projeto.  
O objetivo é garantir **excelência técnica**, **segurança**, **clareza**, **escalabilidade** e **manutenibilidade de longo prazo**.

---

# 🧠 PRINCÍPIOS FUNDAMENTAIS (NÍVEL CIÊNCIA DA COMPUTAÇÃO)

## 1. Clareza é prioridade absoluta
- Código é lido **muito mais vezes** do que é escrito.
- Se um trecho exige explicação verbal longa → está mal escrito.
- Soluções simples são preferíveis às complexas.

## 2. Código é um produto de engenharia
- Deve ser previsível
- Deve ser confiável
- Deve ser verificável
- Deve ser sustentável ao longo dos anos

## 3. Determinismo e previsibilidade
- Mesmo input → mesmo output
- Nada de estados ocultos
- Nada de efeitos colaterais inesperados

## 4. Pensamento computacional obrigatório
Todo código deve demonstrar:
- Decomposição correta do problema
- Abstração adequada
- Algoritmos explícitos
- Estruturas de dados apropriadas

---

# 🧱 FUNDAMENTOS DA PROGRAMAÇÃO (OBRIGATÓRIO)

## Tipos de Dados
- Usar o tipo **mais restritivo possível**
- Evitar tipos genéricos (`any`, `object`, `var`)
- Tipagem explícita sempre que a linguagem permitir
- Validar entradas externas

## Estruturas de Controle
- Evitar aninhamentos profundos
- Preferir `early return`
- Fluxos claros e lineares

## Estruturas de Dados
Escolher conscientemente:
- Lista → ordem importa
- Set → unicidade
- Map/Dicionário → acesso rápido por chave
- Pilha → LIFO
- Fila → FIFO
- Árvore → hierarquia
- Grafo → relações complexas

> ❗ Estrutura errada = desperdício de performance e clareza.

---

# 🧩 PARADIGMAS DE PROGRAMAÇÃO

## Imperativo
- Fluxo claro
- Controle explícito
- Evitar mutações desnecessárias

## Orientado a Objetos (POO Avançado)
- Abstração correta
- Encapsulamento real (não apenas sintático)
- Herança apenas quando existe relação **“é um”**
- Polimorfismo para eliminar condicionais excessivas

> Preferir **composição > herança**.

---

# 🧪 PRINCÍPIOS S.O.L.I.D (OBRIGATÓRIO)

- **S**ingle Responsibility  
- **O**pen / Closed  
- **L**iskov Substitution  
- **I**nterface Segregation  
- **D**ependency Inversion  

> Código que viola SOLID **não deve ser aceito**.

---

# 🏗️ DESIGN PATTERNS

## Regras de uso
- Design Patterns **resolvem problemas**, não são enfeite
- Nunca aplicar Pattern sem justificar o motivo
- Evitar overengineering

### Categorias
- Criacionais (Factory, Builder)
- Estruturais (Adapter, Facade, Decorator)
- Comportamentais (Strategy, Observer, Command)

---

# 📦 ORGANIZAÇÃO E MODULARIZAÇÃO

- Separação clara de responsabilidades
- Pastas semânticas
- Código desacoplado
- Alta coesão, baixo acoplamento
- Dependências explícitas

---

# 🌐 FRONTEND – REGRAS

## Arquitetura
- Separar:
  - UI
  - Estado
  - Lógica de negócio
  - Comunicação com APIs

## Código
- Componentes pequenos e reutilizáveis
- Nenhuma lógica complexa na camada de apresentação
- Tratamento de erros visível ao usuário

## Segurança
- Nunca confiar em dados do cliente
- Sanitização de inputs
- Proteção contra XSS, CSRF
- Nenhuma chave ou segredo no frontend

---

# 🧠 BACKEND – REGRAS

## Arquitetura em camadas
- Controller → Service → Domain → Repository
- Controllers não contêm lógica de negócio
- Services não acessam diretamente o banco

## APIs
- RESTful
- Verbos HTTP corretos
- Status codes corretos
- Versionamento obrigatório

## Banco de Dados
- Modelagem correta
- Normalização
- Índices bem planejados
- Nunca concatenar SQL manualmente

---

# 🔐 CIBERSEGURANÇA – REGRAS CRÍTICAS

## Princípios
- Zero Trust
- Defense in Depth
- Least Privilege

## Regras obrigatórias
- Senhas sempre com hash forte (bcrypt, argon2)
- Nunca armazenar dados sensíveis em texto puro
- Validação em todas as camadas
- Logs sem informações sensíveis
- Rate limiting
- Autenticação ≠ Autorização

## Criptografia
- Nunca criar algoritmo próprio
- Usar bibliotecas consolidadas
- Chaves fora do código (env, vault)

---

# ⚙️ SISTEMAS, LINUX E INFRA

- Entender processos vs threads
- Concorrência segura
- Gerenciamento de memória consciente
- Permissões mínimas necessárias
- Scripts idempotentes

---

# 🧬 FULLSTACK – REGRAS

- Contrato bem definido entre frontend e backend
- Tipagem compartilhada quando possível
- Tratamento de erros consistente
- Observabilidade (logs, métricas, traces)

---

# 🧪 TESTES (OBRIGATÓRIO)

- Testes unitários
- Testes de integração
- Testes de segurança
- Código sem testes é código incompleto

---

# 📈 PERFORMANCE E ESCALABILIDADE

- Analisar complexidade (Big-O)
- Evitar loops desnecessários
- Cache quando apropriado
- Não otimizar prematuramente
- Escalar com dados, não com achismos

---

# 📝 COMENTÁRIOS PROFISSIONAIS (REGRA OBRIGATÓRIA)

## Princípios para comentários
- Comentários explicam **o porquê**, não o óbvio
- Código bem escrito reduz necessidade de comentários ruins
- Comentários devem ser:
  - Claros
  - Objetivos
  - Atualizados

## Onde comentar
- Lógica complexa
- Decisões arquiteturais
- Algoritmos não triviais
- Regras de negócio importantes
- Pontos críticos de segurança

## Proibições
- Comentários redundantes
- Comentários desatualizados
- Comentários vagos (“gambiarra”, “funciona assim mesmo”)

---

# 🚨 REGRA FINAL (ABSOLUTA)

> **Se o código não for:**
> - Legível  
> - Seguro  
> - Bem comentado  
> - Testável  
> - Escalável  
> - Manutenível  

👉 **Ele deve ser reescrito sem exceções.**

---

# 🧠 NOTA FINAL

Este documento deve ser:
- Consultado antes de escrever código
- Usado como checklist de revisão
- Atualizado conforme o projeto evolui

Código não é apenas funcional.  
Código é **engenharia, ciência e responsabilidade**.
