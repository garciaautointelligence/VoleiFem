# Plano de melhorias — Campeonato dos Bichos AABB

**Projeto:** Campeonato dos Bichos — Torneio Interno AABB  
**Site atual:** https://camp-fem-volei-aabb.vercel.app/  
**Tipo de documento:** Plano de implementação  
**Status:** Pronto para execução  
**Prioridade geral:** Alta para consistência dos dados e experiência mobile

## 1. Objetivo

Evoluir o site atual de uma página visual de classificação e agenda para uma experiência completa de acompanhamento do campeonato. O resultado esperado é que atletas, organização e torcedores consigam entender rapidamente a situação da competição, consultar resultados, identificar os próximos jogos e compartilhar as informações com facilidade.

A implementação deve preservar a identidade visual existente: fundo escuro, detalhes dourados, ilustração temática de animais e linguagem descontraída relacionada ao vôlei feminino.

## 2. Situação atual

O site apresenta o título do campeonato, a quantidade de jogos disputados, uma tabela de classificação com cinco equipes e uma agenda com partidas da fase de grupos, semifinais, disputa de terceiro lugar e final.

A estrutura visual está bem organizada e possui boa identidade. Entretanto, a página aparenta ser predominantemente estática, sem controles interativos, histórico de resultados, placares detalhados, compartilhamento ou informações completas sobre as datas.

Também deve ser validada a consistência entre o indicador “6/10 jogos disputados” e a quantidade de partidas exibidas na agenda. Caso o total de dez considere somente uma etapa específica da competição, isso precisa ser explicado ao usuário.

## 3. Backlog priorizado

### P0 — Correções essenciais

Estas tarefas devem ser executadas antes da publicação da próxima versão, pois afetam a compreensão e a confiança nos dados.

| ID | Tarefa | Resultado esperado | Critério de aceite | Status |
|---|---|---|---|---|
| P0-01 | Exibir data completa nos jogos | Cada partida mostra dia, mês, ano e, se possível, dia da semana. | Nenhum jogo aparece apenas como “11”, “18”, “25” ou “02”. | [x] |
| P0-02 | Validar o contador de partidas | O indicador de progresso corresponde ao total real de jogos e à etapa correta. | O texto explica claramente se a contagem considera fase de grupos, todo o campeonato ou jogos concluídos. | [x] |
| P0-03 | Conferir a regra de pontuação | A regra de classificação fica clara para qualquer visitante. | O site informa como os pontos são atribuídos e como empates são resolvidos. | [x] |
| P0-04 | Garantir consistência da classificação | Vitórias, derrotas, sets e pontos são calculados a partir dos mesmos resultados. | Alterar um placar atualiza automaticamente a tabela sem divergências. | [x] |
| P0-05 | Revisar datas da fase final | Semifinais, terceiro lugar e final ficam em ordem cronológica e com ano explícito. | Não há risco de interpretar a final como uma data anterior às semifinais. | [x] |

### P1 — Melhorias de alto impacto

Estas tarefas aumentam significativamente a utilidade do site para o público.

| ID | Tarefa | Resultado esperado | Critério de aceite | Status |
|---|---|---|---|---|
| P1-01 | Criar seção “Últimos resultados” | O visitante consegue consultar partidas já realizadas. | A seção mostra adversárias, placar, sets e vencedor. | [ ] |
| P1-02 | Adicionar placares detalhados | Cada resultado pode mostrar os sets, por exemplo, 25×18, 21×25 e 15×10. | O placar final e os sets são compreensíveis em desktop e celular. | [ ] |
| P1-03 | Adicionar resumo estatístico | O topo exibe jogos disputados, jogos restantes, líder, maior saldo e próxima partida. | O visitante entende o estado do torneio em poucos segundos. | [x] |
| P1-04 | Criar chaveamento visual | Semifinais, disputa de terceiro lugar e final são exibidas em formato de bracket. | O usuário entende quem enfrenta quem e como os vencedores avançam. | [x] |
| P1-05 | Adicionar compartilhamento | O usuário pode compartilhar o campeonato por WhatsApp, copiar o link ou usar o compartilhamento nativo. | O link compartilhado contém título, imagem e descrição corretos. | [ ] |
| P1-07 | Disponibilizar regulamento oficial | O visitante acessa o documento completo do campeonato sem precisar solicitar informações à organização. | Existe um link funcional para o PDF oficial no rodapé. | [x] |

### P2 — Responsividade e acessibilidade

Estas tarefas devem ser realizadas antes de divulgar amplamente o site.

