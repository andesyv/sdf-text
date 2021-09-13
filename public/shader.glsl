#include <common>

#define MAX_STEPS 100
#define EPS 0.01
#define LINE_COUNT @LINE_COUNT@
const float tanCoefficients = 0.5 * (PI / 180.0);

struct Line {
    vec3 start;
    vec3 end;
    float radius;
};

uniform vec3 iResolution;
uniform float iTime;
uniform Line lines[LINE_COUNT];

mat4 perspective(float n, float f, float aspect, float FOV) {
    float S = 1.0 / tan(FOV * tanCoefficients);

    return mat4(
        S, 0, 0, 0,
        0, S, 0, 0,
        0, 0, -f/(f-n), -1.0,
        0, 0, (-2.0 * f * n) / (f-n), 0
    );
}

vec4 makeQuat(float rad, vec3 axis) {
    return vec4(sin(rad * 0.5) * axis, cos(rad * 0.5));
}

vec4 mulQuat(vec4 q1, vec4 q2) {
    return vec4(
        cross(q1.xyz, q2.xyz) + q1.w * q2.xyz + q2.w * q1.xyz,
        q1.w * q2.w - dot(q1.xyz, q2.xyz)
    );
}

mat3 quatToRot(vec4 q) {
    return mat3(
        1.0 - 2.0*q.y*q.y - 2.0*q.z*q.z,2.0*q.x*q.y - 2.0*q.z*q.w,      2.0*q.x*q.z + 2.0*q.y*q.w,
        2.0*q.x*q.y + 2.0*q.z*q.w,      1.0 - 2.0*q.x*q.x - 2.0*q.z*q.z,2.0*q.y*q.z - 2.0*q.x*q.w,
        2.0*q.x*q.z - 2.0*q.y*q.w,      2.0*q.y*q.z + 2.0*q.x*q.w,      1.0 - 2.0*q.x*q.x - 2.0*q.y*q.y
    );
}

mat4 translate(mat4 mat, vec3 pos) {
    mat4 t = mat4(1.0);
    t[3].xyz = pos;
    return t * mat;
}

float sdf(Line l, vec3 p) {
    vec3 ab = l.end - l.start;
    float t = dot(p - l.start, ab) / dot(ab, ab);
    t = clamp(t, 0., 1.0);
    vec3 closest = l.start + t * ab;
    return length(closest - p) - l.radius;
}

vec3 gradient(Line l, vec3 p) {
    return vec3(
        sdf(l, vec3(p.x+EPS, p.y, p.z)) - sdf(l, vec3(p.x-EPS, p.y, p.z)),
        sdf(l, vec3(p.x, p.y+EPS, p.z)) - sdf(l, vec3(p.x, p.y-EPS, p.z)),
        sdf(l, vec3(p.x, p.y, p.z+EPS)) - sdf(l, vec3(p.x, p.y, p.z-EPS))
    );
}

// polynomial smooth min (k = 0.1);
float smin( float a, float b, float k )
{
    float h = clamp( 0.5+0.5*(b-a)/k, 0.0, 1.0 );
    return mix( b, a, h ) - k*h*(1.0-h);
}

void mainImage(out vec4 fragColor, in vec2 texCoords) {
    vec2 uv = 2.0 * texCoords / iResolution.xy - 1.0;
    // vec2 mPos = 2.0 * iMouse.xy / iResolution.xy - 1.0;
    vec2 mPos = vec2(sin(iTime * 0.1), 0.0);

    mat4 pMat = perspective(0.1, 100.0, iResolution.x / iResolution.y, 60.0);
    mat4 vMat = translate(mat4(quatToRot(
        mulQuat(
            makeQuat(mPos.x * PI, vec3(0., 1.0, 0.)),
            makeQuat(mPos.y * PI, vec3(1., 0.0, 0.))
        )
    )), vec3(0., 0., -10.0));

    mat4 MVP = inverse(pMat * vMat);
    
    vec4 near = MVP * vec4(uv, -1.0, 1.0);
    near /= near.w;
    vec4 far = MVP * vec4(uv, 1.0, 1.0);
    far /= far.w;


    vec4 ro = vec4(near.xyz, 0.0);
    vec4 rd = vec4((far - near).xyz, 1.0);
    float farDist = length(rd.xyz);
    rd.xyz /= farDist;

    vec4 lightPos = MVP * vec4(0., 0., -1.0, 1.0);
    lightPos /= lightPos.w;


    for (int i = 0; i < MAX_STEPS; ++i) {
        vec3 p = ro.xyz + ro.w * rd.xyz;

        float dist = farDist;
        int closestId = 0;
        vec3 g;
        for (int j = 0; j < LINE_COUNT; j++) {
            float d = sdf(lines[j], p);
            dist = smin(d, dist, 0.5);
            if (d < dist) {
                closestId = j;
            }
        }

        if (dist < EPS) {
            vec3 g = gradient(lines[closestId], p);
            vec3 normal = normalize(g);
            vec3 lightDir = normalize(lightPos.xyz - p);
            vec3 phong = max(dot(normal, lightDir), 0.15) * vec3(0.0, 0.5, 1.0);
            
            fragColor = vec4(phong, 1.0);
            return;
        }

        ro.w += dist;
        if (farDist < ro.w)
            break;
    }

    fragColor = vec4(rd.xyz, 1.0);
}

void main() {
  mainImage(gl_FragColor, gl_FragCoord.xy);
}