// test/matrix.test.js
const assert = require('assert');
const { Matrix2x2 } = require('../src/math/matrix.js');

console.log('[TESTES] Iniciando validacao dos modulos de Algebra Linear...\n');

// Teste 1: Matriz Identidade (área unitária 1)
const mIdentidade = new Matrix2x2(1, 0, 0, 1);
assert.strictEqual(mIdentidade.getDeterminant(), 1, 'Determinante da identidade deve ser 1');
console.log('[OK] Teste 1: Matriz Identidade (det = 1)');

// Teste 2: Matriz com Cisalhamento (Shear) mantém a área
const mShear = new Matrix2x2(1, 2, 0, 1);
assert.strictEqual(mShear.getDeterminant(), 1, 'Cisalhamento deve preservar a área (det = 1)');
console.log('[OK] Teste 2: Cisalhamento preserva a area (det = 1)');

// Teste 3: Matriz Singular / Colapso Linear (det = 0)
const mSingular = new Matrix2x2(2, 4, 1, 2);
assert.strictEqual(mSingular.getDeterminant(), 0, 'Matriz com colunas proporcionais deve ter det = 0');
assert.strictEqual(mSingular.isSingular(), true, 'isSingular deve retornar true');
console.log('[OK] Teste 3: Deteccao de Colapso Linear (det = 0)');

// Teste 4: Vértices do paralelogramo
const mArea = new Matrix2x2(3, 1, 1, 4);
const vertices = mArea.getParallelogramVertices();
assert.strictEqual(vertices.length, 4, 'O paralelogramo deve ter exatamente 4 vértices');
assert.deepStrictEqual(vertices[0], { x: 0, y: 0 }, 'A base deve ser a origem');
assert.deepStrictEqual(vertices[2], { x: 4, y: 5 }, 'O vértice oposto deve ser a soma dos vetores (3+1, 1+4)');
console.log('[OK] Teste 4: Geometria dos 4 vertices do paralelogramo');

// Teste 5: Captura de ponto interno pela Regra de Cramer (containsPoint)
const mQuadrado = new Matrix2x2(4, 0, 0, 4);
assert.strictEqual(mQuadrado.containsPoint(2, 2), true, 'Ponto (2,2) deve estar dentro do quadrado (0,0) a (4,4)');
assert.strictEqual(mQuadrado.containsPoint(5, 2), false, 'Ponto (5,2) deve estar fora do quadrado');
assert.strictEqual(mQuadrado.containsPoint(-1, 2), false, 'Ponto (-1,2) deve estar fora do quadrado');
console.log('[OK] Teste 5: Verificacao de ponto interno com Regra de Cramer (containsPoint)');

console.log('\n[CONCLUIDO] Todos os testes de Algebra Linear foram aprovados com sucesso.');
