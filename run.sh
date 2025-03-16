# to make sure that environment variables are present before running image


if [ -z "${CART_ENDPOINT}"]; then
    echo Input CART_ENDPOINT is missing
    exit 1
fi


if [ -z "${DB_HOST}"]; then
    echo Input DB_HOST is missing
    exit 1
fi




java -jar /app/target/shipping-1.0.jar