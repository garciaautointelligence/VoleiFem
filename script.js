// ============================================================
// CAMPEONATO DOS BICHOS — AABB
// Leitura da planilha Excel local
// ============================================================

const EXCEL_URL =
    "./torneio_interno_planilha_preenchivel.xlsx";

let jogos = [];
let classificacao = [];
let escalacoesPorTime = {};

// ============================================================
// CONFIGURAÇÃO DOS TIMES
// ============================================================

const TIMES = {

    "Girafa": {
        classe: "girafa",
        emoji: "🦒"
    },

    "Tigre": {
        classe: "tigre",
        emoji: "🐯"
    },

    "Onça": {
        classe: "onca",
        emoji: "🐆"
    },

    "Zebra": {
        classe: "zebra",
        emoji: "🦓"
    },

    "Dálmata": {
        classe: "dalmata",
        emoji: "🐕"
    }

};


// ============================================================
// NORMALIZA TEXTO
// ============================================================

function texto(valor) {

    if (valor === undefined || valor === null) {
        return "";
    }

    return String(valor).trim().replace(/\s+/g, " ");

}


// ============================================================
// CONVERTE PARA NÚMERO
// ============================================================

function numero(valor) {

    if (valor === undefined || valor === null || valor === "") {
        return 0;
    }

    const n = Number(String(valor).replace(",", ".").trim());

    return Number.isFinite(n) ? n : 0;

}


// ============================================================
// FORMATAR DATA (tentativa robusta)
// Retorna "dia-da-semana, DD de mês de YYYY" quando possível
// ============================================================

function formatarData(valor) {

    if (valor === undefined || valor === null || valor === "") {
        return "";
    }

    const meses = [
        "janeiro",
        "fevereiro",
        "março",
        "abril",
        "maio",
        "junho",
        "julho",
        "agosto",
        "setembro",
        "outubro",
        "novembro",
        "dezembro"
    ];

    const diasSemana = [
        "domingo",
        "segunda-feira",
        "terça-feira",
        "quarta-feira",
        "quinta-feira",
        "sexta-feira",
        "sábado"
    ];

    const dataObj = obterDataObjeto(valor);

    if (dataObj instanceof Date && !isNaN(dataObj.getTime())) {

        const dia = String(dataObj.getDate()).padStart(2, "0");
        const mes = meses[dataObj.getMonth()];
        const ano = dataObj.getFullYear();
        const diaNome = diasSemana[dataObj.getDay()];

        return `${diaNome}, ${dia} de ${mes} de ${ano}`;

    }

    // Fallback: tenta extrair dia e mês de textos como "11/set" ou "11/09/2026"
    const data = texto(valor);

    const numeroData = data.match(/^(\d{1,2})[\/\-](\d{1,2})(?:[\/\-](\d{2,4}))?$/);

    if (numeroData) {

        const dia = numeroData[1].padStart(2, "0");
        const numeroMes = Number(numeroData[2]);
        const mes = meses[numeroMes - 1];
        const ano = numeroData[3] ? (Number(numeroData[3]) < 100 ? 2000 + Number(numeroData[3]) : Number(numeroData[3])) : new Date().getFullYear();

        if (mes) {
            return `provável, ${dia} de ${mes} de ${ano}`;
        }

    }

    // Texto com mês escrito
    const textoData = data.match(/^(\d{1,2})\s*[\/\-]?\s*([a-zç]+)/i);

    if (textoData) {

        const dia = textoData[1].padStart(2, "0");
        const nomeMes = textoData[2].toLowerCase();
        const indiceMes = meses.findIndex(mes => mes.startsWith(nomeMes.substring(0, 3)));

        if (indiceMes >= 0) {
            return `provável, ${dia} de ${meses[indiceMes]} de ${new Date().getFullYear()}`;
        }

    }

    return data;
}

function formatarDataCurta(dataObjeto, valorOriginal) {

    const meses = [
        "jan", "fev", "mar", "abr", "mai", "jun",
        "jul", "ago", "set", "out", "nov", "dez"
    ];

    const data = dataObjeto || obterDataObjeto(valorOriginal);

    if (!(data instanceof Date) || isNaN(data.getTime())) {
        return texto(valorOriginal);
    }

    return `${String(data.getDate()).padStart(2, "0")}/${meses[data.getMonth()]}`;
}

// ============================================================
// CONVERTE QUALQUER DATA DO EXCEL
// PARA UM OBJETO Date REAL
// ============================================================

