pipeline {
    agent any
    environment {
            PORT='9999'
            DB_HOST='shortline.proxy.rlwy.net'
            DB_US='postgres'
            DB_PW='AWOZHEIjajuMsmOQmbcmCLvEyYiOCfJM'
            DB_NAME='railway'
            DB_PORT='15059'
            NODE_ENV='development'
            CORS_ORIGINS='[http://localhost:3000, http://localhost:9999]'
            JWT_SECRET='MinhHoiPr0'
            JWT_EXPIRES_IN='24h'
    }
    tools {
        nodejs 'Nodejs' 
    }
    stages {
        // stage('test') {
        //     steps {
        //         sh 'env | sort'
        //     }
        // }        
        stage('Checkout') {
            steps {
                checkout scm
                sh 'cp /home/hoi/traffic-seo-be/.env .'
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
                sh 'npm run deploy'
            }
        }
        stage('Logger') {
            steps {
                sh 'pm2 log'
            }
        }        
    }
    post {
        always {
            cleanWs()
        }
    }
}