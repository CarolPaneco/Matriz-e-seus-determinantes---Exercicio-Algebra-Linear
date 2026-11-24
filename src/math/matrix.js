// src/math/matrix.js

/**
 * Representa uma matriz 2x2:
 * [ a  b ]
 * [ c  d ]
 * 
 * Na geometria analítica e na álgebra linear:
 * - Coluna 1: Vetor v1 = (a, c)
 * - Coluna 2: Vetor v2 = (b, d)
 * - O determinante det(M) = (a * d) - (b * c) corresponde à ÁREA com sinal do paralelogramo formado por v1 e v2.
 */
class Matrix2x2 {
  constructor(a = 1, b = 0, c = 0, d = 1) {
    this.a = a;
    this.b = b;
    this.c = c;
    this.d = d;
  }

  // Calcula o Determinante: (a * d) - (b * c)
  getDeterminant() {
    return (this.a * this.d) - (this.b * this.c);
  }

  // Retorna os 4 vértices do paralelogramo gerado pelos vetores coluna
  getParallelogramVertices() {
    const origin = { x: 0, y: 0 };
    const p1 = { x: this.a, y: this.c };                  // Vetor v1 (a, c)
    const p2 = { x: this.b, y: this.d };                  // Vetor v2 (b, d)
    const p3 = { x: this.a + this.b, y: this.c + this.d }; // Vértice oposto (v1 + v2)

    // Ordem para fechar o polígono: Origem -> P1 -> P3 -> P2
    return [origin, p1, p3, p2];
  }

  // Se o determinante for 0, os vetores são Linearmente Dependentes (LD)
  // e a área colapsa em uma reta.
  isSingular() {
    return Math.abs(this.getDeterminant()) < 0.0001;
  }

  /**
   * Verifica se um ponto (px, py) - a joia - está dentro do paralelogramo.
   * 
   * MATEMÁTICA (Regra de Cramer):
   * Queremos encontrar escalares alpha e beta tais que:
   * [ a  b ] [ alpha ] = [ px ]
   * [ c  d ] [ beta  ]   [ py ]
   * 
   * Pela Regra de Cramer:
   * D = det(M) = a*d - b*c
   * D_alpha = px*d - b*py
   * D_beta  = a*py - c*px
   * 
   * alpha = D_alpha / D
   * beta  = D_beta / D
   * 
   * O ponto está DENTRO do paralelogramo se e somente se:
   * 0 <= alpha <= 1  E  0 <= beta <= 1
   */
  containsPoint(px, py) {
    const det = this.getDeterminant();

    // Se o determinante for zero, a área é nula (não engloba nada em 2D)
    if (Math.abs(det) < 0.0001) {
      return false;
    }

    const dAlpha = (px * this.d) - (this.b * py);
    const dBeta = (this.a * py) - (this.c * px);

    const alpha = dAlpha / det;
    const beta = dBeta / det;

    // Tolerância para pequenos erros de arredondamento em float
    const EPSILON = 0.001;
    const alphaValid = alpha >= -EPSILON && alpha <= 1 + EPSILON;
    const betaValid = beta >= -EPSILON && beta <= 1 + EPSILON;

    return alphaValid && betaValid;
  }
}

// Exporta globalmente para o navegador (funciona dando dois cliques no index.html)
if (typeof window !== 'undefined') {
  window.Matrix2x2 = Matrix2x2;
}

// Suporte para Node.js / testes
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { Matrix2x2 };
}