function obterDataObjeto(valor) {

    if (
        valor instanceof Date &&
        !isNaN(valor.getTime())
    ) {

        return new Date(valor);

    }

    // ========================================================
    // SERIAL DO EXCEL
    // ========================================================

    if (
        typeof valor === "number" &&
        Number.isFinite(valor)
    ) {

        const data =
            new Date(
                Date.UTC(
                    1899,
                    11,
                    30
                ) +
                valor * 86400000
            );

        return new Date(
            data.getUTCFullYear(),
            data.getUTCMonth(),
            data.getUTCDate()
        );

    }

    // ========================================================
    // TEXTO
    // ========================================================

    const valorTexto =
        texto(valor);

    // ========================================================
    // DD/MM/AAAA
    // DD/MM/AA
    // DD-MM-AAAA
    // ========================================================

    const partes =
        valorTexto.match(
            /^(\d{1,2})[\/-](\d{1,2})(?:[\/-](\d{2,4}))?$/
        );

    if (partes) {

        const dia =
            Number(partes[1]);

        const mes =
            Number(partes[2]);

        let ano =
            partes[3]
                ? Number(partes[3])
                : new Date().getFullYear();

        if (ano < 100) {
            ano += 2000;
        }

        const data =
            new Date(
                ano,
                mes - 1,
                dia
            );

        if (
            !isNaN(data.getTime())
        ) {

            return data;

        }

    }

    // ========================================================
    // TEXTO COM MÊS
    // Ex.: 11/set
    // Ex.: 11/setembro
    // ========================================================

    const meses = {

        jan: 0,
        fev: 1,
        mar: 2,
        abr: 3,
        mai: 4,
        jun: 5,
        jul: 6,
        ago: 7,
        set: 8,
        out: 9,
        nov: 10,
        dez: 11

    };

    const textoData =
        valorTexto.match(
            /^(\d{1,2})\s*[\/-]?\s*([a-zç]+)$/i
        );

    if (textoData) {

        const dia =
            Number(textoData[1]);

        const mesTexto =
            textoData[2]
                .toLowerCase()
                .substring(0, 3);

        if (
            meses[mesTexto] !== undefined
        ) {

            return new Date(
                new Date().getFullYear(),
                meses[mesTexto],
                dia
            );

        }

    }

    return null;

}

// ============================================================
// CONVERTE HORA PARA MINUTOS
//
// 20h30 → 1230
// 21h30 → 1290
// ============================================================

function obterMinutosHora(hora) {

    if (!hora) {
        return 0;
    }

    const valor =
        texto(hora)
            .toLowerCase()
            .replace("h", ":");

    const partes =
        valor.split(":");

    const horas =
        Number(partes[0]) || 0;

    const minutos =
        Number(partes[1]) || 0;

    return (
        horas * 60 +
        minutos
    );

}

// ============================================================
// ENCONTRAR ABA
// ============================================================

function encontrarAba(
    workbook,
    nome
) {

    const encontrada =
        workbook.SheetNames.find(
            aba =>
                aba.trim().toLowerCase() ===
                nome.trim().toLowerCase()
        );

    if (!encontrada) {

        throw new Error(
            `A aba "${nome}" não foi encontrada.`
        );

    }

    return workbook.Sheets[encontrada];

}

// ============================================================
// LER TABELA DE JOGOS
//
// A = Data
// B = Horário
// C = Time A
// D = Placar A
// E = X
// F = Placar B
// G = Time B
// ============================================================

function lerJogos(worksheet) {

    const linhas =
        XLSX.utils.sheet_to_json(
            worksheet,
            {
                header: 1,
                defval: "",
                raw: true
            }
        );

    const resultado = [];

    let faseAtual =
        "Fase de grupos";

    for (const linha of linhas) {

        if (
            !linha ||
            linha.length < 7
        ) {
            continue;
        }

        const valorData =
            linha[0];

        const primeiraColuna =
            texto(valorData);

        const hora =
            texto(linha[1]);

        const casa =
            texto(linha[2]);

        const placarCasa =
            texto(linha[3]);

        const placarFora =
            texto(linha[5]);

        const fora =
            texto(linha[6]);

        // ====================================================
        // IDENTIFICAÇÃO DAS FASES
        // ====================================================

        const marcador =
            primeiraColuna
                .toUpperCase()
                .normalize("NFD")
                .replace(
                    /[\u0300-\u036f]/g,
                    ""
                );

        if (
            marcador === "SEMIFINAIS"
        ) {

            faseAtual =
                "Semifinais";

            continue;

        }

        if (
            marcador === "DISPUTA 3º LUGAR" ||
            marcador === "DISPUTA 3O LUGAR" ||
            marcador === "DISPUTA 3 LUGAR"
        ) {

            faseAtual =
                "Disputa de 3º lugar";

            continue;

        }

        if (
            marcador === "FINAL"
        ) {

            faseAtual =
                "Final";

            continue;

        }

        // ====================================================
        // IGNORA CABEÇALHO
        // ====================================================

        if (
            primeiraColuna
                .toLowerCase() === "data" ||
            casa
                .toLowerCase() === "time a"
        ) {

            continue;

        }

        // ====================================================
        // PRECISA TER DOIS TIMES
        // ====================================================

        if (
            !casa ||
            !fora
        ) {

            continue;

        }

        // ====================================================
        // DATA DE EXIBIÇÃO E DATA REAL
        // ====================================================

        const dataObjeto =
            obterDataObjeto(
                valorData
            );

        const dataFormatada =
            formatarData(
                valorData
            );

        const diaNumero = dataObjeto
            ? String(dataObjeto.getDate()).padStart(2, "0")
            : (String(dataFormatada).match(/^(\d{1,2})/) || ["", ""])[1].padStart(2, "0");

        // ====================================================
        // REGISTRA JOGO
        // ====================================================

        resultado.push({

            data: dataFormatada,

            dataObjeto,

            dia: diaNumero,

            hora,

            casa,

            fora,

            placarCasa,

            placarFora,

            fase: faseAtual,

            faseGrupos: faseAtual === "Fase de grupos"

        });

    }

    return resultado;

}

