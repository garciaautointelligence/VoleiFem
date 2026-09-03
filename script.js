// ============================================================
// CAMPEONATO DOS BICHOS — AABB
// Leitura da planilha Excel local
// ============================================================

const EXCEL_URL =
    "./torneio_interno_planilha_preenchivel.xlsx";

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
// DADOS
// ============================================================

let classificacao = [];
let jogos = [];

// ============================================================
// CARREGAR BIBLIOTECA XLSX
// ============================================================

function carregarXLSX() {

    return new Promise((resolve, reject) => {

        if (window.XLSX) {
            resolve();
            return;
        }

        const script =
            document.createElement("script");

        script.src =
            "https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js";

        script.onload = () => resolve();

        script.onerror = () => {

            reject(
                new Error(
                    "Não foi possível carregar a biblioteca XLSX."
                )
            );

        };

        document.head.appendChild(script);

    });

}

// ============================================================
// BAIXAR / LER EXCEL LOCAL
// ============================================================

async function baixarExcel() {

    console.log(
        "Carregando Excel:",
        EXCEL_URL
    );

    const resposta =
        await fetch(
            EXCEL_URL,
            {
                cache: "no-store"
            }
        );

    if (!resposta.ok) {

        throw new Error(
            `Não foi possível acessar o Excel. HTTP ${resposta.status}`
        );

    }

    return await resposta.arrayBuffer();

}

// ============================================================
// NORMALIZA TEXTO
// ============================================================

function texto(valor) {

    if (
        valor === undefined ||
        valor === null
    ) {
        return "";
    }

    return String(valor)
        .trim()
        .replace(/\s+/g, " ");

}

// ============================================================
// CONVERTE PARA NÚMERO
// ============================================================

function numero(valor) {

    if (
        valor === undefined ||
        valor === null ||
        valor === ""
    ) {
        return 0;
    }

    const n =
        Number(
            String(valor)
                .replace(",", ".")
                .trim()
        );

    return Number.isFinite(n)
        ? n
        : 0;

}

// ============================================================
// FORMATA DATA PARA EXIBIÇÃO
//
// Exemplos:
// 11/09/2026 → 11/setembro
// 18/09/2026 → 18/setembro
// 02/10/2026 → 02/outubro
// ============================================================

function formatarData(valor) {

    if (
        valor === undefined ||
        valor === null ||
        valor === ""
    ) {
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

    // ========================================================
    // DATA REAL VINDO DO EXCEL
    // ========================================================

    if (
        valor instanceof Date &&
        !isNaN(valor.getTime())
    ) {

        const dia =
            String(
                valor.getDate()
            ).padStart(2, "0");

        const mes =
            meses[valor.getMonth()];

        return `${dia}/${mes}`;
    }

    // ========================================================
    // NÚMERO SERIAL DO EXCEL
    // ========================================================

    if (
        typeof valor === "number" &&
        Number.isFinite(valor)
    ) {

        const dataExcel =
            new Date(
                Date.UTC(
                    1899,
                    11,
                    30
                ) +
                valor * 86400000
            );

        const dia =
            String(
                dataExcel.getUTCDate()
            ).padStart(2, "0");

        const mes =
            meses[
                dataExcel.getUTCMonth()
            ];

        return `${dia}/${mes}`;
    }

    // ========================================================
    // TEXTO
    // ========================================================

    const data =
        texto(valor);

    // ========================================================
    // DD/MM/AAAA
    // DD/MM/AA
    // DD-MM-AAAA
    // ========================================================

    const numeroData =
        data.match(
            /^(\d{1,2})[\/-](\d{1,2})(?:[\/-](\d{2,4}))?$/
        );

    if (numeroData) {

        const dia =
            numeroData[1]
                .padStart(2, "0");

        const numeroMes =
            Number(numeroData[2]);

        const mes =
            meses[numeroMes - 1];

        if (mes) {
            return `${dia}/${mes}`;
        }
    }

    // ========================================================
    // JÁ ESTÁ COM MÊS ESCRITO
    // ========================================================

    const textoData =
        data.match(
            /^(\d{1,2})\s*[\/-]?\s*([a-zç]+)$/i
        );

    if (textoData) {

        const dia =
            textoData[1]
                .padStart(2, "0");

        const nomeMes =
            textoData[2]
                .toLowerCase();

        const indiceMes =
            meses.findIndex(
                mes =>
                    mes.startsWith(
                        nomeMes.substring(0, 3)
                    )
            );

        if (indiceMes >= 0) {
            return `${dia}/${meses[indiceMes]}`;
        }
    }

    return data;
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
        // DATA DE EXIBIÇÃO
        // ====================================================

        const data =
            formatarData(
                valorData
            );

        // ====================================================
        // DATA REAL
        // ====================================================

        const dataObjeto =
            obterDataObjeto(
                valorData
            );

        // ====================================================
        // REGISTRA JOGO
        // ====================================================

        resultado.push({

            data,

            dataObjeto,

            dia:
                data.split("/")[0] || "",

            hora,

            casa,

            fora,

            placarCasa,

            placarFora,

            fase:
                faseAtual,

            faseGrupos:
                faseAtual ===
                "Fase de grupos"

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

                    ${time.nome}

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

            `;

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

                    <div class="dia">
                        ${jogo.dia}
                    </div>

                    <div class="hora">
                        ${jogo.hora}
                    </div>

                </div>

                <div class="jogo-confronto">

                    <div class="time time-casa">

                        <span class="animal">
                            ${animalCasa}
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
                            ${animalFora}
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

        denominador.textContent =
            `/${total} jogos disputados`;

    }

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

        const abaClassificacao =
            encontrarAba(
                workbook,
                "Classificação"
            );

        classificacao =
            lerClassificacao(
                abaClassificacao
            );

        console.log(
            "Times encontrados:",
            classificacao.length
        );

        // ====================================================
        // 6 — RENDERIZAR
        // ====================================================

        renderClassificacao();

        renderJogos();

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