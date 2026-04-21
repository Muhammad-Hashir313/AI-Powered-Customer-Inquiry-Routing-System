exports.handler = async (event) => {
    console.log("--- Processing Lambda Started ---");
    
    // SQS sends a batch of records
    for (const record of event.Records) {
        try {
            const messageBody = JSON.parse(record.body);
            console.log("Processing Inquiry for Customer ID:", messageBody.customerId);
            console.log("Customer Email:", messageBody.email);
            console.log("Inquiry Text:", messageBody.inquiry);

            // This is where your AI logic (OpenAI/Bedrock) will eventually go
            console.log("Simulating AI analysis...");
            
            // For now, we just log it
            console.log("Successfully processed message ID:", record.messageId);
            
        } catch (error) {
            console.error("Failed to process record:", error.message);
            // Throwing an error here tells SQS the processing failed, 
            // and the message will go back to the queue to try again 
            // (until it hits your maxReceiveCount of 3).
            throw error; 
        }
    }
    
    return { status: "Batch processed" };
};