// ============================================================
// LER CLASSIFICAÇÃO
//
// A9:I14
//
// A = Pos.
// B = Time
// C = Jogos
// D = Vitórias
// E = Derrotas
// F = Pontos
// G = Sets Pró
// H = Sets Contra
// I = Saldo
// ============================================================

function lerClassificacao(worksheet) {

    const linhas =
        XLSX.utils.sheet_to_json(
            worksheet,
            {
                header: 1,
                range: "A9:I14",
                defval: "",
                raw: true
            }
        );

    console.log(
        "Classificação A9:I14:",
        linhas
    );

    const resultado = [];

    // Linha 0 = cabeçalho
    // Linhas 1 a 5 = times

    for (
        let i = 1;
        i < linhas.length;
        i++
    ) {

        const linha =
            linhas[i];

        if (
            !linha ||
            !linha[1]
        ) {
            continue;
        }

        const nome =
            texto(linha[1]);

        const configuracao =
            TIMES[nome] || {};

        resultado.push({

            pos:
                numero(linha[0]),

            nome,

            jogos:
                numero(linha[2]),

            vitorias:
                numero(linha[3]),

            derrotas:
                numero(linha[4]),

            pontos:
                numero(linha[5]),

            setsPro:
                numero(linha[6]),

            setsContra:
                numero(linha[7]),

            saldo:
                numero(linha[8]),

            pattern:
                configuracao.classe || "",

            emoji:
                configuracao.emoji || "🏐"

        });

    }

    return resultado;

}

function lerTimes(worksheet) {

    if (!worksheet) return [];

    const linhas = XLSX.utils.sheet_to_json(worksheet, {
        header: 1,
        defval: "",
        raw: true
    });

    const primeiraLinha = linhas[0] || [];
    const cabecalho = primeiraLinha.map(valor =>
        texto(valor).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    );
    const indiceTime = cabecalho.findIndex(valor =>
        ["time", "equipe"].includes(valor)
    );
    const indiceNome = cabecalho.findIndex(valor =>
        ["nome", "jogadora", "jogador", "atleta"].includes(valor)
    );
    const indicePosicao = cabecalho.findIndex(valor =>
        ["posicao", "posicao em quadra"].includes(valor)
    );

    const formatoTitularReserva =
        cabecalho[0] === "t / r" || cabecalho[0] === "t/r";

    if (formatoTitularReserva) {
        return primeiraLinha.slice(1)
            .map((valor, coluna) => ({
                time: texto(valor),
                coluna: coluna + 1
            }))
            .filter(item => TIMES[item.time])
            .flatMap(item => linhas.slice(1)
                .map(linha => ({
                    time: item.time,
                    nome: texto(linha[item.coluna]),
                    posicao: "",
                    status: texto(linha[0]).toUpperCase()
                }))
            )
            .filter(jogadora => jogadora.nome);
    }

    if (indiceTime < 0 || indiceNome < 0) {
        return primeiraLinha
            .map((valor, indice) => ({
                time: texto(valor),
                coluna: indice
            }))
            .filter(item => TIMES[item.time])
            .flatMap(item => linhas.slice(1)
                .map(linha => ({
                    time: item.time,
                    nome: texto(linha[item.coluna]),
                    posicao: "",
                    status: ""
                }))
            )
            .filter(jogadora => jogadora.nome);
    }

    return linhas.slice(1)
        .map(linha => ({
            time: texto(linha[indiceTime]),
            nome: texto(linha[indiceNome]),
            posicao: indicePosicao >= 0 ? texto(linha[indicePosicao]) : "",
            status: ""
        }))
        .filter(jogadora => jogadora.time && jogadora.nome);

}

function renderEscalacoes(times) {

    escalacoesPorTime = times.reduce((grupos, jogadora) => {
        (grupos[jogadora.time] ||= []).push(jogadora);
        return grupos;
    }, {});

}

function abrirEscalacao(nomeTime) {

    const jogadoras = escalacoesPorTime[nomeTime];
    const modal = document.getElementById("escalação-modal");
    const titulo = document.getElementById("escalação-modal-titulo");
    const quadra = document.getElementById("escalação-quadra");
    const lista = document.getElementById("escalação-lista");
    const reservas = document.getElementById("escalação-reservas");
    const listaReservas = reservas?.querySelector(".lista-jogadoras");

    if (!jogadoras || !modal || !titulo || !quadra || !lista) return;

    const configuracao = TIMES[nomeTime] || {};
    const possuiStatus = jogadoras.some(jogadora =>
        ["T", "R"].includes(jogadora.status)
    );
    const titulares = possuiStatus
        ? jogadoras.filter(jogadora => jogadora.status === "T")
        : jogadoras.slice(0, 6);
    const jogadorasReservas = possuiStatus
        ? jogadoras.filter(jogadora => jogadora.status === "R")
        : jogadoras.slice(6);
    titulo.innerHTML = `<span class="swatch ${configuracao.classe || ""}"></span>${nomeTime} ${configuracao.emoji || "🏐"}`;
    quadra.className = `quadra ${configuracao.classe || ""}`;
    quadra.setAttribute("aria-label", `Escalação de ${nomeTime}`);
    quadra.innerHTML = `<span class="rede" aria-hidden="true"></span>${titulares.map((jogadora, indice) => `
        <div class="jogadora-ponto ponto-${(indice % 6) + 1}" title="${jogadora.nome}"><span>${jogadora.nome}</span></div>
    `).join("")}`;
    lista.innerHTML = titulares.map(jogadora =>
        `<li>${jogadora.nome}${jogadora.posicao ? ` <small>${jogadora.posicao}</small>` : ""}</li>`
    ).join("");
    if (reservas && listaReservas) {
        reservas.hidden = jogadorasReservas.length === 0;
        listaReservas.innerHTML = jogadorasReservas.map(jogadora =>
            `<li>${jogadora.nome}${jogadora.posicao ? ` <small>${jogadora.posicao}</small>` : ""}</li>`
        ).join("");
    }
    modal.hidden = false;
    document.querySelector(".escalação-modal-fechar").focus();

}

