const XLSX = require('xlsx');
const path = require('path');

const file = path.join(__dirname, '..', 'torneio_interno_planilha_preenchivel.xlsx');

try {
  const workbook = XLSX.readFile(file, { cellDates: true });
  console.log('Abas:', workbook.SheetNames);

  function lerJogos(sheetName) {
    const ws = workbook.Sheets[sheetName];
    if (!ws) return [];
    const linhas = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '', raw: true });
    const resultado = [];
    let faseAtual = 'Fase de grupos';

    for (const linha of linhas) {
      if (!linha || linha.length < 7) continue;
      const valorData = linha[0];
      const primeiraColuna = (valorData || '').toString().trim();
      const hora = (linha[1] || '').toString().trim();
      const casa = (linha[2] || '').toString().trim();
      const placarCasa = (linha[3] || '').toString().trim();
      const placarFora = (linha[5] || '').toString().trim();
      const fora = (linha[6] || '').toString().trim();

      const marcador = primeiraColuna.toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      if (marcador === 'SEMIFINAIS') { faseAtual = 'Semifinais'; continue; }
      if (marcador === 'DISPUTA 3Âº LUGAR' || marcador === 'DISPUTA 3O LUGAR' || marcador === 'DISPUTA 3 LUGAR') { faseAtual = 'Disputa de 3º lugar'; continue; }
      if (marcador === 'FINAL') { faseAtual = 'Final'; continue; }
      if (primeiraColuna.toLowerCase() === 'data' || casa.toLowerCase() === 'time a') continue;
      if (!casa || !fora) continue;

      resultado.push({ data: valorData, hora, casa, fora, placarCasa, placarFora, fase: faseAtual, faseGrupos: faseAtual === 'Fase de grupos' });
    }

    return resultado;
  }

  const jogos = lerJogos('Tabela de Jogos');
  console.log('Jogos totais lidos:', jogos.length);

  const faseGrupos = jogos.filter(j => j.faseGrupos);
  const disputados = faseGrupos.filter(j => j.placarCasa !== '' && j.placarFora !== '').length;

  console.log('Jogos fase de grupos:', faseGrupos.length);
  console.log('Jogos disputados na fase de grupos:', disputados);

  // Classificação
  const abaClass = workbook.Sheets['Classificação'];
  if (abaClass) {
    const linhas = XLSX.utils.sheet_to_json(abaClass, { header: 1, range: 'A9:I14', defval: '', raw: true });
    const times = [];
    for (let i = 1; i < linhas.length; i++) {
      const linha = linhas[i];
      if (!linha || !linha[1]) continue;
      times.push(linha[1]);
    }
    console.log('Times na classificação (A9:I14):', times.length);
  } else {
    console.log('Aba Classificação não encontrada');
  }

} catch (err) {
  console.error('Erro ao ler planilha:', err.message);
  process.exit(1);
}
