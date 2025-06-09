FROM        maven
RUN         mkdir /app
RUN         useradd -d /app roboshop
WORKDIR     /app
RUN         chown roboshop:roboshop /app
USER        roboshop
COPY        src/ /app/src/
COPY        pom.xml /app/pom.xml
RUN         mvn clean package




FROM        redhat/ubi9
RUN         dnf install java-17-openjdk -y
RUN         dnf clean all
RUN         mkdir /app
RUN         useradd -d /app roboshop
WORKDIR     /app
RUN         chown roboshop:roboshop /app
USER        roboshop
COPY        --from=0 /app/target/shipping-1.0.jar /app/shipping.jar
COPY        newrelic/ /app/newrelic/
COPY        run.sh /app
ENTRYPOINT  ["bash", "/app/run.sh"]