function fecharEscalacao() {
    const modal = document.getElementById("escalação-modal");
    if (modal) modal.hidden = true;
}

function configurarModalEscalacao() {
    document.querySelectorAll("[data-fechar-escalação]").forEach(elemento =>
        elemento.addEventListener("click", fecharEscalacao)
    );
    document.addEventListener("keydown", evento => {
        if (evento.key === "Escape") fecharEscalacao();
    });

}

function calcularClassificacao(jogosDaCompeticao) {

    const tabela = Object.keys(TIMES).map(nome => ({
        nome,
        jogos: 0,
        vitorias: 0,
        derrotas: 0,
        pontos: 0,
        setsPro: 0,
        setsContra: 0
    }));

    const porNome = new Map(
        tabela.map(time => [time.nome, time])
    );

    jogosDaCompeticao
        .filter(jogo =>
            jogo.faseGrupos &&
            jogo.placarCasa !== "" &&
            jogo.placarFora !== ""
        )
        .forEach(jogo => {

            const casa = porNome.get(jogo.casa);
            const fora = porNome.get(jogo.fora);

            if (!casa || !fora) {
                return;
            }

            const setsCasa = numero(jogo.placarCasa);
            const setsFora = numero(jogo.placarFora);

            casa.jogos += 1;
            fora.jogos += 1;
            casa.setsPro += setsCasa;
            casa.setsContra += setsFora;
            fora.setsPro += setsFora;
            fora.setsContra += setsCasa;
            casa.pontos += setsCasa;
            fora.pontos += setsFora;

            if (setsCasa > setsFora) {
                casa.vitorias += 1;
                fora.derrotas += 1;
            } else if (setsFora > setsCasa) {
                fora.vitorias += 1;
                casa.derrotas += 1;
            }

        });

    return tabela
        .map(time => ({
            ...time,
            saldo: time.setsPro - time.setsContra,
            pattern: TIMES[time.nome].classe,
            emoji: TIMES[time.nome].emoji
        }))
        .sort((a, b) =>
            b.pontos - a.pontos ||
            b.saldo - a.saldo ||
            b.setsPro - a.setsPro ||
            a.nome.localeCompare(b.nome, "pt-BR")
        )
        .map((time, indice) => ({
            ...time,
            pos: indice + 1
        }));

}

// ============================================================
// RENDERIZAR CLASSIFICAÇÃO
// ============================================================

