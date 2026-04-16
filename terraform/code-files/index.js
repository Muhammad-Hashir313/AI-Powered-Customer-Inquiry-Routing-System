exports.handler = async (event) => {
  
  console.log("Incoming Event:");
  console.log(JSON.stringify(event, null, 2));

  // API Gateway sends body as string
  const body = JSON.parse(event.body || "{}");

  const { name, email, inquiry } = body;

  console.log("Parsed Fields:");
  console.log("Name:", name);
  console.log("Email:", email);
  console.log("Inquiry:", inquiry);

  return {
    statusCode: 200,
    body: JSON.stringify({
      message: "Inquiry received successfully",
      data: { name, email, inquiry }
    })
  };
};