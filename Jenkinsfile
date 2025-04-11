pipeline {
    agent any
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
        stage('Deploy') {
            steps {
                withCredentials([
                    string(credentialsId: 'DB_HOST', variable: 'DB_HOST'),
                    string(credentialsId: 'DB_US', variable: 'DB_US'),
                    string(credentialsId: 'DB_PW', variable: 'DB_PW'),
                    string(credentialsId: 'DB_NAME', variable: 'DB_NAME'),
                    string(credentialsId: 'DB_PORT', variable: 'DB_PORT'),
                    string(credentialsId: 'JWT_SECRET', variable: 'JWT_SECRET'),
                    string(credentialsId: 'PORT', variable: 'PORT'),
                    string(credentialsId: 'JWT_EXPIRES_IN', variable: 'JWT_EXPIRES_IN'),
                    string(credentialsId: 'NODE_ENV', variable: 'NODE_ENV')
                ]) {
                    sh '''
                        # Generate .env dynamically (optional)
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

                        # Deploy with PM2
                        npm run deploy
                        pm2 save
                    '''
                }
            }
        }
        stage('Logger') {
            steps {
                sh 'pm2 logs traffic-seo-be --lines 10'
            }
        }
    }
    post {
        always {
            cleanWs()
        }
    }
}