function renderClassificacao() {

    const container =
        document.getElementById(
            "classificacao"
        );

    if (!container) {

        console.error(
            'Elemento "#classificacao" não encontrado.'
        );

        return;

    }

    container.innerHTML = "";

    // ========================================================
    // CABEÇALHO
    // ========================================================

    const cabecalho =
        document.createElement("div");

    cabecalho.className =
        "classificacao-header";

    cabecalho.setAttribute("role", "row");

    cabecalho.innerHTML = `

        <span>Pos.</span>

        <span>Time</span>

        <span>Jogos</span>

        <span>Vitórias</span>

        <span>Derrotas</span>

        <span>Pontos</span>

        <span>Sets Pró</span>

        <span>Sets Contra</span>

        <span>Saldo</span>

    `;

    cabecalho.querySelectorAll("span").forEach(celula => {
        celula.setAttribute("role", "columnheader");
    });

    container.appendChild(
        cabecalho
    );

    // ========================================================
    // TIMES
    // ========================================================

    classificacao.forEach(
        time => {

            const linha =
                document.createElement("div");

            linha.className =
                "classificacao-linha";

            linha.tabIndex = 0;
            linha.setAttribute("role", "button");
            linha.setAttribute("aria-expanded", "false");

            const saldoClasse =
                time.saldo >= 0
                    ? "positivo"
                    : "negativo";

            let saldoTexto;

            if (
                time.saldo > 0
            ) {

                saldoTexto =
                    `+${time.saldo}`;

            } else {

                saldoTexto =
                    `${time.saldo}`;

            }

            linha.innerHTML = `

                <span class="pos">
                    ${time.pos}º
                </span>

                <span class="nome">

                    <span class="swatch ${time.pattern}"></span>

                    <button class="nome-time-botao" type="button" data-time="${time.nome}" aria-label="Ver escalação de ${time.nome}">
                        ${time.nome}
                        <small>Ver escalação</small>
                    </button>

                </span>

                <span>
                    ${time.jogos}
                </span>

                <span>
                    ${time.vitorias}
                </span>

                <span>
                    ${time.derrotas}
                </span>

                <span class="pontos">
                    ${time.pontos}
                </span>

                <span>
                    ${time.setsPro}
                </span>

                <span>
                    ${time.setsContra}
                </span>

                <span class="saldo ${saldoClasse}">
                    ${saldoTexto}
                </span>

                <span class="classificacao-detalhes-mobile">
                    Vitórias: ${time.vitorias} · Derrotas: ${time.derrotas} ·
                    Sets: ${time.setsPro} pró / ${time.setsContra} contra
                </span>

            `;

            const alternarDetalhes = () => {
                const aberto = linha.classList.toggle("mostrar-detalhes");
                linha.setAttribute("aria-expanded", String(aberto));
            };

            linha.addEventListener("click", alternarDetalhes);
            linha.addEventListener("keydown", evento => {
                if (evento.key === "Enter" || evento.key === " ") {
                    evento.preventDefault();
                    alternarDetalhes();
                }
            });

            const botaoTime = linha.querySelector(".nome-time-botao");
            if (escalacoesPorTime[time.nome]) {
                botaoTime.addEventListener("click", evento => {
                    evento.stopPropagation();
                    abrirEscalacao(time.nome);
                });
            } else {
                botaoTime.disabled = true;
                botaoTime.removeAttribute("aria-label");
            }

            container.appendChild(
                linha
            );

            // =================================================
            // CORTE APÓS 4º COLOCADO
            // =================================================

            if (
                time.pos === 4
            ) {

                const corte =
                    document.createElement("div");

                corte.className =
                    "corte-linha";

                container.appendChild(
                    corte
                );

            }

        }
    );

    // ========================================================
    // CASO NÃO TENHA DADOS
    // ========================================================

    if (
        classificacao.length === 0
    ) {

        container.innerHTML = `

            <div style="
                padding: 24px;
                text-align: center;
                color: #8B8F98;
            ">

                Nenhuma classificação encontrada.

            </div>

        `;

    }

}

// ============================================================
// RENDERIZAR PRÓXIMOS JOGOS
// ============================================================

