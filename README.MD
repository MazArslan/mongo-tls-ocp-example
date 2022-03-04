Creating a mongoDB Server on Openshift


## Use developer view add - database - mongo emptheral ?? MAYBE NOT

oc import image mongo:latest --confirm

pulls image from docker hub

## to start the DB

cd node-rest-api

npm start


## to start the angular app  
cd my-app

ng serve --open


## Run node server for API/CRUD operations

npm start


## stop mongodb

sudo systemctl stop mongodb.service

## create secrets
certs/generate.sh

## run mongodb

cd certs/

sudo mongod --tlsMode requireTLS --tlsCertificateKeyFile test-server1.pem --tlsCAFile test-ca.pem --config /etc/mongod.conf

## to connect to mongo

mongo --tls -tlsCAFile test-ca.pem --tlsCertificateKeyFile test-client.pem

mongo --tls --tlsCAFile /etc/mongo/tls/ca/test-ca.pem --tlsCertificateKeyFile /etc/mongo/tls/client/test-client.pem
## setting up tls mongo on node

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

## create secrets on openshift (might be unnecceray)

oc create secret generic clientcert --from-file certs/test-client.pem

oc create secret generic servercerts --from-file certs/test-server1.pem

oc create secret generic cafile --from-file certs/test-ca.pem

## add tls to mongo on openshift

### create a config file for mongo

<!-- see `mongo-config.yaml` -->

<!-- oc apply -f mongo-config.yaml  -->

oc create configmap ca --from-file=certs/test-ca.pem

oc create configmap server --from-file=certs/test-server1.pem

oc create configmap client --from-file=certs/test-client.pem

## Create mongodb

from openshift UI in developer view, from 'container image', select 'Image stream tag from internal registry'. select mongo, mongo, as deployment config. 


## Update mongo deployment to include items

to include: 
```
spec:
  template:
    spec:
      volumes:
        - name: mongodb-data
          emptyDir: {}
        - name: mongo-config
          configMap:
            name: mongo-config
            items:
              - key: mongod.conf
                path: mongod.conf
            defaultMode: 420
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
            - name: mongodb-data
              mountPath: /var/lib/mongodb/data
            - name: mongo-config
              mountPath: /etc/mongo
            - name: cert-auth
              mountPath: /etc/mongo/tls/ca
            - name: server-cert
              mountPath: /etc/mongo/tls/server
          args:
            - '--tlsMode'
            - requireTLS
            - '--tlsCertificateKeyFile'
            - /etc/mongo/tls/server/test-server1.pem
            - '--tlsCAFile'
            - /etc/mongo/tls/ca/test-ca.pem
          
```

## Get the NODEJS App running

developer view -> from github -> node js

add to deployment.yaml
```
volumes:
        - name: cert-auth
          configMap:
            name: ca
            items:
              - key: test-ca.pem
                path: test-ca.pem
            defaultMode: 420
        - name: client-cert
          configMap:
            name: client
            items:
              - key: test-client.pem
                path: test-client.pem
            defaultMode: 420
      containers:
        - resources: {}
          terminationMessagePath: /dev/termination-log
          name: node-js-api
          env:
            - name: TLS_CA_FILE
              value: /mongo/ca/test-ca.pem
            - name: TLS_CERT_KEY_FILE
              value: /mongo/client/test-client.pem
            - name: MONGO_URL
              value: 'mongodb://mongo-ms-tls.apps.na46.prod.nextcle.com:27017/db'
          ports:
            - containerPort: 8080
              protocol: TCP
          imagePullPolicy: Always
          volumeMounts:
            - name: cert-auth
              mountPath: /mongo/ca
            - name: client-cert
              mountPath: /mongo/client

```

## Set env variables on node js

oc set env app-name MONGOURL='mongodb://<MongoDB-service-name>:21017/db'

oc set env app-name MONGOURL='mongodb://<MongoDB-service-name>:21017/db'

###

create angular using dockerfile

developer view -> dockerfile -> github url -> 

## 

```
spec:
  contianers: 
    - volumeMounts:
      - name: cert-auth
        mountPath: ~/ca
      - name: client-cert
        mounthPath: ~/client
    volumes:
      - name: cert-auth
        configMap:
            name: ca
            items:
              - key: test-ca.pem
                path: test-ca.pem
            defaultMode: 420
      - name: client-cert
        configMap:
            name: client
            items:
              - key: test-client.pem
                path: test-client.pem
            defaultMode: 420

```






### references:

https://docs.mongodb.com/manual/appendix/security/appendixA-openssl-ca/#appendix-ca-certificate
https://docs.mongodb.com/manual/appendix/security/appendixB-openssl-server/#appendix-server-certificate
https://docs.mongodb.com/manual/appendix/security/appendixC-openssl-client/
https://jamielinux.com/docs/openssl-certificate-authority/create-the-intermediate-pair.html
https://docs.mongodb.com/manual/tutorial/configure-ssl-clients/#std-label-mongo-connect-require-client-certificates-tls
https://www.tutsmake.com/angular-13-mongodb-example-with-node-js-express/
https://docs.mongodb.com/manual/tutorial/configure-ssl/
