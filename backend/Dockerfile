FROM alpine:3.20

ENV GOLANG_VERSION=1.24.4
ENV PATH="/usr/local/go/bin:$PATH"

RUN apk update && apk add --no-cache \
  build-base \
  openjdk17 \
  nodejs \
  npm \
  python3 \
  tar \
  wget && \
  wget https://go.dev/dl/go${GOLANG_VERSION}.linux-amd64.tar.gz && \
  tar -C /usr/local -xzf go${GOLANG_VERSION}.linux-amd64.tar.gz && \
  rm go${GOLANG_VERSION}.linux-amd64.tar.gz

WORKDIR /app

COPY . .

RUN go mod download && \
  CGO_ENABLED=0 GOOS=linux go build -o server .

EXPOSE 5000

CMD ["./server"]
