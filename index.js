import { existsSync, readFileSync, readdirSync } from "fs";
import { createTransport } from "nodemailer";
import { join, resolve } from "path";
import select from "@inquirer/select";
import dotenv from 'dotenv';

dotenv.config()

function getTransportOption() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  return {
    host,
    port,
    secure: false,
    auth: {
      user,
      pass,
    },
  };
}

const transporter = createTransport(getTransportOption());

async function main() {
  const htmlFolderPath = resolve("test_html");
  const files = readdirSync(htmlFolderPath);
  const htmlFilenames = files.filter((filename) => filename.includes(".html"));

  const selectHTMLFilename = await select({
    message: "Select HTML File",
    choices: htmlFilenames.map((filename) => ({
      name: filename,
      value: filename,
    })),
  });

  const htmlFilePath = join(htmlFolderPath, selectHTMLFilename);

  if (!existsSync(htmlFilePath)) {
    console.error("Error html file not found!");
    process.exit(1);
  }

  const info = await transporter.sendMail({
    from: process.env.SMTP_SENDER,
    to: process.env.SMTP_RECIPIENT,
    subject: "Test again email",
    html: readFileSync(htmlFilePath),
  });

  console.log("Send Email Success!");
  console.log("recepients: ", info.accepted);
}

(async () => {
  await main();
})();
