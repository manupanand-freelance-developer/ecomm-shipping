# -----------------------------
# Build stage
# -----------------------------
FROM maven:3.9.2-amazoncorretto-17 AS build

# Create app directory and build
WORKDIR /app
COPY src ./src
COPY pom.xml run.sh ./
# build application
RUN mvn clean package

# -----------------------------
# Runtime stage
# -----------------------------
FROM docker.io/redhat/ubi9-minimal:latest

# Install required packages
RUN microdnf install -y tar xz gzip bash  && microdnf clean all

# Install Amazon Corretto JDK 17 (ARM64)
RUN cd /opt && \
    curl -LO https://corretto.aws/downloads/latest/amazon-corretto-17-aarch64-linux-jdk.tar.gz && \
    tar -xzf amazon-corretto-17-aarch64-linux-jdk.tar.gz && \
    mv amazon-corretto-17.* amazon-corretto-17

# Set environment path
ENV JAVA_HOME=/opt/amazon-corretto-17
ENV PATH=$JAVA_HOME/bin:$PATH

# Create user and app directory
RUN useradd -r -d /app roboshop && mkdir -p /app && chown roboshop:roboshop /app
WORKDIR /app
USER roboshop

# Copy app and agent files
COPY --from=build /app/target /app/target
# COPY newrelic/ /app/newrelic/

#RUN chmod +x /app/run.sh

ENTRYPOINT ["bash", "/app/run.sh"]
