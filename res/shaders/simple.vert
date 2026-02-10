#version 430 core

struct light {
    vec4 color;
    vec4 pos;
};

in layout(location = 0) vec3 position;
in layout(location = 1) vec3 normal_in;
in layout(location = 2) vec2 textureCoordinates_in;

uniform layout(location = 3) mat4 view;
uniform layout(location = 4) mat4 projection;
uniform layout(location = 5) mat4 model_matrix;
uniform layout(location = 6) vec3 ball_center;

uniform light lights[3];

out layout(location = 0) vec3 normal_out;
out layout(location = 1) vec2 textureCoordinates_out;
out layout(location = 2) vec3 out_position;
out layout(location = 3) vec3 out_ball_center;

out layout(location = 4) light[3] out_lights;

void main()
{
    out_lights = lights;
    out_ball_center = ball_center;
    normal_out = normalize(mat3(transpose(inverse(model_matrix))) * normal_in);

    textureCoordinates_out = textureCoordinates_in;
    gl_Position = projection * view * model_matrix * vec4(position, 1.0f);
    out_position = vec3(model_matrix * vec4(position, 1.0f));
}
