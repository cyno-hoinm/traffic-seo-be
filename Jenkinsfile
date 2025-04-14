pipeline {
    agent any
    tools {
        nodejs 'Nodejs'
    }
    stages {
        stage('Clone Repository') {
            steps {
                withCredentials([string(credentialsId: 'SSH_KEY', variable: 'SSH_KEY')]) {
                    sh '''
                        # Check if the repository directory exists
                        if [ -d "traffic-seo-be" ]; then
                            echo "Repository exists, pulling latest from main..."
                            cd traffic-seo-be
                            git checkout main
                            git pull origin main
                        else
                            echo "Repository does not exist, cloning..."
                            git clone https://$SSH_KEY@github.com/cyno-hoinm/traffic-seo-be.git
                        fi
                    '''
                }
            }
        }
        stage('Install Dependencies') {
            steps {
                dir('traffic-seo-be') {
                    sh '''
                        npm install
                    '''
                }
            }
        }
        stage('Build') {
            steps {
                dir('traffic-seo-be') {
                    sh '''
                        npm run build
                    '''
                }
            }
        }
        stage('Deploy with PM2') {
            steps {
                dir('traffic-seo-be') {
                    sh '''
                # Use system-wide PM2 with sudo
                sudo /usr/bin/pm2 start ecosystem.config.js --update-env || { echo "PM2 start failed"; exit 1; }

                # Log PM2 status
                sudo /usr/bin/pm2 list > pm2_status.txt
            '''
                }
            }
        }
    }
    post {
        always {
            archiveArtifacts artifacts: 'traffic-seo-be/pm2_status.txt,traffic-seo-be/pm2_logs.txt', allowEmptyArchive: true
        }
    }
}