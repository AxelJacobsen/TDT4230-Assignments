#version 430 core

struct light {
    vec4 color;
    vec4 pos;
};


in layout(location = 0) vec3 normal;
in layout(location = 1) vec2 textureCoordinates;
in layout(location = 2) vec3 position;
in layout(location = 3) vec3 ball_center;

in layout(location = 4) light[3] lights;

out vec4 color;

float rand(vec2 co) { return fract(sin(dot(co.xy, vec2(12.9898,78.233))) * 43758.5453); }
float dither(vec2 uv) { return (rand(uv)*2.0-1.0) / 256.0; }

float sphereRad = 1.0;

vec3 reject(vec3 from, vec3 onto) {
    return from - onto*dot(from, onto)/dot(onto, onto);
}

void main()
{
    //Static values
    vec3 normalizedNormal = normalize(normal);
    vec3 ambientColor = vec3(1.0, 0.9, 0.9);
    int numberOfLights = lights.length();

    //Ambient
    float ambientStrength = 0.05;
    vec3 ambient = ambientStrength * ambientColor;

    vec3 accumulatedDiffuse = vec3(0.0,0.0,0.0);
    vec3 accumulatedSpecular = vec3(0.0,0.0,0.0);
    vec3 accumulatedLight = vec3(0.0,0.0,0.0);

    for (int i = 0; i < 3; i++) {
        // Diffuse
        vec3 lightDir = normalize(vec3(lights[i].pos) - position);
        float diffuseIntensity = max(dot(lightDir, normalizedNormal), 0.0);
        vec3 diffuseColor = vec3(lights[i].color) * diffuseIntensity;
        accumulatedDiffuse = diffuseColor;

        // specular
        float specularStrength = 0.5;
        vec3 viewDir = normalize(vec3(lights[i].pos) - position);
        vec3 reflectDir = reflect(-lightDir, normalizedNormal);  
        float spec = pow(max(dot(viewDir, reflectDir), 0.0), 8);
        vec3 specular = specularStrength * spec * vec3(lights[i].color); 
        accumulatedSpecular = specular;
        
        //Fall off
        float dist = distance(vec3(lights[i].pos), position);

        float La = 0.01;
        float Lb = 0.001;
        float Lc = 0.001;

        float L = 1/(La + dist * Lb + (dist*dist)*Lc);

        // Ray tracing
        vec3 lightVec = position - vec3(lights[i].pos);
        vec3 otherVec = position - ball_center;

        vec3 rejected = reject(lightVec, otherVec);
        if (dot(lightVec, otherVec) < 0 || length(lightVec) < length(otherVec)) {
            //accumulatedLight = L * (accumulatedDiffuse + accumulatedSpecular);
        } else if (length(rejected) < sphereRad) {
            float edgeFactor = clamp(length(rejected) / sphereRad, 0.0, 1.0);
            float softFactor = smoothstep(0.0, 1.0, edgeFactor);
            float visibility = mix(0.0, 1.0, softFactor);

            accumulatedLight += visibility * L * (accumulatedDiffuse + accumulatedSpecular);
            continue;
        };

        accumulatedLight = accumulatedLight + L * (accumulatedDiffuse + accumulatedSpecular);
    }

    color = vec4(ambient + accumulatedLight + dither(textureCoordinates), 1.0);
    //color = vec4(5/distance(vec3(lights[0].pos), position), 5/distance(vec3(lights[1].pos), position), 5/distance(vec3(lights[2].pos), position), 1.0);
}