

function initWebGL() {
    const canvas = document.createElement('canvas');
    document.body.appendChild(canvas);
    
    canvas.style.position = "absolute";
    canvas.style.top = "0";
    canvas.style.left = "0";
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const gl = canvas.getContext('webgl');

    if (!gl) {
        console.error("Unable to initialize WebGL. Your browser may not support it.");
        return;
    }

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    window.addEventListener("resize", () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        gl.viewport(0, 0, canvas.width, canvas.height);
        gl.clear(gl.COLOR_BUFFER_BIT);
    });

    const vsSource = `
        attribute vec4 aVertexPosition;
        attribute vec4 aVertexColor;
        uniform mat4 uModelViewMatrix;
        uniform mat4 uProjectionMatrix;
        varying lowp vec4 vColor;
        void main(void) {
            gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
            vColor = aVertexColor;
        }
    `;

    const fsSource = `
        varying lowp vec4 vColor;
        void main(void) {
            gl_FragColor = vColor;
        }
    `;


    const shaderProgram = initShaderProgram(gl, vsSource, fsSource);

    const programInfo = {
        program: shaderProgram,
        attribLocations: {
            vertexPosition: gl.getAttribLocation(shaderProgram, 'aVertexPosition'),
            vertexColor: gl.getAttribLocation(shaderProgram, 'aVertexColor'),
        },
        uniformLocations: {
            projectionMatrix: gl.getUniformLocation(shaderProgram, 'uProjectionMatrix'),
            modelViewMatrix: gl.getUniformLocation(shaderProgram, 'uModelViewMatrix'),
        },
    };


    const buffers = initBuffers(gl);

    let then = 0;

    function render(now) {
        now *= 0.001;  
        const deltaTime = now - then;
        then = now;

        drawScene(gl, programInfo, buffers, deltaTime);

        requestAnimationFrame(render);
    }
    requestAnimationFrame(render);
}

function initShaderProgram(gl, vsSource, fsSource) {
    const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
    const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);

    const shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        console.error('Unable to initialize the shader program: ' + gl.getProgramInfoLog(shaderProgram));
        return null;
    }

    return shaderProgram;
}

function loadShader(gl, type, source) {
    const shader = gl.createShader(type);

    gl.shaderSource(shader, source);

    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }

    return shader;
}

function initBuffers(gl) {
    const positionBuffer = gl.createBuffer();

    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

    const positions = [
        -1.0, -1.0,  1.0,
         1.0, -1.0,  1.0,
         1.0,  1.0,  1.0,
        -1.0,  1.0,  1.0,

        -1.0, -1.0, -1.0,
        -1.0,  1.0, -1.0,
         1.0,  1.0, -1.0,
         1.0, -1.0, -1.0,

        -1.0,  1.0, -1.0,
        -1.0,  1.0,  1.0,
         1.0,  1.0,  1.0,
         1.0,  1.0, -1.0,

        -1.0, -1.0, -1.0,
         1.0, -1.0, -1.0,
         1.0, -1.0,  1.0,
        -1.0, -1.0,  1.0,

         1.0, -1.0, -1.0,
         1.0,  1.0, -1.0,
         1.0,  1.0,  1.0,
         1.0, -1.0,  1.0,

        -1.0, -1.0, -1.0,
        -1.0, -1.0,  1.0,
        -1.0,  1.0,  1.0,
        -1.0,  1.0, -1.0,
    ];


    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);


    const faceColors = [
        [1.0,  1.0,  1.0,  1.0],    
        [1.0,  0.0,  0.0,  1.0],    
        [0.0,  1.0,  0.0,  1.0],    
        [0.0,  0.0,  1.0,  1.0],   
        [1.0,  1.0,  0.0,  1.0],   
        [1.0,  0.0,  1.0,  1.0],  
    ];

    var colors = [];

    for (var j = 0; j < faceColors.length; ++j) {
        const c = faceColors[j];

        colors = colors.concat(c, c, c, c);
    }

    const colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);


    const indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);


    const indices = [
        0,  1,  2,      0,  2,  3,    
        4,  5,  6,      4,  6,  7,    
        8,  9,  10,     8,  10, 11,   
        12, 13, 14,     12, 14, 15,   
        16, 17, 18,     16, 18, 19,   
        20, 21, 22,     20, 22, 23,   
    ];

    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,
        new Uint16Array(indices), gl.STATIC_DRAW);

    return {
        position: positionBuffer,
        color: colorBuffer,
        indices: indexBuffer,
    };
}

function drawScene(gl, programInfo, buffers, deltaTime) {
    gl.clearColor(0.0, 0.0, 0.0, 1.0);  
    gl.clearDepth(1.0);                 
    gl.enable(gl.DEPTH_TEST);           
    gl.depthFunc(gl.LEQUAL);            

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    
    const fieldOfView = 45 * Math.PI / 180;  
    const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
    const zNear = 0.1;
    const zFar = 100.0;
    const projectionMatrix = mat4.create();


    mat4.perspective(projectionMatrix,
                     fieldOfView,
                     aspect,
                     zNear,
                     zFar);


    const modelViewMatrix = mat4.create();


    mat4.translate(modelViewMatrix,     
                   modelViewMatrix,     
                   [-0.0, 0.0, -6.0]);

    mat4.rotate(modelViewMatrix,  
                modelViewMatrix,  
                cubeRotation,     
                [0, 0, 1]);       
    mat4.rotate(modelViewMatrix,  
                modelViewMatrix,  
                cubeRotation * .7,
                [0, 1, 0]);       


    {
        const numComponents = 3;
        const type = gl.FLOAT;
        const normalize = false;
        const stride = 0;
        const offset = 0;
        gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
        gl.vertexAttribPointer(
            programInfo.attribLocations.vertexPosition,
            numComponents,
            type,
            normalize,
            stride,
            offset);
        gl.enableVertexAttribArray(
            programInfo.attribLocations.vertexPosition);
    }


    {
        const numComponents = 4;
        const type = gl.FLOAT;
        const normalize = false;
        const stride = 0;
        const offset = 0;
        gl.bindBuffer(gl.ARRAY_BUFFER, buffers.color);
        gl.vertexAttribPointer(
            programInfo.attribLocations.vertexColor,
            numComponents,
            type,
            normalize,
            stride,
            offset);
        gl.enableVertexAttribArray(
            programInfo.attribLocations.vertexColor);
    }

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.indices);

    gl.useProgram(programInfo.program);

    gl.uniformMatrix4fv(
        programInfo.uniformLocations.projectionMatrix,
        false,
        projectionMatrix);
    gl.uniformMatrix4fv(
        programInfo.uniformLocations.modelViewMatrix,
        false,
        modelViewMatrix);

    {
        const vertexCount = 36;
        const type = gl.UNSIGNED_SHORT;
        const offset = 0;
        gl.drawElements(gl.TRIANGLES, vertexCount, type, offset);
    }

    cubeRotation += deltaTime;
}

let cubeRotation = 0.0;

window.onload = initWebGL;
