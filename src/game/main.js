// src/game/main.js

// 1. Elementos do DOM
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const inputA = document.getElementById('inputA');
const inputB = document.getElementById('inputB');
const inputC = document.getElementById('inputC');
const inputD = document.getElementById('inputD');

const equationSub = document.getElementById('equationSub');

const btnActivate = document.getElementById('btnActivate');
const btnNextLevel = document.getElementById('btnNextLevel');
const btnResetLevel = document.getElementById('btnResetLevel');

const levelLabel = document.getElementById('levelLabel');
const missionDesc = document.getElementById('missionDesc');
const targetPos = document.getElementById('targetPos');
const targetDet = document.getElementById('targetDet');

const badgeDet = document.getElementById('badgeDet');
const badgeGem = document.getElementById('badgeGem');

const victoryBox = document.getElementById('victoryBox');
const victoryDetails = document.getElementById('victoryDetails');

// Modal de Parabéns
const modalOverlay = document.getElementById('modalOverlay');
const btnRestartAll = document.getElementById('btnRestartAll');
const btnCloseModal = document.getElementById('btnCloseModal');

// 2. Fases / Exercícios Práticos
const LEVELS = [
  {
    level: 1,
    title: 'Exercício 1: Primeiro Quadrante',
    desc: 'Determine uma matriz M tal que o paralelogramo contenha o gatinho no ponto (3, 2) e satisfaça det(M) = 12.',
    point: { x: 3, y: 2 },
    targetDet: 12,
    defaultMatrix: { a: 0, b: 0, c: 0, d: 0 }
  },
  {
    level: 2,
    title: 'Exercício 2: Extensão Vertical',
    desc: 'O gatinho subiu para o ponto (2, 4). A região delimitada pela matriz M deve ter det(M) = 10.',
    point: { x: 2, y: 4 },
    targetDet: 10,
    defaultMatrix: { a: 0, b: 0, c: 0, d: 0 }
  },
  {
    level: 3,
    title: 'Exercício 3: Coordenadas Negativas',
    desc: 'O gatinho foi para o lado esquerdo em (-2, 3)! Use coeficientes negativos para que det(M) = 12.',
    point: { x: -2, y: 3 },
    targetDet: 12,
    defaultMatrix: { a: 0, b: 0, c: 0, d: 0 }
  },
  {
    level: 4,
    title: 'Exercício 4: Cisalhamento e Deformação',
    desc: 'Encontre uma configuração de matriz com det(M) = 15 que englobe o gatinho no ponto (4, 3).',
    point: { x: 4, y: 3 },
    targetDet: 15,
    defaultMatrix: { a: 0, b: 0, c: 0, d: 0 }
  }
];

let currentLevelIndex = 0;
let fieldActivated = false;
let currentMatrix = null;
let catMood = 'neutral'; // 'neutral', 'happy', 'sad'

// 3. Configurações do Plano Cartesiano
const SCALE = 35; // 1 unidade = 35 pixels
const ORIGIN_X = canvas.width / 2;
const ORIGIN_Y = canvas.height / 2;

function toScreen(x, y) {
  return {
    x: ORIGIN_X + (x * SCALE),
    y: ORIGIN_Y - (y * SCALE)
  };
}

// 4. Desenha a Grade de Caderno
function drawGrid() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Grade quadriculada suave
  ctx.lineWidth = 1;
  ctx.strokeStyle = '#e2e8f0';

  const maxUnitsX = Math.floor(ORIGIN_X / SCALE);
  const maxUnitsY = Math.floor(ORIGIN_Y / SCALE);

  for (let i = -maxUnitsX; i <= maxUnitsX; i++) {
    const p1 = toScreen(i, -maxUnitsY);
    const p2 = toScreen(i, maxUnitsY);
    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.stroke();
  }

  for (let j = -maxUnitsY; j <= maxUnitsY; j++) {
    const p1 = toScreen(-maxUnitsX, j);
    const p2 = toScreen(maxUnitsX, j);
    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.stroke();
  }

  // Eixos Principais
  ctx.lineWidth = 2;
  ctx.strokeStyle = '#1e293b';

  // Eixo X
  ctx.beginPath();
  ctx.moveTo(0, ORIGIN_Y);
  ctx.lineTo(canvas.width, ORIGIN_Y);
  ctx.stroke();

  // Eixo Y
  ctx.beginPath();
  ctx.moveTo(ORIGIN_X, 0);
  ctx.lineTo(ORIGIN_X, canvas.height);
  ctx.stroke();

  // Setas dos eixos
  ctx.fillStyle = '#1e293b';
  // Seta X
  ctx.beginPath();
  ctx.moveTo(canvas.width - 10, ORIGIN_Y - 5);
  ctx.lineTo(canvas.width, ORIGIN_Y);
  ctx.lineTo(canvas.width - 10, ORIGIN_Y + 5);
  ctx.fill();

  // Seta Y
  ctx.beginPath();
  ctx.moveTo(ORIGIN_X - 5, 10);
  ctx.lineTo(ORIGIN_X, 0);
  ctx.lineTo(ORIGIN_X + 5, 10);
  ctx.fill();

  // Nomenclatura dos Eixos
  ctx.font = 'bold 15px "Patrick Hand", cursive, sans-serif';
  ctx.fillText('x', canvas.width - 16, ORIGIN_Y + 20);
  ctx.fillText('y', ORIGIN_X - 20, 16);

  // Números nos eixos
  ctx.font = '12px "Fira Code", monospace';
  ctx.fillStyle = '#64748b';
  ctx.textAlign = 'center';

  for (let i = -maxUnitsX; i <= maxUnitsX; i++) {
    if (i !== 0) {
      const pos = toScreen(i, 0);
      ctx.fillText(i, pos.x, pos.y + 16);
    }
  }

  ctx.textAlign = 'right';
  for (let j = -maxUnitsY; j <= maxUnitsY; j++) {
    if (j !== 0) {
      const pos = toScreen(0, j);
      ctx.fillText(j, pos.x - 8, pos.y + 4);
    }
  }
}

