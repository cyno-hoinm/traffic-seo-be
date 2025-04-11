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