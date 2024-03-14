precision mediump float;

varying vec2 vTextureCoord;
varying vec2 vResolution;

uniform float iTime;

mat2 rotationMatrix(float theta) {
  float s = sin(theta);
  float c = cos(theta);
  return mat2(c, -s, s, c);
}

vec2 hash(vec2 p) {
  p = vec2( 
    dot(p, vec2(2127.1, 81.17)), 
    dot(p, vec2(1269.5, 283.37)) 
  );

  return fract(sin(p) * 43758.5453);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);

  vec2 u = f * f * (3. - 2. * f);

  float n = mix( 
    mix(dot( -1. + 2. * hash( i + vec2(.0, .0) ), f - vec2(.0, .0) ),
        dot( -1. + 2. * hash( i + vec2(1., .0) ), f - vec2(1., .0) ), 
        u.x),
    mix(dot( -1. + 2. * hash( i + vec2(.0, 1.) ), f - vec2(.0, 1.) ),
        dot( -1. + 2. * hash( i + vec2(1., 1.) ), f - vec2(1., 1.) ), 
        u.x), 
    u.y);

  return .5 + .5 * n;
}

void main(void) {
  vec2 uv = vTextureCoord;
  float ratio = 1.2;
  //float ratio = vResolution.x / vResolution.y;

  vec2 tuv = uv;
  tuv -= .5;

  // rotate with Noise
  float degree = noise(vec2(iTime*.1, tuv.x * tuv.y));

  tuv.y *= 1. / ratio;
  tuv *= rotationMatrix(radians((degree -.5) * 720. + 180.));
  tuv.y *= ratio;

  // Wave warp with sin
  float frequency = 5.;
  float amplitude = 30.;
  float speed = iTime * 2.;
  tuv.x += sin(tuv.y * frequency + speed) / amplitude;
  tuv.y += sin(tuv.x * frequency * 1.5 + speed) / (amplitude * .5);


  // draw the image
  vec3 colorPink = vec3(250., 236., 242.) / 255.;
  vec3 colorBlue = vec3(226., 246., 253.) / 255.;

  vec3 layer1 = mix(colorPink, colorBlue, smoothstep(-.3, .2, (tuv * rotationMatrix(radians(-5.))).x));
  vec3 layer2 = mix(colorBlue, colorPink, smoothstep(-.3, .2, (tuv * rotationMatrix(radians(-5.))).x));
  
  vec3 color = mix(layer1, layer2, smoothstep(.5, -.3, tuv.y));
   
  gl_FragColor = vec4(color, 1.);
}