// 5. Desenha o Gatinho Expressivo (Sem linhas pontilhadas)
function drawCat(x, y, mood) {
  const p = toScreen(x, y);
  const r = 16; // Raio da cabeça

  ctx.save();
  ctx.translate(p.x, p.y);

  // Orelhas
  ctx.fillStyle = '#fef08a'; // Amarelo quentinho
  ctx.strokeStyle = '#475569';
  ctx.lineWidth = 1.8;

  // Orelha esquerda
  ctx.beginPath();
  ctx.moveTo(-12, -8);
  ctx.lineTo(-16, -22);
  ctx.lineTo(-4, -14);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Orelha direita
  ctx.beginPath();
  ctx.moveTo(12, -8);
  ctx.lineTo(16, -22);
  ctx.lineTo(4, -14);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Interior das orelhas (rosinha)
  ctx.fillStyle = '#f472b6';
  ctx.beginPath();
  ctx.moveTo(-11, -9);
  ctx.lineTo(-14, -19);
  ctx.lineTo(-5, -13);
  ctx.closePath();
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(11, -9);
  ctx.lineTo(14, -19);
  ctx.lineTo(5, -13);
  ctx.closePath();
  ctx.fill();

  // Cabeça
  ctx.fillStyle = '#fef08a';
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Bigodinhos
  ctx.strokeStyle = '#64748b';
  ctx.lineWidth = 1.2;

  // Lado esquerdo
  ctx.beginPath();
  ctx.moveTo(-16, -1);
  ctx.lineTo(-24, -3);
  ctx.moveTo(-16, 2);
  ctx.lineTo(-24, 4);
  ctx.stroke();

  // Lado direito
  ctx.beginPath();
  ctx.moveTo(16, -1);
  ctx.lineTo(24, -3);
  ctx.moveTo(16, 2);
  ctx.lineTo(24, 4);
  ctx.stroke();

  // Narizinho rosa
  ctx.fillStyle = '#f43f5e';
  ctx.beginPath();
  ctx.moveTo(-2.5, 0);
  ctx.lineTo(2.5, 0);
  ctx.lineTo(0, 2.5);
  ctx.closePath();
  ctx.fill();

  // Expressões faciais baseadas no humor (mood)
  ctx.strokeStyle = '#0f172a';
  ctx.lineWidth = 1.8;

  if (mood === 'happy') {
    // Olhos comemorando / fechadinhos felizes: ^ ^
    ctx.beginPath();
    ctx.moveTo(-8, -2);
    ctx.lineTo(-5, -6);
    ctx.lineTo(-2, -2);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(2, -2);
    ctx.lineTo(5, -6);
    ctx.lineTo(8, -2);
    ctx.stroke();

    // Boquinha sorrindo aberta
    ctx.fillStyle = '#f43f5e';
    ctx.beginPath();
    ctx.arc(0, 4, 4, 0, Math.PI);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Bochechas rosadas
    ctx.fillStyle = 'rgba(244, 114, 182, 0.6)';
    ctx.beginPath();
    ctx.arc(-9, 4, 3, 0, Math.PI * 2);
    ctx.arc(9, 4, 3, 0, Math.PI * 2);
    ctx.fill();

  } else if (mood === 'sad') {
    // Olhos tristes / caídos: •́  •̀
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(-5, -2, 2.5, 0, Math.PI * 2);
    ctx.arc(5, -2, 2.5, 0, Math.PI * 2);
    ctx.fill();

    // Sobrancelhas caídas
    ctx.beginPath();
    ctx.moveTo(-8, -8);
    ctx.lineTo(-3, -6);
    ctx.moveTo(8, -8);
    ctx.lineTo(3, -6);
    ctx.stroke();

    // Boquinha triste invertida: :(
    ctx.beginPath();
    ctx.arc(0, 7, 3, Math.PI, 0);
    ctx.stroke();

  } else {
    // Normal / Neutro / Curioso: •  •
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(-5, -3, 2.5, 0, Math.PI * 2);
    ctx.arc(5, -3, 2.5, 0, Math.PI * 2);
    ctx.fill();

    // Boquinha :3
    ctx.beginPath();
    ctx.arc(-2.5, 3.5, 2.5, 0, Math.PI);
    ctx.arc(2.5, 3.5, 2.5, 0, Math.PI);
    ctx.stroke();
  }

  // Rótulo com as coordenadas embaixo
  ctx.font = 'bold 13px "Patrick Hand", cursive, sans-serif';
  ctx.fillStyle = '#1e3a8a';
  ctx.textAlign = 'center';
  ctx.fillText(`(${x}, ${y})`, 0, 28);

  ctx.restore();
}

