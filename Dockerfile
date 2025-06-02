# -----------------------------
# Build stage
# -----------------------------
FROM docker.io/redhat/ubi9-minimal:latest AS build

# Install tools
RUN microdnf install -y tar xz 

# Install Maven
RUN cd /opt && curl -LO https://dlcdn.apache.org/maven/maven-3/3.9.9/binaries/apache-maven-3.9.9-bin.tar.gz \
    && tar -xzf apache-maven-3.9.9-bin.tar.gz

# Install Amazon Corretto JDK 17
RUN cd /opt && curl -LO https://corretto.aws/downloads/latest/amazon-corretto-17-x64-linux-jdk.tar.gz \
    && tar -xzf amazon-corretto-17-x64-linux-jdk.tar.gz

# Set environment paths
ENV PATH="/opt/apache-maven-3.9.9/bin:/opt/amazon-corretto-17.*/bin:$PATH"

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
RUN microdnf install -y tar xz  bash

# Install Amazon Corretto JDK 17
RUN cd /opt && curl -LO https://corretto.aws/downloads/latest/amazon-corretto-17-aarch64-linux-jdk.tar.gz\
    && tar -xzf  amazon-corretto-17-aarch64-linux-jdk.tar.gz

# Set environment path
ENV PATH="/opt/amazon-corretto-17.*/bin:$PATH"

# Create app directory and copy built jar and run.sh
WORKDIR /app
COPY --from=build /app/target/shipping-1.0.jar /app/shipping.jar
COPY --from=build /app/run.sh /app/

# Make run.sh executable
RUN chmod +x /app/run.sh

# NewRelic agent can be added here if needed

ENTRYPOINT ["bash", "./run.sh"]
