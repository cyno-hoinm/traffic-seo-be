pipeline {
    agent any
    // environment {
    //     AAA_TOP_LEVEL_VAR = 'topLevel'
    // }
    tools {
        nodejs 'Nodejs' 
    }
    stages {
        stage('test') {
            steps {
                sh 'env | sort'
            }
        }        
        // stage('Checkout') {
        //     steps {
        //         checkout scm
        //         sh 'cp /home/hoi/traffic-seo-be/.env .'
        //     }
        // }
        // stage('Install') {
        //     steps {
        //         sh 'npm install'
        //     }
        // }
        // stage('Build') {
        //     steps {
        //         sh 'npm run build'
        //     }
        // }
        // stage('Deploy') {
        //     steps {
        //         sh 'npm run deploy'
        //     }
        // }
        // stage('Logger') {
        //     steps {
        //         sh 'pm2 log'
        //     }
        // }        
    }
    post {
        always {
            cleanWs()
        }
    }
}