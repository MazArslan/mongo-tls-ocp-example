## create CA PEM file

printf "\n\nCOMMON NAME MUST BE DIFFERENT BETWEEN ROOT CA AND THE INTERMEDIATE CERT\n\n"

printf "Creating Intermediate Cert Auth\n"

openssl genrsa -out mongodb-test-ca.key

openssl req -new -x509 -days 1826 -key mongodb-test-ca.key -out mongodb-test-ca.crt -config openssl-test-ca.cnf

openssl genrsa -out mongodb-test-ia.key 4096

printf "Creating Root Cert Auth\n"

openssl req -new -key mongodb-test-ia.key -out mongodb-test-ia.csr -config openssl-test-ca.cnf

openssl x509 -sha256 -req -days 730 -in mongodb-test-ia.csr -CA mongodb-test-ca.crt -CAkey mongodb-test-ca.key -set_serial 01 -out mongodb-test-ia.crt -extfile openssl-test-ca.cnf -extensions v3_ca

cat mongodb-test-ca.crt mongodb-test-ia.crt  > test-ca.pem

## server certs

openssl genrsa -out mongodb-test-server1.key 4096

openssl req -new -key mongodb-test-server1.key -out mongodb-test-server1.csr -config openssl-test-server.cnf

openssl x509 -sha256 -req -days 365 -in mongodb-test-server1.csr -CA mongodb-test-ia.crt -CAkey mongodb-test-ia.key -CAcreateserial -out mongodb-test-server1.crt -extfile openssl-test-server.cnf -extensions v3_req

cat mongodb-test-server1.crt mongodb-test-server1.key > test-server1.pem

## client certs

openssl genrsa -out mongodb-test-client.key 4096

echo "The client certificate subject must differ to a server certificate subject with regards to at least one of the following attributes: Organization (O), the Organizational Unit (OU) or the Domain Component (DC)."

openssl req -new -key mongodb-test-client.key -out mongodb-test-client.csr -config openssl-test-client.cnf

openssl x509 -sha256 -req -days 365 -in mongodb-test-client.csr -CA mongodb-test-ia.crt -CAkey mongodb-test-ia.key -CAcreateserial -out mongodb-test-client.crt -extfile openssl-test-client.cnf -extensions v3_req

cat mongodb-test-client.crt mongodb-test-client.key > test-client.pem


## notes

# sudo cp test-server1.pem /etc/mongocerts/tls/

# sudo cp test-ca.pem /etc/mongocerts/tls/


# sudo chown mongod:mongod /etc/mongocerts/tls

# sudo chmod -R 755 /etc/mongocerts/tls

# to start mongo
# mongod --tlsMode requireTLS --tlsCertificateKeyFile test-server1.pem  --tlsCAFile test-ca.pem

# to connect to mongo
# mongosh --tls --host <serverHost> --tlsCertificateKeyFile test-client.pem  --tlsCAFile test-ca.pem

# mongo --tls --tlsCAFile certauth.crt --tlsCertificateKeyFile mongodb.pem