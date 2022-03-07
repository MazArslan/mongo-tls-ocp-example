# Run Locally

## Certificates

## Update alt-names for DNS

Add the DNS for openshift for DNS.2

```
[ alt_names ]
DNS.2 = *.apps.eu46.prod.nextcle.com 
```

### run the generate script

```
certs/generate.sh
```

## Run mongoDB

### stop mongoDB

sudo systemctl stop mongodb.service

## Run mongoDB with TLS

cd certs/

sudo mongod --tlsMode requireTLS --tlsCertificateKeyFile test-server1.pem --tlsCAFile test-ca.pem --config /etc/mongod.conf

## to connect to mongoDB locally

mongo --tls -tlsCAFile test-ca.pem --tlsCertificateKeyFile test-client.pem


## Start the NodeJS API

### Setting up tls mongo on node

'''
mongoose.connect(mongoDb.db, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    tls: true,
    // tls cert key file location
    tlsCAFile: `../certs/test-ca.pem`,
    // tls cert auth file location
    tlsCertificateKeyFile: `../certs/test-client.pem`
}).then(()=> {
    console.log('Database sucessfully connected ')
    }, error => {
        console.log('Database error: ' + error)
    }
)
'''

## to start the NodeJS API

cd node-rest-api

npm i

npm start

## to start the angular app  
cd my-app

ng build

ng serve --configuration development --open


# Run on Openshift

## create a new project on OpenShift

oc new project mongo-tls


## Certificates

### Import the certificates as configMaps

oc create configmap ca --from-file=certs/test-ca.pem

oc create configmap server --from-file=certs/test-server1.pem

oc create configmap client --from-file=certs/test-client.pem

### create secrets on openshift (might be unnecceray)

oc create secret generic clientcert --from-file certs/test-client.pem

oc create secret generic servercerts --from-file certs/test-server1.pem

oc create secret generic cafile --from-file certs/test-ca.pem


## Creating a mongoDB server with tls on Openshift

### Import image from docker hub

```
oc import image mongo:latest --confirm
```

### Create mongoDB instance

from openshift UI in developer view, from 'container image', select 'Image stream tag from internal registry'. select mongo, mongo, as deployment config. 

oc new-app mongo

oc expose service mongo


### Adding tls to mongo on openshift

#### Update mongo deployment to include items

deployment -> mongo -> yaml

to include: 
```
spec:
  template:
    spec:
      volumes:
        ......
        ......
        - name: cert-auth
          configMap:
            name: ca
            items:
              - key: test-ca.pem
                path: test-ca.pem
            defaultMode: 420
        - name: server-cert
          configMap:
            name: server
            items:
              - key: test-server1.pem
                path: test-server1.pem
            defaultMode: 420
....
      contianers:
        - resources:
          volumeMounts:
            .....
            .....
            - name: cert-auth
              mountPath: /etc/mongo/tls/ca
            - name: server-cert
              mountPath: /etc/mongo/tls/server
          ..
          ..
          args:
            - '--tlsMode'
            - requireTLS
            - '--tlsCertificateKeyFile'
            - /etc/mongo/tls/server/test-server1.pem
            - '--tlsCAFile'
            - /etc/mongo/tls/ca/test-ca.pem    
```


## Get the NodeJS API running

developer view -> from github (add github URL)-> context dir `/node-rest-api`-> nodeJS -> expose 8000

add to deployment.yaml

```
spec:
  template:
    spec:
      volumes:
        - name: cert-auth
          configMap:
            name: ca
            items:
              - key: test-ca.pem
                path: /mongo/ca/test-ca.pem
        - name: client-cert
          configMap:
            name: client
            items:
              - key: test-client.pem
                path: mongo/client/test-client.pem
      containers:
        - resources :{}
          ....
          ....
          env:
            - name: TLS_CA_FILE
              value: /mongo/ca/test-ca.pem
            - name: TLS_CERT_KEY_FILE
              value: /mongo/client/test-client.pem
            - name: MONGO_URL
              value: 'mongodb://<!!!!ADD_MONGO_URL!!!!>:27017/db'
          ....
          ....
          volumeMounts:
            - name: cert-auth
              mountPath: /mongo/ca
            - name: client-cert
              mountPath: /mongo/client
          ....
      
```
<!-- 
## Set env variables on node js

oc set env app-name MONGOURL='mongodb://<MongoDB-service-name>:21017/db'

oc set env app-name MONGOURL='mongodb://<MongoDB-service-name>:21017/db' 
-->

## Run the Angular WebApp.

### Update Enviroment.prod 

## Create the angular app

create angular using dockerfile

developer view -> add-> from dockerfile -> github url -> container port = 4200 




### references:

https://docs.mongodb.com/manual/appendix/security/appendixA-openssl-ca/#appendix-ca-certificate
https://docs.mongodb.com/manual/appendix/security/appendixB-openssl-server/#appendix-server-certificate
https://docs.mongodb.com/manual/appendix/security/appendixC-openssl-client/
https://jamielinux.com/docs/openssl-certificate-authority/create-the-intermediate-pair.html
https://docs.mongodb.com/manual/tutorial/configure-ssl-clients/#std-label-mongo-connect-require-client-certificates-tls
https://www.tutsmake.com/angular-13-mongodb-example-with-node-js-express/
https://docs.mongodb.com/manual/tutorial/configure-ssl/