// 6. Desenha os Vetores Coluna da Matriz
function drawVector(x, y, color, label) {
  const start = toScreen(0, 0);
  const end = toScreen(x, y);

  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = 2.5;

  ctx.beginPath();
  ctx.moveTo(start.x, start.y);
  ctx.lineTo(end.x, end.y);
  ctx.stroke();

  const angle = Math.atan2(end.y - start.y, end.x - start.x);
  const arrowLength = 11;

  ctx.beginPath();
  ctx.moveTo(end.x, end.y);
  ctx.lineTo(
    end.x - arrowLength * Math.cos(angle - Math.PI / 6),
    end.y - arrowLength * Math.sin(angle - Math.PI / 6)
  );
  ctx.lineTo(
    end.x - arrowLength * Math.cos(angle + Math.PI / 6),
    end.y - arrowLength * Math.sin(angle + Math.PI / 6)
  );
  ctx.closePath();
  ctx.fill();

  ctx.font = 'bold 13px "Fira Code", monospace';
  ctx.fillText(label, end.x + 8, end.y - 6);
}

// 7. Desenha o Paralelogramo
function drawParallelogram(vertices, det, isSuccess) {
  if (!vertices || vertices.length < 4) return;

  const screenPoints = vertices.map(p => toScreen(p.x, p.y));

  ctx.beginPath();
  ctx.moveTo(screenPoints[0].x, screenPoints[0].y);
  for (let i = 1; i < screenPoints.length; i++) {
    ctx.lineTo(screenPoints[i].x, screenPoints[i].y);
  }
  ctx.closePath();

  if (Math.abs(det) < 0.001) {
    ctx.strokeStyle = '#dc2626';
    ctx.lineWidth = 3;
    ctx.stroke();
  } else if (isSuccess) {
    ctx.fillStyle = 'rgba(34, 197, 94, 0.2)';
    ctx.strokeStyle = '#16a34a';
    ctx.lineWidth = 2.5;
    ctx.fill();
    ctx.stroke();
  } else {
    ctx.fillStyle = 'rgba(37, 99, 235, 0.12)';
    ctx.strokeStyle = '#2563eb';
    ctx.lineWidth = 2;
    ctx.fill();
    ctx.stroke();
  }
}

// 8. Atualiza a Equação sem Mostrar a Resposta (durante a digitação)
function updateEquationPreview() {
  const a = inputA.value !== '' ? inputA.value : '0';
  const b = inputB.value !== '' ? inputB.value : '0';
  const c = inputC.value !== '' ? inputC.value : '0';
  const d = inputD.value !== '' ? inputD.value : '0';

  equationSub.innerText = `(${a} · ${d}) - (${b} · ${c}) = ?`;
}

// 9. Renderização Geral
function render() {
  const current = LEVELS[currentLevelIndex];
  drawGrid();

  let pointContained = false;
  let detSuccess = false;

  if (fieldActivated && currentMatrix) {
    const det = currentMatrix.getDeterminant();
    pointContained = currentMatrix.containsPoint(current.point.x, current.point.y);
    detSuccess = Math.abs(det - current.targetDet) < 0.01;

    const isTotalVictory = pointContained && detSuccess;

    drawParallelogram(currentMatrix.getParallelogramVertices(), det, isTotalVictory);
    drawVector(currentMatrix.a, currentMatrix.c, '#1d4ed8', `u(${currentMatrix.a}, ${currentMatrix.c})`);
    drawVector(currentMatrix.b, currentMatrix.d, '#b91c1c', `v(${currentMatrix.b}, ${currentMatrix.d})`);
  }

  // Desenha o gatinho com sua expressão atual
  drawCat(current.point.x, current.point.y, catMood);
}

