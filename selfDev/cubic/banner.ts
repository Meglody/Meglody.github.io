import useShader, { locationType } from './useShader'
import {Matrix4} from 'three'
import imgSrc from './images/handled/glass03.jpeg'
import cubicVertexShader from './shaders/cubic/cubic.vert'
import cubicFragmentShader from './shaders/cubic/cubic.frag'
import particleVertexShader from './shaders/particles/particles.vert'
import particleFragmentShader from './shaders/particles/particles.frag'
const {initShaders} = useShader
const prepareCanvas = () => {
    const canvas = document.createElement('canvas')
    canvas.width = window.innerHeight
    canvas.height = window.innerHeight
    const bannerWrapper = document.querySelector('#banner')
    bannerWrapper!.appendChild(canvas)
    const gl = canvas.getContext('webgl')
    return gl as WebGLRenderingContext
}
const cubicSourceOrigin = [
    -0.5, -0.5, -0.5, 0, 0,
    -0.5, 0.5, -0.5, 0, 0.5,
    0.5, -0.5, -0.5, 0.25, 0,
    -0.5, 0.5, -0.5, 0, 0.5,
    0.5, 0.5, -0.5, 0.25, 0.5,
    0.5, -0.5, -0.5, 0.25, 0,

    -0.5, -0.5, 0.5, 0.25, 0,
    0.5, -0.5, 0.5, 0.5, 0,
    -0.5, 0.5, 0.5, 0.25, 0.5,
    -0.5, 0.5, 0.5, 0.25, 0.5,
    0.5, -0.5, 0.5, 0.5, 0,
    0.5, 0.5, 0.5, 0.5, 0.5,

    -0.5, 0.5, -0.5, 0.5, 0,
    -0.5, 0.5, 0.5, 0.5, 0.5,
    0.5, 0.5, -0.5, 0.75, 0,
    -0.5, 0.5, 0.5, 0.5, 0.5,
    0.5, 0.5, 0.5, 0.75, 0.5,
    0.5, 0.5, -0.5, 0.75, 0,

    -0.5, -0.5, -0.5, 0, 0.5,
    0.5, -0.5, -0.5, 0.25, 0.5,
    -0.5, -0.5, 0.5, 0, 1,
    -0.5, -0.5, 0.5, 0, 1,
    0.5, -0.5, -0.5, 0.25, 0.5,
    0.5, -0.5, 0.5, 0.25, 1,

    -0.5, -0.5, -0.5, 0.25, 0.5,
    -0.5, -0.5, 0.5, 0.25, 1,
    -0.5, 0.5, -0.5, 0.5, 0.5,
    -0.5, -0.5, 0.5, 0.25, 1,
    -0.5, 0.5, 0.5, 0.5, 1,
    -0.5, 0.5, -0.5, 0.5, 0.5,

    0.5, -0.5, -0.5, 0.5, 0.5,
    0.5, 0.5, -0.5, 0.75, 0.5,
    0.5, -0.5, 0.5, 0.5, 1,
    0.5, -0.5, 0.5, 0.5, 1,
    0.5, 0.5, -0.5, 0.75, 0.5,
    0.5, 0.5, 0.5, 0.75, 1,
]
const particleSourceOrigin = [
    0, -0.8, 0,
    0.1, -0.6, -0.1,
    -0.1, -0.6, 0.1,
    0.2, -0.4, -0.2,
    -0.2, -0.4, 0.2,
    -0.2, -0.4, -0.2,
    0.2, -0.4, 0.2,
    0.3, -0.2, -0.3,
    -0.3, -0.2, 0.3,
    -0.3, -0.2, -0.3,
    0.3, -0.2, 0.3,
]
let count = 0
const initVertex = (gl: WebGLRenderingContext, program: WebGLProgram,sourceOrigin: number[], seriesInfo: locationType[]) => {
    gl.useProgram(program)
    const source = new Float32Array(sourceOrigin);
    const elementBytes = source.BYTES_PER_ELEMENT
    let categorySize = 0
    for(let i = 0 ; i < seriesInfo.length ; i++){
        // ????????????
        categorySize += seriesInfo[i].size
    }
    // ???????????????
    const categoryBytes = categorySize * elementBytes
    const sourceSize = source.length / categorySize

    const sourceBuffer = gl.createBuffer() as WebGLBuffer
    gl.bindBuffer(gl.ARRAY_BUFFER, sourceBuffer)
    gl.bufferData(gl.ARRAY_BUFFER, source, gl.STATIC_DRAW)
    
    let writeAttribFns = []
    for(let i = 0 ; i < seriesInfo.length ; i++){
        let fn = () => gl.vertexAttribPointer(
            seriesInfo[i].location,
            // ????????????
            seriesInfo[i].size,
            gl.FLOAT,
            false,
            // ???????????????
            categoryBytes,
            // ????????????????????????
            seriesInfo[i].index * elementBytes
        )
        fn()
        writeAttribFns.push(fn)
        gl.enableVertexAttribArray(seriesInfo[i].location)
    }
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1)
    count++
    return {
        source,
        sourceBuffer,
        sourceSize,
        writeAttribFns,
    }
}

const initCubicMatrix = (gl: WebGLRenderingContext, program: WebGLProgram) => {
    gl.useProgram(program)
    // ?????????????????????
    let cubic_modelMatrix = new Matrix4().multiply(new Matrix4().makeScale(0.2, 0.2, 0.2))
    let u_cubic_ModelMatrix = gl.getUniformLocation(program, 'u_cubic_ModelMatrix') as WebGLUniformLocation
    return {
        cubic_modelMatrix,
        u_cubic_ModelMatrix
    }
}

