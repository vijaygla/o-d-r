#!/bin/bash

# Run all services in background
echo "Starting IdentityService..."
dotnet /app/IdentityService/IdentityService.API.dll &

echo "Starting CategoryService..."
dotnet /app/CategoryService/CategoryService.API.dll &

echo "Starting CourseService..."
dotnet /app/CourseService/CourseService.API.dll &

echo "Starting ContentService..."
dotnet /app/ContentService/ContentService.API.dll &

echo "Starting EnrollmentService..."
dotnet /app/EnrollmentService/EnrollmentService.API.dll &

echo "Starting ProgressService..."
dotnet /app/ProgressService/ProgressService.API.dll &

echo "Starting AssessmentService..."
dotnet /app/AssessmentService/AssessmentService.API.dll &

echo "Starting CertificateService..."
dotnet /app/CertificateService/CertificateService.API.dll &

echo "Starting ReviewService..."
dotnet /app/ReviewService/ReviewService.API.dll &

echo "Starting NotificationService..."
dotnet /app/NotificationService/NotificationService.API.dll &

echo "Starting UserService..."
dotnet /app/UserService/UserService.API.dll &

echo "Starting MediaService..."
dotnet /app/MediaService/MediaService.API.dll &

echo "Starting PaymentService..."
dotnet /app/PaymentService/PaymentService.API.dll &

echo "Starting SearchService..."
dotnet /app/SearchService/SearchService.API.dll &

echo "Starting DiscussionService..."
dotnet /app/DiscussionService/DiscussionService.API.dll &

echo "Starting ApiGateway..."
dotnet /app/ApiGateway/ApiGateway.dll &

echo "✅ All services initiated. Monitoring..."

# Keep the container alive even if background services crash (Render will handle health checks)
# Use a simple wait to keep the script running
wait
