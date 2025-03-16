FROM    docker.io/redhat/ubi9-minimal:latest

RUN     microdnf install tar xz  -y
RUN     cd /opt && curl -L https://dlcdn.apache.org/maven/maven-3/3.9.9/binaries/apache-maven-3.9.9-bin.tar.gz | tar -xJ
RUN     cd /opt && curl -L https://corretto.aws/downloads/latest/amazon-corretto-17-x64-linux-jdk.tar.gz | tar -xJ

ENV     PATH="/opt/apache-maven-3.9.9/bin:/opt/amazon-corretto-17.0.12.7.1-linux-x64/bin:$PATH"
RUN     mkdir /app
WORKDIR /app 
COPY    src  /app/src
COPY    pom.xml run.sh  /app/ 
RUN     mvn clean package 
ENTRYPOINT [ "bash","run.sh" ]

