#!/bin/bash
# to make sure that environment variables are present before running image


if [ -z "${CART_ENDPOINT}" ]; then
    echo Input CART_ENDPOINT is missing
    exit 1
fi


if [ -z "${DB_HOST}" ]; then
    echo Input DB_HOST is missing
    exit 1
fi




# # java -jar /app/target/shipping-1.0.jar
# java -jar /app/target/*.jar

ls -la /app/target
pwd

# Find the JAR file safely (skip test/original jars)
# JAR_FILE=$(find /app/target -type f -name "*.jar" | grep -v "original" | head -n 1)

# if [ -z "$JAR_FILE" ]; then
#     echo "❌ No runnable JAR found in /app/target"
#     exit 1
# fi

 echo "✅ Starting application :"
# exec java -jar "$JAR_FILE"
 java -jar /app/target/*.jar