pipeline {
    agent any
    tools {
        nodejs 'Nodejs' // Ensure this matches your Node.js tool name in Jenkins
    }
    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }
        stage('Install') {
            steps {
                bat 'npm install'
            }
        }
        stage('Build') {
            steps {
                bat 'npm run build'
            }
        }
    }
    post {
        always {
            cleanWs()
        }
    }
}