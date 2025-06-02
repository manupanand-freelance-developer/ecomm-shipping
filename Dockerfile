# -----------------------------
# Build stage
# -----------------------------
FROM docker.io/redhat/ubi9-minimal:latest AS build

# Install tools
RUN microdnf install -y tar xz gzip
# Install Amazon Corretto JDK 17 (ARM)
RUN cd /opt && \
    curl -LO https://corretto.aws/downloads/latest/amazon-corretto-17-aarch64-linux-jdk.tar.gz && \
    tar -xzf amazon-corretto-17-aarch64-linux-jdk.tar.gz && \
    mv amazon-corretto-17.* amazon-corretto-17

# Install Maven
RUN cd /opt && \
    curl -LO https://dlcdn.apache.org/maven/maven-3/3.9.9/binaries/apache-maven-3.9.9-bin.tar.gz && \
    tar -xzf apache-maven-3.9.9-bin.tar.gz && \
    mv apache-maven-3.9.9 apache-maven
# Set environment paths

ENV JAVA_HOME=/opt/amazon-corretto-17
ENV PATH=$JAVA_HOME/bin:/opt/apache-maven/bin:$PATH

# Build application
WORKDIR /app
COPY src /app/src
COPY pom.xml run.sh /app/
RUN mvn clean package

# -----------------------------
# Runtime stage
# -----------------------------
FROM docker.io/redhat/ubi9-minimal:latest

# Install tools
RUN microdnf install -y tar xz gzip bash

# Install Amazon Corretto JDK 17
RUN cd /opt && \
    curl -LO https://corretto.aws/downloads/latest/amazon-corretto-17-aarch64-linux-jdk.tar.gz && \
    tar -xzf amazon-corretto-17-aarch64-linux-jdk.tar.gz && \
    mv amazon-corretto-17.* amazon-corretto-17

# Set environment path
ENV JAVA_HOME=/opt/amazon-corretto-17
ENV PATH=$JAVA_HOME/bin:$PATH


# Create app directory and copy built jar and run.sh
WORKDIR /app
COPY --from=build /app/target/shipping-1.0.jar /app/shipping.jar
COPY --from=build /app/run.sh /app/

# Make run.sh executable
RUN chmod +x /app/run.sh

# NewRelic agent can be added here if needed

ENTRYPOINT ["bash", "./run.sh"]
