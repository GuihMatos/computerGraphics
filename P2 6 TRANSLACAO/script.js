// Obtém o elemento canvas
var canvas = document.getElementById('canvas');
var gl = canvas.getContext('webgl');

// Define as coordenadas e cores do quadrado
var vertices = [
  -0.5, 0.5, 0.0, // Canto superior esquerdo
  -0.5, -0.5, 0.0, // Canto inferior esquerdo
  0.5, -0.5, 0.0, // Canto inferior direito
  0.5, 0.5, 0.0 // Canto superior direito
];

var selectedColors = [
  0.0, 1.0, 0.0, 1.0, // Verde
  0.0, 1.0, 0.0, 1.0,
  0.0, 1.0, 0.0, 1.0,
  0.0, 1.0, 0.0, 1.0
];

var defaultColors = [
  0.0, 0.0, 1.0, 1.0, // Azul
  0.0, 0.0, 1.0, 1.0,
  0.0, 0.0, 1.0, 1.0,
  0.0, 0.0, 1.0, 1.0
];

var colors = defaultColors;
var isSquareSelected = false;
var squarePosition = { x: 0, y: 0 }; // Posição inicial do quadrado

// Define os índices dos vértices para formar o quadrado
var indices = [0, 1, 2, 0, 2, 3];

// Cria os buffers para armazenar os dados
var vertexBuffer = gl.createBuffer();
var colorBuffer = gl.createBuffer();
var indexBuffer = gl.createBuffer();

// Vincula os buffers aos respectivos tipos de dados
gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);

gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

// Obtém as referências aos atributos e uniformes dos shaders
var vertexShaderSource = `
attribute vec3 aPosition;
attribute vec4 aColor;
uniform vec2 uTranslation;
varying vec4 vColor;
void main() {
  vec3 translatedPosition = vec3(aPosition.x + uTranslation.x, aPosition.y + uTranslation.y, aPosition.z);
  gl_Position = vec4(translatedPosition, 1.0);
  vColor = aColor;
}`;

var fragmentShaderSource = `
precision mediump float;
varying vec4 vColor;
void main() {
  gl_FragColor = vColor;
}`;

var vertexShader = gl.createShader(gl.VERTEX_SHADER);
gl.shaderSource(vertexShader, vertexShaderSource);
gl.compileShader(vertexShader);

var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
gl.shaderSource(fragmentShader, fragmentShaderSource);
gl.compileShader(fragmentShader);

var program = gl.createProgram();
gl.attachShader(program, vertexShader);
gl.attachShader(program, fragmentShader);
gl.linkProgram(program);
gl.useProgram(program);

var aPosition = gl.getAttribLocation(program, 'aPosition');
gl.enableVertexAttribArray(aPosition);

var aColor = gl.getAttribLocation(program, 'aColor');
gl.enableVertexAttribArray(aColor);

var uTranslation = gl.getUniformLocation(program, 'uTranslation');

gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
gl.vertexAttribPointer(aPosition, 3, gl.FLOAT, false, 0, 0);

gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
gl.vertexAttribPointer(aColor, 4, gl.FLOAT, false, 0, 0);

// Configura os manipuladores de eventos para detectar cliques e movimentos do mouse no canvas
canvas.addEventListener('mousedown', function(event) {
  var x = event.clientX;
  var y = event.clientY;
  var rect = event.target.getBoundingClientRect();
  x = ((x - rect.left) - canvas.width / 2) / (canvas.width / 2);
  y = (canvas.height / 2 - (y - rect.top)) / (canvas.height / 2);

  // Verifica se o clique ocorreu dentro do quadrado
  if (x >= -0.5 && x <= 0.5 && y >= -0.5 && y <= 0.5) {
    isSquareSelected = true;
    colors = selectedColors;
  } else {
    isSquareSelected = false;
    colors = defaultColors;
  }

  gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);

  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);
});

canvas.addEventListener('mouseup', function() {
  isSquareSelected = false;
  colors = defaultColors;

  gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);

  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);
});

canvas.addEventListener('mousemove', function(event) {
  if (isSquareSelected) {
    var x = event.clientX;
    var y = event.clientY;
    var rect = event.target.getBoundingClientRect();
    x = ((x - rect.left) - canvas.width / 2) / (canvas.width / 2);
    y = (canvas.height / 2 - (y - rect.top)) / (canvas.height / 2);

    // Atualiza a posição do quadrado com base no movimento do mouse
    squarePosition.x = x;
    squarePosition.y = y;

    gl.uniform2f(uTranslation, squarePosition.x, squarePosition.y);

    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);
  }
});

// Limpa o canvas e desenha o quadrado inicialmente azul
gl.clearColor(0.0, 0.0, 0.0, 1.0);
gl.clear(gl.COLOR_BUFFER_BIT);
gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);
