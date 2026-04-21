const { BedrockRuntimeClient, InvokeModelCommand } = require("@aws-sdk/client-bedrock-runtime");
const { SNSClient, PublishCommand } = require("@aws-sdk/client-sns");
const { SESClient, SendEmailCommand } = require("@aws-sdk/client-ses");

const bedrock = new BedrockRuntimeClient({ region: "us-east-1" });
const sns = new SNSClient({ region: "us-east-1" });
const ses = new SESClient({ region: "us-east-1" });

exports.handler = async (event) => {
  for (const record of event.Records) {
    try {
      const { customerId, email, inquiry } = JSON.parse(record.body);

      // 1. Get AI Response from Claude
      const aiResponse = await getClaudeResponse(inquiry);

      // 2. Notify Departments via SNS
      await sns.send(new PublishCommand({
        TopicArn: process.env.SNS_TOPIC_ARN,
        Message: `New Inquiry from ${email}: ${inquiry}\n\nAI Drafted Response: ${aiResponse}`,
        Subject: "New Customer Inquiry Alert"
      }));

      // 3. Email Customer via SES
      await ses.send(new SendEmailCommand({
        Source: process.env.SENDER_EMAIL,
        Destination: { ToAddresses: [email] },
        Message: {
          Subject: { Data: "Update regarding your inquiry" },
          // Removed the hardcoded "Hi" here since Claude handles the greeting
          Body: { Text: { Data: aiResponse } } 
        }
      }));
      
      console.log(`Processed inquiry for ${email}`);
    } catch (error) {
      console.error("Error processing record:", error);
      throw error;
    }
  }
};

async function getClaudeResponse(text) {
  const command = new InvokeModelCommand({
    modelId: "anthropic.claude-3-haiku-20240307-v1:0",
    contentType: "application/json",
    body: JSON.stringify({
      anthropic_version: "bedrock-2023-05-31",
      max_tokens: 600,
      system: "You are a professional customer support assistant. " +
              "GUIDELINES: " +
              "1. Start with 'Dear Customer,'. " +
              "2. Acknowledge the inquiry politely. " +
              "3. State clearly that the request has been forwarded to a representative who will contact them shortly for further details. " +
              "4. Mention 'Please do not reply to this automated email.' " +
              "5. End with 'Regards,'. " +
              "6. DO NOT use any placeholders like [Name], [Company], or brackets. " +
              "7. DO NOT ask the customer for more details yourself; just inform them a human will reach out.",
      messages: [
        { 
          role: "user", 
          content: [{ type: "text", text: `Draft a response for this inquiry: "${text}"` }] 
        }
      ]
    })
  });
  
  const res = await bedrock.send(command);
  const result = JSON.parse(new TextDecoder().decode(res.body));
  return result.content[0].text;
}