FROM mcr.microsoft.com/devcontainers/typescript-node:24-trixie

COPY --from=pkgxdev/pkgx:v2 /usr/local/bin/pkgx /usr/local/bin/pkgm /usr/local/bin/

COPY --from=jdxcode/mise:2026.3 /usr/local/bin/mise /usr/local/bin/mise