function renderJogos() {

    const container =
        document.getElementById(
            "jogos"
        );

    if (!container) {

        console.error(
            'Elemento "#jogos" não encontrado.'
        );

        return;

    }

    container.innerHTML = "";

    // ========================================================
    // SOMENTE JOGOS AINDA NÃO DISPUTADOS
    // ========================================================

    const proximos =
        jogos.filter(
            jogo =>
                jogo.placarCasa === "" ||
                jogo.placarFora === ""
        );

    // ========================================================
    // DATA DE HOJE
    // ========================================================

    const hoje =
        new Date();

    hoje.setHours(
        0,
        0,
        0,
        0
    );

    // ========================================================
    // SEPARA JOGOS COM DATA VÁLIDA
    // ========================================================

    const jogosComData =
        proximos.filter(
            jogo =>
                jogo.dataObjeto instanceof Date &&
                !isNaN(
                    jogo.dataObjeto.getTime()
                )
        );

    // ========================================================
    // ORDENA POR DATA E HORÁRIO
    // ========================================================

    proximos.sort(
        (a, b) => {

            const dataA =
                a.dataObjeto;

            const dataB =
                b.dataObjeto;

            if (
                !dataA &&
                !dataB
            ) {
                return 0;
            }

            if (!dataA) {
                return 1;
            }

            if (!dataB) {
                return -1;
            }

            const diferencaData =
                dataA.getTime() -
                dataB.getTime();

            if (
                diferencaData !== 0
            ) {

                return diferencaData;

            }

            return (
                obterMinutosHora(a.hora) -
                obterMinutosHora(b.hora)
            );

        }
    );

    // ========================================================
    // ENCONTRA O PRÓXIMO DIA
    // ========================================================

    let proximaDataTimestamp =
        null;

    // Jogos futuros ou de hoje

    const jogosFuturos =
        jogosComData.filter(
            jogo => {

                const data =
                    new Date(
                        jogo.dataObjeto
                    );

                data.setHours(
                    0,
                    0,
                    0,
                    0
                );

                return data >= hoje;

            }
        );

    if (
        jogosFuturos.length > 0
    ) {

        proximaDataTimestamp =
            Math.min(
                ...jogosFuturos.map(
                    jogo => {

                        const data =
                            new Date(
                                jogo.dataObjeto
                            );

                        data.setHours(
                            0,
                            0,
                            0,
                            0
                        );

                        return data.getTime();

                    }
                )
            );

    } else if (
        jogosComData.length > 0
    ) {

        // ====================================================
        // SE NÃO HOUVER MAIS JOGOS FUTUROS,
        // PEGA O PRIMEIRO JOGO NÃO DISPUTADO
        // ====================================================

        const data =
            new Date(
                jogosComData[0].dataObjeto
            );

        data.setHours(
            0,
            0,
            0,
            0
        );

        proximaDataTimestamp =
            data.getTime();

    }

    // ========================================================
    // LOG DE CONFERÊNCIA
    // ========================================================

    console.log(
        "================================="
    );

    console.log(
        "JOGOS NÃO DISPUTADOS"
    );

    console.table(
        proximos.map(
            jogo => ({

                dataTela:
                    jogo.data,

                dataReal:
                    jogo.dataObjeto,

                hora:
                    jogo.hora,

                casa:
                    jogo.casa,

                fora:
                    jogo.fora

            })
        )
    );

    console.log(
        "Hoje:",
        hoje
    );

    console.log(
        "Próxima data:",
        proximaDataTimestamp !== null
            ? new Date(
                proximaDataTimestamp
            )
            : "Nenhuma"
    );

    // ========================================================
    // RENDERIZAR CADA JOGO
    // ========================================================

    proximos.forEach(
        jogo => {

            const card =
                document.createElement(
                    "div"
                );

            card.className =
                "jogo-card";

            card.setAttribute("role", "listitem");

            const timeCasa =
                TIMES[jogo.casa] || {};

            const timeFora =
                TIMES[jogo.fora] || {};

            const animalCasa =
                timeCasa.emoji || "🏐";

            const animalFora =
                timeFora.emoji || "🏐";

            const patternCasa =
                timeCasa.classe || "";

            const patternFora =
                timeFora.classe || "";

            // =================================================
            // VERIFICA SE O JOGO PERTENCE AO PRÓXIMO DIA
            // =================================================

            let ehProximo =
                false;

            if (
                jogo.dataObjeto instanceof Date &&
                !isNaN(
                    jogo.dataObjeto.getTime()
                ) &&
                proximaDataTimestamp !== null
            ) {

                const dataJogo =
                    new Date(
                        jogo.dataObjeto
                    );

                dataJogo.setHours(
                    0,
                    0,
                    0,
                    0
                );

                ehProximo =
                    dataJogo.getTime() ===
                    proximaDataTimestamp;

            }

            if (ehProximo) {

                card.classList.add(
                    "jogo-destaque"
                );

            }

            // =================================================
            // HTML DO JOGO
            // =================================================

            card.innerHTML = `

                <div class="jogo-data">

                    <div class="dia" title="${jogo.data}" aria-label="${jogo.data}">
                        ${formatarDataCurta(jogo.dataObjeto, jogo.data)}
                    </div>

                    <div class="hora">
                        ${jogo.hora}
                    </div>

                </div>

                <div class="jogo-confronto">

                    <div class="time time-casa">

                        <span class="animal">
                            <span aria-hidden="true">${animalCasa}</span>
                        </span>

                        <span class="swatch ${patternCasa}"></span>

                        <span class="nome-time">
                            ${jogo.casa}
                        </span>

                    </div>

                    <span class="vs">
                        ×
                    </span>

                    <div class="time time-fora">

                        <span class="nome-time">
                            ${jogo.fora}
                        </span>

                        <span class="swatch ${patternFora}"></span>

                        <span class="animal">
                            <span aria-hidden="true">${animalFora}</span>
                        </span>

                    </div>

                </div>

                <div class="jogo-local">

                    ${jogo.fase}

                    · Ginásio AABB

                </div>

            `;

            container.appendChild(
                card
            );

        }
    );

    // ========================================================
    // NENHUM JOGO
    // ========================================================

    if (
        proximos.length === 0
    ) {

        container.innerHTML = `

            <div style="
                padding: 24px;
                text-align: center;
                color: #8B8F98;
            ">

                Não há próximos jogos cadastrados.

            </div>

        `;

    }

}

// ============================================================
// RENDERIZAR ÚLTIMOS RESULTADOS
// Mostra partidas já encerradas (mais recentes primeiro)
// ============================================================

function renderUltimosResultados() {

    const container = document.getElementById(
        "ultimos-resultados"
    );

    if (!container) {

        console.warn('Elemento "#ultimos-resultados" não encontrado.');
        return;

    }

    container.innerHTML = "";

    const encerrados = jogos.filter(
        jogo =>
            jogo.placarCasa !== "" &&
            jogo.placarFora !== ""
    );

    if (encerrados.length === 0) {

        container.innerHTML = `

            <div style="padding:12px;color:var(--muted);">

                Nenhum resultado encontrado.

            </div>

        `;

        return;

    }

    encerrados.sort((a, b) => {

        const da = a.dataObjeto ? a.dataObjeto.getTime() : 0;
        const db = b.dataObjeto ? b.dataObjeto.getTime() : 0;
        if (da !== db) return db - da;
        return obterMinutosHora(b.hora) - obterMinutosHora(a.hora);

    });

    const recentes = encerrados.slice(0, 6);

    recentes.forEach(jogo => {

        const timeCasa = TIMES[jogo.casa] || {};
        const timeFora = TIMES[jogo.fora] || {};

        const scoreCasa = jogo.placarCasa || "0";
        const scoreFora = jogo.placarFora || "0";

        const pontosCasa = Number(String(scoreCasa).replace(/[^0-9]/g, '')) || 0;
        const pontosFora = Number(String(scoreFora).replace(/[^0-9]/g, '')) || 0;

        const vencedor = pontosCasa > pontosFora ? jogo.casa : (pontosFora > pontosCasa ? jogo.fora : 'Empate');

        const card = document.createElement('div');
        card.className = 'resultado-card';
        card.setAttribute('role', 'listitem');

        card.innerHTML = `

            <div style="width:120px; font-size:13px; color:var(--muted);">
                ${jogo.data} <br><span style="font-weight:800;color:var(--text);">${jogo.hora || ''}</span>
            </div>

            <div class="resultado-info">
                <div style="font-weight:800">${jogo.casa} <span style="color:var(--muted);font-weight:600">×</span> ${jogo.fora}</div>
                <div style="font-size:13px;color:var(--muted);">${jogo.fase}</div>
            </div>

            <div class="resultado-score">${scoreCasa} × ${scoreFora}</div>

            <div style="width:120px;text-align:center;">
                <div class="resultado-winner">${vencedor}</div>
            </div>

        `;

        container.appendChild(card);

    });

}