| ID | Tarefa | Resultado esperado | Critério de aceite | Status |
|---|---|---|---|---|
| P2-01 | Adaptar a tabela para celular | A tabela não fica ilegível em telas pequenas. | Em 320 px e 375 px, a classificação permanece utilizável sem quebra visual. | [x] |
| P2-02 | Criar versão resumida da classificação no mobile | O celular mostra posição, equipe, jogos e pontos; detalhes ficam disponíveis sob demanda. | As estatísticas adicionais podem ser consultadas sem prejudicar a leitura. | [x] |
| P2-03 | Aumentar contraste dos metadados | Fase, ginásio e informações secundárias ficam mais legíveis. | Textos pequenos não desaparecem contra o fundo escuro. | [ ] |
| P2-04 | Garantir navegação por teclado | Todos os controles podem ser acessados por teclado. | O foco é visível e a ordem de navegação é lógica. | [x] |
| P2-05 | Melhorar textos alternativos | Ícones e imagens possuem descrição quando necessário. | Um leitor de tela identifica a equipe pelo nome, não somente pelo emoji ou imagem. | [x] |
| P2-06 | Usar estrutura semântica correta | A classificação é reconhecida como tabela e a agenda como lista de eventos. | Cabeçalhos e relacionamentos entre células estão definidos corretamente. | [x] |

### P3 — Recursos para organização e manutenção

Estas tarefas tornam o projeto sustentável quando houver novos campeonatos ou alterações de última hora.

| ID | Tarefa | Resultado esperado | Critério de aceite | Status |
|---|---|---|---|---|
| P3-01 | Separar dados do componente visual | Equipes, partidas, placares e regras ficam em uma fonte de dados estruturada. | Atualizar uma partida não exige alterar vários trechos da interface. | [ ] |
| P3-02 | Criar painel administrativo | A organização consegue cadastrar partidas e resultados. | Um usuário autorizado pode editar dados sem modificar o código. | [ ] |
| P3-03 | Adicionar data da última atualização | O visitante sabe quando os dados foram atualizados. | A página mostra data e horário da atualização mais recente. | [ ] |
| P3-04 | Validar dados antes de publicar | O sistema impede placares incompletos ou datas inválidas. | Não é possível salvar partidas com equipes inexistentes ou resultados inconsistentes. | [ ] |
| P3-05 | Permitir reutilização para novos torneios | A estrutura pode receber novo nome, equipes, regras e agenda. | Um novo campeonato pode ser criado sem duplicar todo o projeto. | [ ] |

**Escalações:** a página lê as abas `Time` ou `Times`. No formato atual, a primeira linha contém os nomes das equipes e as linhas seguintes contêm as atletas. O nome de cada equipe na classificação abre um popup com emoji, cor do animal, quadra visual e pontos identificados. Uma foto real da quadra poderá substituir o fundo visual quando for disponibilizada.

### P4 — Refinamentos visuais e divulgação

Estas tarefas podem ser executadas após a estabilização dos dados e da experiência principal.

| ID | Tarefa | Resultado esperado | Critério de aceite | Status |
|---|---|---|---|---|
| P4-01 | Inserir logotipo oficial da AABB | O site reforça a identidade institucional. | O logo é nítido, possui boa proporção e não compete com o título. | [ ] |
| P4-02 | Informar localização do ginásio | O visitante consegue localizar o evento. | O rodapé possui mapa incorporado e link para rota no Google Maps. | [x] |
| P4-03 | Criar imagem de compartilhamento | O link aparece bem representado em WhatsApp e redes sociais. | Título, descrição e imagem são exibidos corretamente em pré-visualizadores. | [ ] |
| P4-04 | Otimizar a imagem principal | O carregamento inicial fica mais rápido. | A imagem do hero usa WebP ou AVIF, dimensões adequadas e compressão equilibrada. | [ ] |
| P4-05 | Adicionar microanimações discretas | A interface ganha dinamismo sem prejudicar a leitura. | Animações respeitam a preferência `prefers-reduced-motion`. | [ ] |

## 4. Nova estrutura recomendada para a página

A ordem abaixo prioriza as informações mais importantes para quem acessa pelo celular ou chega ao site por um link compartilhado.

1. **Cabeçalho:** logo AABB, nome do campeonato e ações de compartilhar.
2. **Hero:** título, modalidade, número de equipes, progresso do torneio e data da última atualização.
3. **Resumo rápido:** líder, próxima partida, jogos realizados e jogos restantes.
4. **Próximo jogo:** card maior com data completa, horário, equipes e local.
5. **Classificação:** tabela completa no desktop e versão resumida no mobile.
6. **Últimos resultados:** placares e sets das partidas encerradas.
7. **Próximos jogos:** agenda completa agrupada por data e fase.
8. **Chaveamento:** semifinais, terceiro lugar e final.
9. **Regulamento:** link para o documento oficial completo.
10. **Rodapé:** AABB, mapa do ginásio, contato da organização e última atualização.

