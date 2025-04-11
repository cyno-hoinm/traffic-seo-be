pipeline {
    agent any // Runs the pipeline on any available agent

    // Define tools or environment if needed
    tools {
        nodejs 'Nodejs' // Assumes a Node.js installation named 'NodeJS' in Jenkins Global Tool Configuration
    }

    // Environment variables (optional)
    environment {
        // Add any environment variables here, e.g., for testing or deployment
        NODE_ENV = 'production'
    }

    stages {
        // Stage 1: Checkout code from Git
        stage('Checkout') {
            steps {
                // Checks out the code from the configured SCM (e.g., Git)
                checkout main
            }
        }

        // Stage 2: Install dependencies
        stage('Install Dependencies') {
            steps {
                // Install Node.js dependencies using npm
                sh 'npm install'
            }
        }

        // Stage 4: Build the project
        stage('Build') {
            steps {
                // Run the build command (e.g., for a frontend app or server-side app)
                sh 'npm run build'
            }
        }

        // Stage 5: Deploy (optional)
        stage('Deploy') {
            when {
                // Only deploy if on the main branch (adjust as needed)
                branch 'main'
            }
            steps {
                // Example: Deploy to a server or service
                echo 'Deploying to production...'
                // Add deployment steps here, e.g., copying files to a server, pushing to a cloud service, etc.
                // sh 'scp -r dist/* user@server:/path/to/deploy'
            }
        }
    }

    // Post-build actions
    post {
        success {
            echo 'Build and deployment succeeded!'
            // Optionally notify success (e.g., Slack, email)
        }
        failure {
            echo 'Build failed!'
            // Optionally notify failure
        }
        always {
            // Clean up workspace after build (optional)
            cleanWs()
        }
    }
}