function renderChaveamento() {

    const container = document.getElementById("chaveamento");
    if (!container) return;

    const fases = [
        { nome: "Semifinais", classe: "semifinais" },
        { nome: "Disputa de 3º lugar", classe: "terceiro" },
        { nome: "Final", classe: "final" }
    ];

    container.innerHTML = fases.map(fase => {

        const partidas = jogos.filter(jogo => jogo.fase === fase.nome);
        const conteudo = partidas.length > 0
            ? partidas.map((jogo, indice) => `
                <div class="chave-card">
                    <span class="chave-jogo">Jogo ${indice + 1}</span>
                    <strong>${jogo.casa}</strong>
                    <span class="chave-versus">×</span>
                    <strong>${jogo.fora}</strong>
                    <small>${jogo.data} · ${jogo.hora}</small>
                </div>
            `).join("")
            : `<div class="chave-vazio">A definir</div>`;

        return `
            <div class="chave-coluna chave-${fase.classe}">
                <h3>${fase.nome}</h3>
                ${conteudo}
            </div>
        `;

    }).join("");

}

// ============================================================
// ATUALIZAR RESUMO
//
// Considera somente os jogos da fase de grupos.
// ============================================================

function atualizarResumo() {

    const jogosFaseGrupos =
        jogos.filter(
            jogo =>
                jogo.faseGrupos
        );

    const disputados =
        jogosFaseGrupos.filter(
            jogo =>
                jogo.placarCasa !== "" &&
                jogo.placarFora !== ""
        ).length;

    const total =
        jogosFaseGrupos.length;

    const numeroElemento =
        document.querySelector(
            ".hero-stat-num"
        );

    const denominador =
        document.querySelector(
            ".hero-stat-den"
        );

    if (numeroElemento) {

        numeroElemento.textContent =
            disputados;

    }

    if (denominador) {

        // Explica claramente qual conjunto está sendo contado
        const faseTexto = total > 0 ? 'da fase de grupos' : '';
        denominador.textContent = `/${total} jogos ${faseTexto}`;

    }

    const atualizarElemento = (id, valor) => {
        const elemento = document.getElementById(id);
        if (elemento) elemento.textContent = valor;
    };

    const restantes = jogosFaseGrupos.filter(
        jogo =>
            jogo.placarCasa === "" ||
            jogo.placarFora === ""
    ).length;

    const lider = classificacao[0];
    const maiorSaldo = classificacao.reduce(
        (maior, time) =>
            !maior || time.saldo > maior.saldo ? time : maior,
        null
    );

    const proximos = jogos
        .filter(jogo =>
            jogo.placarCasa === "" &&
            jogo.placarFora === "" &&
            jogo.dataObjeto instanceof Date &&
            !isNaN(jogo.dataObjeto.getTime())
        )
        .sort((a, b) =>
            a.dataObjeto.getTime() - b.dataObjeto.getTime() ||
            obterMinutosHora(a.hora) - obterMinutosHora(b.hora)
        );

    atualizarElemento("resumo-restantes", restantes);
    atualizarElemento("resumo-lider", lider ? lider.nome : "—");
    atualizarElemento(
        "resumo-saldo",
        maiorSaldo ? `${maiorSaldo.nome} (+${maiorSaldo.saldo})` : "—"
    );
    atualizarElemento(
        "resumo-proxima",
        proximos.length > 0
            ? `${proximos[0].casa} × ${proximos[0].fora}`
            : "Encerrado"
    );

}

// ============================================================
// EXIBIR ERRO
// ============================================================

function mostrarErro(erro) {

    console.error(
        "================================="
    );

    console.error(
        "ERRO NO CARREGAMENTO:"
    );

    console.error(erro);

    console.error(
        "================================="
    );

    const classificacaoContainer =
        document.getElementById(
            "classificacao"
        );

    const jogosContainer =
        document.getElementById(
            "jogos"
        );

    if (classificacaoContainer) {

        classificacaoContainer.innerHTML = `

            <div style="
                padding: 24px;
                text-align: center;
                color: #B14C4C;
            ">

                Erro ao carregar a classificação.

            </div>

        `;

    }

    if (jogosContainer) {

        jogosContainer.innerHTML = `

            <div style="
                padding: 24px;
                text-align: center;
                color: #B14C4C;
            ">

                Erro ao carregar os jogos.

            </div>

        `;

    }

}

