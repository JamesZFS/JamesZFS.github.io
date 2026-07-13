#version 330
// Lissajous curve
// from https://www.shadertoy.com/view/XdSGzh
// x(t) = A * sin(a * t + d)
// y(t) = B * sin(b * t)

const float PI = 3.14159;
const int steps = 200;

uniform vec2 u_resolution;
uniform vec2 u_pitch;
uniform vec2 u_volume;
uniform float u_phase;
uniform float u_rotation;  // will be set to 1 / gcd(a, b) to make the curve closed, when a / b is approximately rational
uniform int u_band_a;  // -1: full rainbow, 0~11: [i/12, (i+1)/12] of the rainbow
uniform int u_band_b;

out vec4 o_color;

vec3 normalizeLuminance(vec3 color, float targetLuminance) {
    color = pow(color, vec3(2.2));
    float currentLuminance = dot(color, vec3(0.2126, 0.7152, 0.0722));
    if (currentLuminance > 0.0) {
        color *= (targetLuminance / currentLuminance);
    }
    color = pow(color, vec3(1.0/2.2));
    return color;
}

// cosine based palette, 4 vec3 params
// from https://iquilezles.org/articles/palettes/
vec3 palette( in float t, in vec3 a, in vec3 b, in vec3 c, in vec3 d )
{
    return a + b*cos( 6.283185*(c*t+d) );
}
vec3 rainbow(in float t) {  // t in [0, 1]
    return palette(t, vec3(0.5), vec3(0.5), vec3(1.0), vec3(0.00, 0.33, 0.67));
}
// Take [band_min, band_max] from the rainbow map and fold it into [0, 1] to create a banded palette effect
vec3 bandedRainbow(in float t, in float band_min, in float band_max) {
    float t_tild = fract(t);
    float h = 1.0 - 2.0 * abs(t_tild - 0.5);  // fold [0, 1] into [0, 1] with a peak at 0.5
    float phi = mix(band_min, band_max, h);
    // return rainbow(phi);
    return normalizeLuminance(rainbow(phi), 0.2);
}

// Official HSV to RGB conversion 
// from https://www.shadertoy.com/view/MsS3Wc
vec3 hsv2rgb( in vec3 c )
{
    vec3 rgb = clamp( abs(mod(c.x*6.0+vec3(0.0,4.0,2.0),6.0)-3.0)-1.0, 0.0, 1.0 );

	rgb = rgb*rgb*(3.0-2.0*rgb); // cubic smoothing	

	return c.z * mix( vec3(1.0), rgb, c.y);
}

vec2 lissajous(float t, float A, float a, float B, float b, float d)
{
	return vec2(A * sin(a*t+d), B * sin(b*t));
}

void main()
{
	vec2 uv = (gl_FragCoord.xy / u_resolution.xy)*2.0-1.0;
	uv.x *= u_resolution.x / u_resolution.y;

    float A = u_volume.x;
	float a = u_pitch.x;
    float B = u_volume.y;
	float b = u_pitch.y;
	float d = u_phase;
	
	float m = 1.0;
	float period = 2.0 * PI * u_rotation;
    vec2 lp = lissajous(0.0, A, a, B, b, d)*0.9;

    vec3 col = vec3(0.0);
    float normalizer = 0.0;
    for(int i = 1; i <= steps; i++) 
    {
        float ratio = float(i) / float(steps);
        float t = ratio * period;
        vec2 p = lissajous(t, A, a, B, b, d)*0.9;
		
		// distance to line
        vec2 pa = uv - p;
        vec2 ba = lp - p;
        float h = clamp( dot(pa,ba)/dot(ba,ba), 0.0, 1.0 );
        vec2 q = pa - ba*h;  // height vector from line segment to uv
        float curr_dist = length(q);
        m = min(m, curr_dist);
        // col += hsv2rgb(vec3(ratio, 1.0, 1.0)) / (curr_dist + 0.01);  // blend neon color effect
        float w = 1.0 / (curr_dist*curr_dist + 0.01);
        if (u_band_a >= 0) {
            vec3 cola = bandedRainbow(t / PI, float(u_band_a) / 12.0, float(u_band_a + 1) / 12.0) * w;
            if (u_band_b < 0) {
                col += cola;
            } else {
                vec3 colb = bandedRainbow(t / PI, float(u_band_b) / 12.0, float(u_band_b + 1) / 12.0) * w;
                float blend = fract(2.0 * (t + u_phase) / PI);
                blend = 1.0 - 2.0 * abs(blend - 0.5);  // triangle wave
                blend = smoothstep(0.45, 0.55, blend);  // smooth transition between the two bands
                col += mix(cola, colb, blend);
            }
        } else {
            col += rainbow(t / (2.0 * PI)) * w;
        }
        normalizer += w;
        // normalizer += 1.0;
		
        lp = p;
    }
    col /= normalizer;
    col = 0.05 * col / (m + 0.01);  // enhance neon effect
    // col = 1.0 - exp(-col);  // tone mapping, see https://www.shadertoy.com/view/3s3GDn

	o_color = vec4(col, 1.0);
}