// 10. Ação do Botão "Traçar Polígono e Verificar"
function handleActivate() {
  const a = parseFloat(inputA.value) || 0;
  const b = parseFloat(inputB.value) || 0;
  const c = parseFloat(inputC.value) || 0;
  const d = parseFloat(inputD.value) || 0;

  currentMatrix = new Matrix2x2(a, b, c, d);
  fieldActivated = true;

  const det = currentMatrix.getDeterminant();
  const current = LEVELS[currentLevelIndex];

  // Mostra o número calculado no lugar do ponto de interrogação ?
  const formattedDet = Number.isInteger(det) ? det : parseFloat(det.toFixed(2));
  equationSub.innerText = `(${a} · ${d}) - (${b} · ${c}) = ${formattedDet}`;

  // 1. Verificação do Determinante
  const detMatches = Math.abs(det - current.targetDet) < 0.01;
  if (detMatches) {
    badgeDet.innerText = `Correto (= ${current.targetDet})`;
    badgeDet.className = 'badge badge-success';
  } else {
    badgeDet.innerText = `Incorreto (≠ ${current.targetDet})`;
    badgeDet.className = 'badge badge-error';
  }

  // 2. Verificação de Ponto Interno
  const isContained = currentMatrix.containsPoint(current.point.x, current.point.y);
  if (isContained) {
    badgeGem.innerText = 'Contido no interior';
    badgeGem.className = 'badge badge-success';
  } else {
    badgeGem.innerText = 'Fora da região';
    badgeGem.className = 'badge badge-error';
  }

  // 3. Atualiza o humor do gatinho!
  if (detMatches && isContained) {
    catMood = 'happy';
    victoryBox.style.display = 'block';
    
    if (currentLevelIndex === LEVELS.length - 1) {
      victoryDetails.innerText = 'Excelente! Você completou o último exercício da lista com sucesso!';
      btnNextLevel.innerText = 'Concluir Lista de Exercícios';
    } else {
      victoryDetails.innerText = `Solução válida: a matriz gerou det = ${current.targetDet} e englobou o gatinho com sucesso!`;
      btnNextLevel.innerText = 'Avançar para o Próximo Exercício';
    }
  } else {
    catMood = 'sad';
    victoryBox.style.display = 'none';
  }

  render();
}

// 11. Carrega o Exercício
function loadLevel(index) {
  currentLevelIndex = index;
  const current = LEVELS[currentLevelIndex];

  levelLabel.innerText = `Exercício ${current.level} de ${LEVELS.length}`;
  missionDesc.innerText = current.desc;
  targetPos.innerText = `(${current.point.x}, ${current.point.y})`;
  targetDet.innerText = current.targetDet;

  inputA.value = current.defaultMatrix.a;
  inputB.value = current.defaultMatrix.b;
  inputC.value = current.defaultMatrix.c;
  inputD.value = current.defaultMatrix.d;

  updateEquationPreview();

  fieldActivated = false;
  currentMatrix = null;
  catMood = 'neutral'; // Volta ao normal
  badgeDet.innerText = 'Pendente';
  badgeDet.className = 'badge badge-pending';
  badgeGem.innerText = 'Pendente';
  badgeGem.className = 'badge badge-pending';
  victoryBox.style.display = 'none';
  
  if (currentLevelIndex === LEVELS.length - 1) {
    btnNextLevel.innerText = 'Concluir Lista de Exercícios';
  } else {
    btnNextLevel.innerText = 'Avançar para o Próximo Exercício';
  }

  render();
}

// 12. Eventos dos Controles
[inputA, inputB, inputC, inputD].forEach(input => {
  input.addEventListener('input', () => {
    // Ao alterar qualquer número, volta a equação para '?' e limpa análise anterior
    fieldActivated = false;
    currentMatrix = null;
    catMood = 'neutral';
    badgeDet.innerText = 'Pendente';
    badgeDet.className = 'badge badge-pending';
    badgeGem.innerText = 'Pendente';
    badgeGem.className = 'badge badge-pending';
    victoryBox.style.display = 'none';
    updateEquationPreview();
    render();
  });
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') handleActivate();
  });
});

btnActivate.addEventListener('click', handleActivate);

btnNextLevel.addEventListener('click', () => {
  if (currentLevelIndex < LEVELS.length - 1) {
    loadLevel(currentLevelIndex + 1);
  } else {
    // Abre o popup de parabéns final
    modalOverlay.classList.add('active');
  }
});

btnRestartAll.addEventListener('click', () => {
  modalOverlay.classList.remove('active');
  loadLevel(0);
});

btnCloseModal.addEventListener('click', () => {
  modalOverlay.classList.remove('active');
});

btnResetLevel.addEventListener('click', () => {
  loadLevel(currentLevelIndex);
});

// Inicialização
loadLevel(0);
