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
        stage('Clear pm2') {
            steps {
                sh 'pm2 delete all || true'
            }
        }
        stage('Wait for Database') {
            steps {
                withCredentials([
                    string(credentialsId: 'DB_HOST', variable: 'DB_HOST'),
                    string(credentialsId: 'DB_PORT', variable: 'DB_PORT')
                ]) {
                    sh '''
                        # Wait for PostgreSQL to be ready (timeout after 60 seconds)
                        for i in {1..60}; do
                            if pg_isready -h $DB_HOST -p $DB_PORT; then
                                echo "Database is ready!"
                                break
                            fi
                            echo "Waiting for database... ($i/60)"
                            sleep 1
                        done
                        if ! pg_isready -h $DB_HOST -p $DB_PORT; then
                            echo "Error: Database not ready after 60 seconds"
                            exit 1
                        fi
                    '''
                }
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
                        echo "WORKER_TYPE=primary" >> .env  # Add WORKER_TYPE (adjust value as needed)
                        npm run deploy
                        pm2 save
                    '''
                }
            }
        }
        stage('Logger') {
            steps {
                sh 'pm2 logs traffic-seo-be'
            }
        }
    }
    post {
        always {
            cleanWs()
        }
    }
}