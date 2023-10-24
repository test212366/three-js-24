uniform float time;
varying vec2 vUv;
varying vec3 vPosition;
uniform vec2 pixels;
uniform vec3 uMin;
float PI = 3.1415926;

 

varying vec3 vReflect;
varying vec3 vRefract[3];
varying float vReflectionFactor;



void main () {
	vUv = uv;

	float mRefractionRatio = 1.02;
	float mFresnelBias = 0.1;
	float mFresnelScale = 4.;
	float mFresnelPower = 2.;


	vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);

	vec4 worldPosition = modelMatrix * vec4(position, 1.0);


	vec3 worldNormal = normalize(mat3(modelMatrix[0].xyz, modelMatrix[1].xyz, modelMatrix[2].xyz) * normal);

	vec3 i = worldPosition.xyz - cameraPosition;


	vReflect = reflect(i, worldNormal);
	vRefract[0] = refract(normalize(i), worldNormal, mRefractionRatio);
	vRefract[1] = refract(normalize(i), worldNormal, mRefractionRatio * 0.99);
	vRefract[2] = refract(normalize(i), worldNormal, mRefractionRatio * 0.98);
	vReflectionFactor = mFresnelBias + mFresnelScale * pow(1.0 + dot(normalize(i), worldNormal), mFresnelPower);

	gl_Position = projectionMatrix * mvPosition;

 
 
}