const initParticleMatrix = (gl: WebGLRenderingContext, program: WebGLProgram) => {
    gl.useProgram(program)
    // ?????????????????????
    let particle_modelMatrix = new Matrix4()
    let u_particle_ModelMatrix = gl.getUniformLocation(program, 'u_particle_ModelMatrix') as WebGLUniformLocation
    return {
        particle_modelMatrix,
        u_particle_ModelMatrix
    }
}

const initTexture = async (gl: WebGLRenderingContext, program: WebGLProgram) => {
    gl.useProgram(program)
    // ??????????????????
    gl.activeTexture(gl.TEXTURE0)
    // ??????????????????
    const texture = gl.createTexture()
    // ????????????????????????TEXTURE_2D??????
    gl.bindTexture(gl.TEXTURE_2D, texture)
    const image = new Image()
    image.src = imgSrc
    const ret = await new Promise((resolve) => {
        image.onload = function(){
            // ????????????
            gl.texImage2D(
                // ????????????
                gl.TEXTURE_2D,
                // ??????????????????
                0,
                // ????????????????????????
                gl.RGB,
                // ??????????????????????????????????????????
                gl.RGB,
                // ???????????????????????????
                gl.UNSIGNED_BYTE,
                // ?????????
                image
            )

            // ???????????????????????????(??????????????????)
            gl.texParameteri(
                // ????????????
                gl.TEXTURE_2D,
                // ?????????????????????(?????????????????????) key ???????????? value ?????????
                gl.TEXTURE_MIN_FILTER,
                // ?????????????????????(??????) value
                gl.LINEAR
            )

            // ????????????????????????Uniform??????
            const u_cubic_Sampler = gl.getUniformLocation(program, 'u_cubic_Sampler')
            gl.uniform1i(u_cubic_Sampler, 0)
            resolve('image loaded')
        }
    })
    return ret
}


const render = (gl: WebGLRenderingContext, renderOptions: renderType[]) => {
    gl.clearColor(0,0,0,0)
    gl.clear(gl.COLOR_BUFFER_BIT)
    for(let i = 0 ; i < renderOptions.length ; i++){
        const { size, matrixKey, matrixValue, matrixTransform, drawMode, source, buffer, program, writeAttribFns } = renderOptions[i]
        gl.useProgram(program)
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
        writeAttribFns.forEach(fn => {
            fn()
        });
        matrixTransform()
        gl.uniformMatrix4fv(matrixKey, false, matrixValue.elements)
        gl.drawArrays(drawMode, 0, size)
    }
}

interface renderType {
    first: number
    size: number
    matrixKey: WebGLUniformLocation
    matrixValue: Matrix4
    matrixTransform: () => Matrix4
    drawMode: number
    isCubic: boolean
    source: Float32Array
    buffer: WebGLBuffer
    program: WebGLProgram
    writeAttribFns: (() => void)[]
}
const ani = (gl: WebGLRenderingContext, renderOptions: renderType[]) => {
    render(gl, renderOptions)
    requestAnimationFrame(() => ani(gl, renderOptions))
}

const init = async () => {
    const gl = prepareCanvas()
    // ?????????????????????
    const {program: program_cubic, locations: locations_cubic} = initShaders(gl, cubicVertexShader, cubicFragmentShader, [
        {name: 'a_cubic_Position', size: 3, index: 0},
        {name: 'a_cubic_Pin', size: 2, index: 3},
    ])
    // ?????????????????????
    const {program: program_particles, locations: locations_particles} = initShaders(gl, particleVertexShader, particleFragmentShader, [
        {name: 'a_particle_Position', size: 3, index: 0},
    ])
    const {source: cubic_source, sourceBuffer: cubic_buffer, sourceSize: cubic_sourceSize, writeAttribFns: cubic_writeAttribFn} = initVertex(gl, program_cubic, cubicSourceOrigin, locations_cubic)
    const {source: particle_source, sourceBuffer: particle_buffer, sourceSize: paticle_sourceSize, writeAttribFns: particles_writeAttribFn} = initVertex(gl, program_particles, particleSourceOrigin, locations_particles)
    gl.enable(gl.CULL_FACE);
    gl.enable(gl.DEPTH_TEST);
    let {
        cubic_modelMatrix,
        u_cubic_ModelMatrix
    } = initCubicMatrix(gl, program_cubic)
    const textureLoaded = await initTexture(gl, program_cubic)
    const cubicAnimation = () => cubic_modelMatrix.multiply(new Matrix4().makeRotationX(0.02)).multiply(new Matrix4().makeRotationY(0.02))
    let {
        particle_modelMatrix,
        u_particle_ModelMatrix
    } = initParticleMatrix(gl, program_particles)
    const particleAnimation = () => particle_modelMatrix.multiply(new Matrix4().makeRotationY(0.02))
    ani(gl, [
        {
            first: 0,
            size: cubic_sourceSize,
            matrixKey: u_cubic_ModelMatrix,
            matrixValue: cubic_modelMatrix,
            matrixTransform: cubicAnimation,
            drawMode: gl.TRIANGLES,
            isCubic: true,
            source: cubic_source,
            buffer: cubic_buffer, 
            program: program_cubic,
            writeAttribFns: cubic_writeAttribFn,
        },
        {
            first: cubic_sourceSize,
            size: paticle_sourceSize,
            matrixKey: u_particle_ModelMatrix,
            matrixValue: particle_modelMatrix,
            matrixTransform: particleAnimation,
            drawMode: gl.POINTS,
            isCubic: false,
            source: particle_source,
            buffer: particle_buffer, 
            program: program_particles,
            writeAttribFns: particles_writeAttribFn,
        },
    ])
}
document.addEventListener("DOMContentLoaded", init);
document.addEventListener("pjax:success", init);