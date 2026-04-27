import nodemailer, { Transporter } from "nodemailer";
import handlebars from "handlebars";
import fs from "fs";
import path from "path";
import { logger } from "../../utils/logger/logger";
import { EmailResult, TemplateData } from "../../types/email";
import config from "../app/env";

const compileTemplate = (templateName: string, data: TemplateData): string => {
  try {
    // Get template
    const templatePath = path.resolve(
      "./src/views/partials",
      `${templateName}.hbs`,
    );

    // Read the template
    const templateSource = fs.readFileSync(templatePath, "utf-8");

    // Compile the template
    const compiledTemplate = handlebars.compile(templateSource);

    // Combine template with data
    const renderedTemplate = compiledTemplate(data);

    // Get main layout
    const layoutPath = path.resolve("./src/views/layouts", "main.hbs");

    // Read the layout
    const layoutContent = fs.readFileSync(layoutPath, "utf-8");

    // Compile the layout
    const compiledLayout = handlebars.compile(layoutContent);

    // Combine layout with template
    const compiledLayoutWithTemplate = compiledLayout({
      body: renderedTemplate,
      ...data,
    });

    return compiledLayoutWithTemplate;
  } catch (error) {
    const msg = `Template compilation failed: ${error instanceof Error ? error.message : "Unknown error"}`;
    logger.error(msg);
    throw new Error(msg);
  }
};

export const sendEmail = async (
  to: string,
  subject: string,
  template: string,
  context: TemplateData,
): Promise<EmailResult> => {
  try {
    const html = compileTemplate(template, context);

    const transporter: Transporter = nodemailer.createTransport({
      host: config.mail_host,
      port: config.mail_port,
      secure: config.secure,
      auth: {
        user: config.mail_username,
        pass: config.mail_password,
      },
    });

    const mailOptions = {
      from: config.mail_from_name,
      to,
      subject,
      html,
      attachments: [
        {
          filename: "miraton-logo.png",
          path: path.resolve("public/miraton-logo.png"),
          cid: "logo", // match with `cid:` in template
        },
      ],
    };

    const result = await transporter.sendMail(mailOptions);
    return {
      success: true,
      messageId: result.messageId,
    };
  } catch (err) {
    logger.error("Error sending email: ", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
};