// ============================================================
// CARREGAMENTO PRINCIPAL
// ============================================================

// ============================================================
// CARREGAR BIBLIOTECA XLSX
// ============================================================

function carregarXLSX() {

    return new Promise((resolve, reject) => {

        if (window.XLSX) {
            resolve();
            return;
        }

        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js';
        script.onload = () => resolve();
        script.onerror = () => reject(new Error('Não foi possível carregar a biblioteca XLSX.'));
        document.head.appendChild(script);

    });

}


// ============================================================
// BAIXAR / LER EXCEL LOCAL
// ============================================================

async function baixarExcel() {

    console.log('Carregando Excel:', EXCEL_URL);

    const resposta = await fetch(EXCEL_URL, { cache: 'no-store' });

    if (!resposta.ok) {
        throw new Error(`Não foi possível acessar o Excel. HTTP ${resposta.status}`);
    }

    return await resposta.arrayBuffer();

}


// ============================================================
// PROCESSAR WORKBOOK (reutilizável para fetch ou upload)
// ============================================================

function processWorkbook(workbook) {

    try {

        console.log('Abas encontradas:', workbook.SheetNames);

        const abaJogos = encontrarAba(workbook, 'Tabela de Jogos');

        jogos = lerJogos(abaJogos);

        console.log('Jogos encontrados:', jogos.length);

        classificacao = calcularClassificacao(jogos);

        const nomeAbaTimes = workbook.SheetNames.find(nome =>
            ["time", "times"].includes(nome.trim().toLowerCase())
        );
        const abaTimes = nomeAbaTimes ? workbook.Sheets[nomeAbaTimes] : null;
        renderEscalacoes(lerTimes(abaTimes));

        console.log('Times encontrados:', classificacao.length);

        renderClassificacao();
        renderJogos();
        renderUltimosResultados();
        renderChaveamento();
        atualizarResumo();

        console.log('Dados carregados com sucesso via workbook.');

    } catch (e) {
        mostrarErro(e);
    }

}


// ============================================================
// HANDLERS DE UPLOAD (botão e input adicionados em index.html)
// ============================================================

document.addEventListener('DOMContentLoaded', () => {

    configurarModalEscalacao();

    const btn = document.getElementById('btn-upload-planilha');
    const input = document.getElementById('file-excel');

    if (btn && input) {

        btn.addEventListener('click', () => input.click());

        input.addEventListener('change', async (ev) => {

            const file = ev.target.files && ev.target.files[0];
            if (!file) return;

            try {
                const arrayBuffer = await file.arrayBuffer();
                const workbook = XLSX.read(arrayBuffer, { type: 'array', cellDates: true });
                processWorkbook(workbook);
            } catch (err) {
                mostrarErro(err);
            }

        });

    }

});

async function carregarDados() {

    try {

        console.log(
            "================================="
        );

        console.log(
            "CAMPEONATO DOS BICHOS"
        );

        console.log(
            "Carregando dados da planilha..."
        );

        // ====================================================
        // 1 — CARREGAR XLSX
        // ====================================================

        await carregarXLSX();

        console.log(
            "Biblioteca XLSX carregada."
        );

        // ====================================================
        // 2 — BAIXAR EXCEL
        // ====================================================

        const arquivo =
            await baixarExcel();

        console.log(
            "Excel carregado."
        );

        // ====================================================
        // 3 — ABRIR EXCEL
        // ====================================================

        const workbook =
            XLSX.read(
                arquivo,
                {
                    type: "array",
                    cellDates: true
                }
            );

        console.log(
            "Abas encontradas:",
            workbook.SheetNames
        );

        // ====================================================
        // 4 — TABELA DE JOGOS
        // ====================================================

        const abaJogos =
            encontrarAba(
                workbook,
                "Tabela de Jogos"
            );

        jogos =
            lerJogos(
                abaJogos
            );

        console.log(
            "Jogos encontrados:",
            jogos.length
        );

        // ====================================================
        // 5 — CLASSIFICAÇÃO
        // ====================================================

        classificacao =
            calcularClassificacao(
                jogos
            );

        const nomeAbaTimes = workbook.SheetNames.find(nome =>
            ["time", "times"].includes(nome.trim().toLowerCase())
        );
        renderEscalacoes(nomeAbaTimes ? lerTimes(workbook.Sheets[nomeAbaTimes]) : []);

        console.log(
            "Times encontrados:",
            classificacao.length
        );

        // ====================================================
        // 6 — RENDERIZAR
        // ====================================================

        renderClassificacao();

        renderJogos();

        renderUltimosResultados();

        renderChaveamento();

        atualizarResumo();

        // ====================================================
        // LOGS
        // ====================================================

        console.log(
            "Classificação:",
            classificacao
        );

        console.log(
            "Jogos:",
            jogos
        );

        console.log(
            "Jogos da fase de grupos:",
            jogos.filter(
                jogo =>
                    jogo.faseGrupos
            )
        );

        console.log(
            "Dados carregados com sucesso."
        );

    } catch (erro) {

        mostrarErro(
            erro
        );

    }

}

// ============================================================
// INICIALIZA
// ============================================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        carregarDados();

    }
);