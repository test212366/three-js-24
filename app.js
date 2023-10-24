import * as THREE from 'three'
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls'
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader' 
import GUI from 'lil-gui'
import gsap from 'gsap'
import fragmentShader from './shaders/fragment.glsl'
import vertexShader from './shaders/vertex.glsl'

import fragmentShader1 from './shaders/fragment1.glsl'
import vertexShader1 from './shaders/vertex1.glsl'
 
import {EffectComposer} from 'three/examples/jsm/postprocessing/EffectComposer'
import {RenderPass} from 'three/examples/jsm/postprocessing/RenderPass'
import {ShaderPass} from 'three/examples/jsm/postprocessing/ShaderPass'
import {GlitchPass} from 'three/examples/jsm/postprocessing/GlitchPass'
import { DotScreenShader } from './CustomShader'
export default class Sketch {
	constructor(options) {
		
		this.scene = new THREE.Scene()
		
		this.container = options.dom
		
		this.width = this.container.offsetWidth
		this.height = this.container.offsetHeight
		
		
		// // for renderer { antialias: true }
		this.renderer = new THREE.WebGLRenderer({ antialias: true })
		this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
		this.renderTarget = new THREE.WebGLRenderTarget(this.width, this.height)
		this.renderer.setSize(this.width ,this.height )
		this.renderer.setClearColor(0xeeeeee, 1)
		this.renderer.useLegacyLights = true
		this.renderer.outputEncoding = THREE.sRGBEncoding
 

		 
		this.renderer.setSize( window.innerWidth, window.innerHeight )

		this.container.appendChild(this.renderer.domElement)
 


		this.camera = new THREE.PerspectiveCamera( 70,
			 this.width / this.height,
			 0.01,
			 100
		)
 
		this.camera.position.set(0, 0, 1.3) 
		this.controls = new OrbitControls(this.camera, this.renderer.domElement)
		this.time = 0


		this.dracoLoader = new DRACOLoader()
		this.dracoLoader.setDecoderPath('https://www.gstatic.com/draco/v1/decoders/')
		this.gltf = new GLTFLoader()
		this.gltf.setDRACOLoader(this.dracoLoader)

		this.isPlaying = true
	 
		this.addObjects()		 
		this.initPos()
		this.resize()
		this.render()
 
		this.setupResize()
 
 
	}
	initPos() {
		this.composer = new EffectComposer(this.renderer)
		this.composer.addPass(new RenderPass(this.scene, this.camera))

		const eff1 = new ShaderPass(DotScreenShader)
	eff1.uniforms.scale.value = 4

		this.composer.addPass(eff1)

	}

	settings() {
		let that = this
		this.settings = {
			progress: 0
		}
		this.gui = new GUI()
		this.gui.add(this.settings, 'progress', 0, 1, 0.01)
	}

	setupResize() {
		window.addEventListener('resize', this.resize.bind(this))
	}

	resize() {
		this.width = this.container.offsetWidth
		this.height = this.container.offsetHeight
		this.renderer.setSize(this.width, this.height)
		this.composer.setSize(this.width, this.height)
		this.camera.aspect = this.width / this.height


 

		this.camera.updateProjectionMatrix()



	}


	addObjects() {

		this.cubeRenderTarget = new THREE.WebGLCubeRenderTarget(256, {
			format: THREE.RGBAFormat,
			minFilter: THREE.LinearMipMapLinearFilter,
			generateMipmaps: true,
			encoding: THREE.sRGBEncoding
		})



		this.cubeCamera = new THREE.CubeCamera(0.1, 10,this.cubeRenderTarget)
	


		let that = this
		this.material = new THREE.ShaderMaterial({
			extensions: {
				derivatives: '#extension GL_OES_standard_derivatives : enable'
			},
			side: THREE.DoubleSide,
			uniforms: {
				time: {value: 0},
				resolution: {value: new THREE.Vector4()}
			},
			vertexShader,
			fragmentShader,
		 
		})
		
		this.geometry = new THREE.SphereGeometry(1.5,32, 32)
		this.plane = new THREE.Mesh(this.geometry, this.material)
 
		this.scene.add(this.plane)




		let geo = new THREE.SphereGeometry(0.4, 32, 32)
		this.mat = new THREE.ShaderMaterial({
			extensions: {
				derivatives: '#extension GL_OES_standard_derivatives : enable'
			},
			side: THREE.DoubleSide,
			uniforms: {
				time: {value: 0},
				tCube: {value: 0},
				resolution: {value: new THREE.Vector4()}
			},
			vertexShader: vertexShader1,
			fragmentShader: fragmentShader1,
		 
		})

		this.smallSphere = new THREE.Mesh(geo, this.mat)
		this.scene.add(this.smallSphere)
 
	}



	addLights() {
		const light1 = new THREE.AmbientLight(0xeeeeee, 0.5)
		this.scene.add(light1)
	
	
		const light2 = new THREE.DirectionalLight(0xeeeeee, 0.5)
		light2.position.set(0.5,0,0.866)
		this.scene.add(light2)
	}

	stop() {
		this.isPlaying = false
	}

	play() {
		if(!this.isPlaying) {
			this.isPlaying = true
			this.render()
		}
	}

	render() {
		if(!this.isPlaying) return
		this.time += 0.01

		this.smallSphere.visible = false
		this.cubeCamera.update(this.renderer, this.scene)
		this.smallSphere.visible = true
		
		
		this.mat.uniforms.tCube.value = this.cubeRenderTarget.texture
 
		this.material.uniforms.time.value = this.time
		 
		//this.renderer.setRenderTarget(this.renderTarget)
		// this.renderer.render(this.scene, this.camera)
		//this.renderer.setRenderTarget(null)
 
		requestAnimationFrame(this.render.bind(this))

		this.composer.render(this.scene, this.camera)
	}
 
}
new Sketch({
	dom: document.getElementById('container')
})
 