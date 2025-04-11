pipeline {
    agent any
    environment {
        DB_HOST = credentials('DB_HOST')
        DB_US = credentials('DB_US')
        DB_PW = credentials('DB_PW')
        DB_NAME = credentials('DB_NAME')
        DB_PORT = credentials('DB_PORT')
        JWT_SECRET = credentials('JWT_SECRET')
        PORT = credentials('PORT')
        JWT_EXPIRES_IN = credentials('JWT_EXPIRES_IN')
        NODE_ENV = credentials('NODE_ENV')
    }
    tools {
        nodejs 'Nodejs'
    }
    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }
        stage('Install') {
            steps {
                sh 'npm install'
            }
        }
        stage('Build') {
            steps {
                sh 'npm run build'
            }
        }
        stage('Clear pm2') {
            steps {
                sh 'pm2 delete all || true'
            }
        }
        stage('Deploy') {
            steps {
                sh '''
                    echo "PORT=$PORT" > .env
                    echo "DB_HOST=$DB_HOST" >> .env
                    echo "DB_US=$DB_US" >> .env
                    echo "DB_PW=$DB_PW" >> .env
                    echo "DB_NAME=$DB_NAME" >> .env
                    echo "DB_PORT=$DB_PORT" >> .env
                    echo "NODE_ENV=$NODE_ENV" >> .env
                    echo "CORS_ORIGINS=[http://localhost:3000, http://localhost:$PORT]" >> .env
                    echo "JWT_SECRET=$JWT_SECRET" >> .env
                    echo "JWT_EXPIRES_IN=$JWT_EXPIRES_IN" >> .env
                    npm run deploy
                    pm2 save
                '''
            }
        }
        stage('Logger') {
            steps {
                sh 'pm2 logs traffic-seo-be --lines 50'
            }
        }
    }
    post {
        always {
            cleanWs()
        }
    }
}