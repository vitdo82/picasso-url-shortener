import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";

// Get configuration
const config = new pulumi.Config();
const projectName = config.get("projectName") || "url-shortener";
const environment = config.get("environment") || "production";
const region = config.get("region") || "us-east-1";

// Database configuration
const dbName = config.get("dbName") || "urlshortener";
const dbUser = config.get("dbUser") || "postgres";
const dbPassword = config.requireSecret("dbPassword");

// Container configuration
const backendImage = config.get("backendImage") || `${projectName}-backend:latest`;
const frontendImage = config.get("frontendImage") || `${projectName}-frontend:latest`;
const baseUrl = config.get("baseUrl") || `https://${projectName}.com`;

// Create AWS provider
const provider = new aws.Provider("aws-provider", {
    region: region,
});

// Create Lightsail container service for backend
const backendService = new aws.lightsail.ContainerService("backend-service", {
    name: `${projectName}-backend-${environment}`,
    power: "nano", // nano, micro, small, medium, large, xlarge
    scale: 1,
    isDisabled: false,
    publicEndpointSettings: {
        containerName: "backend",
        containerPort: 8080,
        healthCheck: {
            healthyThreshold: 2,
            unhealthyThreshold: 2,
            timeoutSeconds: 5,
            intervalSeconds: 30,
            path: "/health",
            successCodes: "200",
        },
    },
    tags: {
        Environment: environment,
        Project: projectName,
        Service: "backend",
    },
}, { provider });

// Create Lightsail container service for frontend
const frontendService = new aws.lightsail.ContainerService("frontend-service", {
    name: `${projectName}-frontend-${environment}`,
    power: "nano",
    scale: 1,
    isDisabled: false,
    publicEndpointSettings: {
        containerName: "frontend",
        containerPort: 80,
        healthCheck: {
            healthyThreshold: 2,
            unhealthyThreshold: 2,
            timeoutSeconds: 5,
            intervalSeconds: 30,
            path: "/",
            successCodes: "200",
        },
    },
    tags: {
        Environment: environment,
        Project: projectName,
        Service: "frontend",
    },
}, { provider });

// Create Lightsail database (PostgreSQL)
const database = new aws.lightsail.Database("database", {
    relationalDatabaseName: `${projectName}-db-${environment}`,
    masterDatabaseName: dbName,
    masterUsername: dbUser,
    masterPassword: dbPassword,
    blueprintId: "postgres_15",
    bundleId: "micro_1_0", // micro_1_0, small_1_0, medium_1_0, large_1_0
    publiclyAccessible: false,
    tags: {
        Environment: environment,
        Project: projectName,
    },
}, { provider });

// Backend container deployment
const backendDeployment = new aws.lightsail.ContainerServiceDeploymentVersion("backend-deployment", {
    serviceName: backendService.name,
    containers: {
        backend: {
            image: backendImage,
            environment: {
                PORT: "8080",
                DB_HOST: database.masterEndpointAddress,
                DB_PORT: database.masterEndpointPort.apply(p => p.toString()),
                DB_USER: dbUser,
                DB_PASSWORD: dbPassword,
                DB_NAME: dbName,
                DB_SSLMODE: "require",
                BASE_URL: baseUrl,
                SHORT_CODE_LENGTH: "6",
            },
            ports: {
                "8080": "HTTP",
            },
        },
    },
    publicEndpoint: {
        containerName: "backend",
        containerPort: 8080,
        healthCheck: {
            healthyThreshold: 2,
            unhealthyThreshold: 2,
            timeoutSeconds: 5,
            intervalSeconds: 30,
            path: "/health",
            successCodes: "200",
        },
    },
}, { 
    provider,
    dependsOn: [backendService, database],
});

// Frontend container deployment
const frontendDeployment = new aws.lightsail.ContainerServiceDeploymentVersion("frontend-deployment", {
    serviceName: frontendService.name,
    containers: {
        frontend: {
            image: frontendImage,
            environment: {
                VITE_API_URL: pulumi.interpolate`http://${backendService.url}`,
            },
            ports: {
                "80": "HTTP",
            },
        },
    },
    publicEndpoint: {
        containerName: "frontend",
        containerPort: 80,
        healthCheck: {
            healthyThreshold: 2,
            unhealthyThreshold: 2,
            timeoutSeconds: 5,
            intervalSeconds: 30,
            path: "/",
            successCodes: "200",
        },
    },
}, { 
    provider,
    dependsOn: [frontendService, backendService],
});

// Export outputs
export const backendUrl = backendService.url;
export const frontendUrl = frontendService.url;
export const databaseEndpoint = database.masterEndpointAddress;
export const databasePort = database.masterEndpointPort;
export const backendServiceName = backendService.name;
export const frontendServiceName = frontendService.name;
export const databaseName = database.relationalDatabaseName;

