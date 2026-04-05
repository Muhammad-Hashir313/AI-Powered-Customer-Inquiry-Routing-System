# AI-Powered Customer Inquiry Routing System

## Problem Statement
Customer inquiries are often lost in cluttered inboxes, lack prioritization, and result in slow response times. Manual triaging leads to inefficiency and poor customer experience.

---

## Solution Overview
This system automates customer inquiry handling using AI and cloud-native architecture. It:
- Accepts inquiries via a web form
- Processes and classifies them using AI
- Prioritizes and routes them to the appropriate team
- Sends acknowledgment emails
- Stores all data for tracking, analytics, and dashboard visibility

---

## Architecture

### Flow:
1. User submits form (hosted on S3 + CloudFront)
2. API Gateway triggers Ingestion Lambda
3. Ingestion Lambda:
   - Validates input
   - Stores data in RDS (status: `PENDING`)
   - Pushes message to SQS
4. SQS triggers Processing Lambda
5. Processing Lambda:
   - Updates status → `PROCESSING`
   - Sends data to Bedrock for AI processing
   - Receives AI-generated classification, priority, and response
   - Stores AI output in RDS
   - Sends email via SES to the relevant team (Sales/Support/Billing)
   - Sends acknowledgment email to customer
   - Updates status → `COMPLETED`
6. Logs and monitoring handled via CloudWatch

---

## AWS Services Used

- **S3** → Hosts frontend static files  
- **CloudFront** → CDN for fast delivery  
- **API Gateway** → Handles incoming API requests  
- **Lambda** → Serverless compute for ingestion and processing  
- **SQS** → Message queue for decoupled architecture  
- **RDS (MySQL)** → Stores customer and inquiry data  
- **Bedrock** → AI-based classification and response generation  
- **SES** → Sends emails to customers and internal teams  
- **CloudWatch** → Logging and monitoring  

---

## Database Design

### Customer Table
- `id (UUID)`
- `name`
- `email`

### Message Table
- `id (UUID)`
- `customerId (FK)`
- `message`
- `userCategory`
- `aiCategory`
- `priority`
- `aiResponse`
- `assignedTeam`
- `status`
- `createdAt`
- `updatedAt`

---

## Workflow

- User submits inquiry through frontend  
- Data is validated and stored in database  
- Message is queued using SQS  
- Processing Lambda consumes message  
- AI (Bedrock) determines:
  - Category
  - Priority
  - Response  
- System:
  - Stores AI output
  - Sends email to appropriate team
  - Sends acknowledgment to customer  
- Data is persisted for:
  - Future analytics
  - Dashboard display
  - Team-specific views  

---

## Security Implementation

- RDS deployed in private subnet (no public access)  
- Security Groups restrict DB access to Lambda only  
- No direct external access to internal services  
- IAM roles follow **least privilege principle**  
- Controlled communication between services  

---

## Challenges & Solutions

### Issue: No logs in CloudWatch
- **Cause:** Missing logging permissions  
- **Solution:** Attached CloudWatch logging policy to Lambda  

---

### Issue: Lambda could not connect to RDS
- **Cause:** Lambda not inside VPC  
- **Solution:** Attached Lambda to VPC and configured networking  

---

### Issue: Lambda failed to respond to API Gateway
- **Cause:** No internet access from private subnet  
- **Solution:** Configured NAT Gateway for outbound access  

---

### Issue: RDS connection failure
- **Cause:** Security Group misconfiguration  
- **Solution:** Allowed inbound access from Lambda Security Group  

---

### Issue: SQS messages not visible
- **Cause:** Messages were immediately consumed by Processing Lambda  
- **Solution:** Understood event-driven consumption behavior  

---

## Cost Considerations

- Lambda costs are minimal due to serverless model  
- SQS is low-cost and efficient for decoupling  
- RDS is a steady cost component  
- Bedrock usage contributes to AI processing cost  
- NAT Gateway introduces additional networking cost  

---

## Conclusion

This project demonstrates a scalable, secure, and event-driven system that leverages AI to automate customer inquiry handling. It improves response times, ensures no request is missed, and provides structured data for internal teams and dashboards.
