CCProgram EdgeHighlight {
    precision highp float;
    
    #include <cc-global>

    uniform vec4 u_edgeColor; 
    uniform float u_edgeWidth; 

    in vec2 v_uv0;

    void main () {
        vec4 srcColor = texture(samplerTexture, v_uv0);

        vec4 borderColor = vec4(0.0, 0.0, 0.0, 0.0);
        if (v_uv0.x < u_edgeWidth || v_uv0.x > 1.0 - u_edgeWidth ||
            v_uv0.y < u_edgeWidth || v_uv0.y > 1.0 - u_edgeWidth) {
            borderColor = u_edgeColor;
        }

        gl_FragColor = srcColor + borderColor;
    }
}