**Atualização de estrutura:** a página já segue a ordem classificação, próximos jogos, últimos resultados e chaveamento.

**Atualização de datas:** os próximos jogos exibem datas curtas (`DD/mes`), mantendo a data completa acessível no próprio card.

## 5. Modelo de dados sugerido

A interface deve ser alimentada por dados estruturados semelhantes ao exemplo abaixo. Os nomes dos campos podem ser adaptados ao projeto existente.

```ts
type Team = {
  id: string;
  name: string;
  animal: string;
  color: string;
  logoUrl?: string;
};

type Match = {
  id: string;
  phase: 'group' | 'semifinal' | 'third_place' | 'final';
  date: string;
  startTime: string;
  venue: string;
  homeTeamId?: string;
  awayTeamId?: string;
  homeLabel?: string;
  awayLabel?: string;
  status: 'scheduled' | 'live' | 'finished';
  homeSets?: number;
  awaySets?: number;
  setScores?: string[];
};
```

A classificação deve ser derivada dos resultados, sempre que possível. Dessa forma, a aplicação evita que alguém atualize manualmente a tabela e esqueça de ajustar vitórias, derrotas, sets ou saldo.

## 6. Critérios gerais de qualidade

A nova versão será considerada pronta quando atender aos seguintes critérios:

- O usuário entende o campeonato e a situação atual sem precisar conhecer as regras previamente.
- Todas as datas possuem mês e ano.
- O contador de jogos é matematicamente compatível com os resultados e a agenda.
- A tabela funciona em desktop e em telas pequenas.
- Os resultados apresentam placar final e sets quando disponíveis.
- O próximo jogo é claramente identificável.
- É possível compartilhar o campeonato.
- O site informa a última atualização dos dados.
- A navegação por teclado funciona nos controles disponíveis.
- O conteúdo possui contraste, textos alternativos e semântica adequados.
- A imagem principal não prejudica o tempo de carregamento.

## 7. Plano de execução sugerido

### Etapa 1 — Correção dos dados

Revisar contador de partidas, regras, classificação e nomenclatura das fases. Nesta etapa, não é necessário alterar profundamente o visual. O objetivo é eliminar inconsistências e definir uma fonte única de verdade para os dados.

### Etapa 2 — Resultados e resumo

Adicionar placares, sets, últimos resultados e cards de estatísticas. Essa etapa deve entregar o maior ganho funcional com relativamente pouca alteração estrutural.

### Etapa 3 — Mobile e acessibilidade

Testar o layout em diferentes larguras, adaptar a tabela, melhorar contraste, configurar textos alternativos e validar navegação por teclado.

### Etapa 4 — Compartilhamento

Adicionar compartilhamento nativo, cópia de link e metadados para redes sociais.

### Etapa 5 — Chaveamento e regulamento

Criar o bracket visual e disponibilizar o regulamento oficial em PDF no rodapé.

### Etapa 6 — Administração e reutilização

Separar os dados da interface, criar um fluxo seguro de atualização e preparar a estrutura para futuros torneios.

## 8. Checklist de publicação

### Dados

- [ ] Nome e logo da competição revisados.
- [ ] Equipes cadastradas corretamente.
- [ ] Datas com dia, mês e ano.
- [ ] Horários e local conferidos.
- [ ] Contador de partidas validado.
- [ ] Classificação conferida com os resultados.
- [ ] Regras de pontuação e desempate revisadas.

### Interface

- [ ] Próximo jogo em destaque.
- [ ] Últimos resultados disponíveis.
- [ ] Chaveamento da fase final compreensível.
- [ ] Botão de compartilhamento funcionando.
- [ ] Rodapé com contato e localização.

### Qualidade

- [ ] Teste em celular pequeno.
- [ ] Teste em tablet.
- [ ] Teste em desktop.
- [ ] Teste de teclado.
- [ ] Teste com leitor de tela.
- [ ] Verificação de contraste.
- [ ] Verificação de carregamento da imagem principal.
- [ ] Verificação de título, descrição e imagem de compartilhamento.

## 9. Recomendação final

A primeira entrega deve concentrar-se em **datas completas, consistência do contador, explicação das regras, resultados com placares e adaptação mobile**. Esses itens corrigem os principais riscos do site sem descaracterizar o design atual. Depois, o compartilhamento e o chaveamento visual podem transformar a página em uma ferramenta realmente útil durante todo o campeonato.

## Referência

[1]: https://camp-fem-volei-aabb.vercel.app/ — Campeonato dos Bichos — AABB, página revisada em 03/09/2026.
